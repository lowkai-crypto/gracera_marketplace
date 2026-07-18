import { NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse, errorResponse } from "@/lib/api-error";
import { writeAuditLog } from "@/lib/audit";
import { eq, getDb, sourcingRequests } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let auth;
  try {
    auth = await requireAdminRole(request, { roles: ["content_mod", "super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const { id } = await params;
  const db = getDb();
  const [sourcingRequest] = await db.select().from(sourcingRequests).where(eq(sourcingRequests.id, id)).limit(1);
  if (!sourcingRequest) return errorResponse(404, "NOT_FOUND", "No sourcing request with that id");
  if (sourcingRequest.status !== "pending_moderation") {
    return errorResponse(409, "NOT_PENDING", "This sourcing request is not awaiting moderation");
  }

  await db.update(sourcingRequests).set({ status: "open" }).where(eq(sourcingRequests.id, id));
  await writeAuditLog(db, {
    actorType: "admin",
    actorId: auth.sub,
    action: "admin.moderation.sourcing_request.approve",
    entityType: "sourcing_request",
    entityId: id,
    before: { status: "pending_moderation" },
    after: { status: "open" },
  });

  return NextResponse.json({ id, status: "open" });
}
