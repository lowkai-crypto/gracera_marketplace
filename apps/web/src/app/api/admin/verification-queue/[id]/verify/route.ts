import { NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse, errorResponse } from "@/lib/api-error";
import { writeAuditLog } from "@/lib/audit";
import { buyerProfiles, eq, getDb, supplierProfiles, verificationRequests } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let auth;
  try {
    auth = await requireAdminRole(request, { roles: ["trust_team", "super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const { id } = await params;
  const db = getDb();
  const [triageRow] = await db.select().from(verificationRequests).where(eq(verificationRequests.id, id)).limit(1);
  if (!triageRow) return errorResponse(404, "NOT_FOUND", "No verification request with that id");

  const table = triageRow.profileType === "supplier" ? supplierProfiles : buyerProfiles;
  const profileId = triageRow.profileType === "supplier" ? triageRow.supplierProfileId : triageRow.buyerProfileId;
  if (!profileId) return errorResponse(404, "NOT_FOUND", "Triage row has no linked profile");

  const [profile] = await db.select().from(table).where(eq(table.id, profileId)).limit(1);
  if (!profile) return errorResponse(404, "NOT_FOUND", "Profile not found");

  await db.update(table).set({ verificationLevel: "verified" }).where(eq(table.id, profileId));
  await writeAuditLog(db, {
    actorType: "admin",
    actorId: auth.sub,
    action: "admin.verification.mark_verified",
    entityType: triageRow.profileType,
    entityId: profileId,
    before: { verificationLevel: profile.verificationLevel },
    after: { verificationLevel: "verified" },
  });

  return NextResponse.json({ profileId, verificationLevel: "verified" });
}
