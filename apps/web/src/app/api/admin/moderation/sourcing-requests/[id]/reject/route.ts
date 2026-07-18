import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse, errorResponse, validationErrorResponse } from "@/lib/api-error";
import { writeAuditLog } from "@/lib/audit";
import { eq, getDb, sourcingRequests } from "@/lib/db";

const RejectSchema = z.object({ reason: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let auth;
  try {
    auth = await requireAdminRole(request, { roles: ["content_mod", "super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const parsed = RejectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const { id } = await params;
  const db = getDb();
  const [sourcingRequest] = await db.select().from(sourcingRequests).where(eq(sourcingRequests.id, id)).limit(1);
  if (!sourcingRequest) return errorResponse(404, "NOT_FOUND", "No sourcing request with that id");
  if (sourcingRequest.status !== "pending_moderation") {
    return errorResponse(409, "NOT_PENDING", "This sourcing request is not awaiting moderation");
  }

  await db.update(sourcingRequests).set({ status: "rejected" }).where(eq(sourcingRequests.id, id));
  await writeAuditLog(db, {
    actorType: "admin",
    actorId: auth.sub,
    action: "admin.moderation.sourcing_request.reject",
    entityType: "sourcing_request",
    entityId: id,
    before: { status: "pending_moderation" },
    after: { status: "rejected" },
    reason: parsed.data.reason,
  });

  return NextResponse.json({ id, status: "rejected" });
}
