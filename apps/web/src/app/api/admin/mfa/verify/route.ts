import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse, errorResponse, validationErrorResponse } from "@/lib/api-error";
import { writeAuditLog } from "@/lib/audit";
import { verifyTotpCode } from "@/lib/mfa";
import { eq, getDb, users } from "@/lib/db";

const VerifySchema = z.object({ code: z.string().length(6) });

export async function POST(request: Request) {
  let auth;
  try {
    auth = await requireAdminRole(request);
  } catch (err) {
    return authErrorResponse(err);
  }

  const parsed = VerifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  if (!user?.mfaSecretEncrypted) {
    return errorResponse(400, "NOT_ENROLLED", "Call /api/admin/mfa/enroll first");
  }
  if (!verifyTotpCode(user.mfaSecretEncrypted, parsed.data.code)) {
    return errorResponse(400, "INVALID_CODE", "That code didn't match. Try again.");
  }

  await db.update(users).set({ mfaEnabled: true }).where(eq(users.id, auth.sub));
  await writeAuditLog(db, {
    actorType: "admin",
    actorId: auth.sub,
    action: "admin.mfa.enroll",
    entityType: "user",
    entityId: auth.sub,
    before: { mfaEnabled: false },
    after: { mfaEnabled: true },
  });

  return NextResponse.json({ mfaEnabled: true });
}
