import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { buyerProfiles, computeSourcingRequestCompleteness, eq, getDb, sourcingRequests } from "@/lib/db";
import { UpdateSourcingRequestSchema } from "@/lib/schemas";

async function loadOwnedRequest(id: string, userId: string) {
  const db = getDb();
  const [request_] = await db.select().from(sourcingRequests).where(eq(sourcingRequests.id, id)).limit(1);
  if (!request_) return { request: null, owns: false };
  const [buyerProfile] = await db
    .select()
    .from(buyerProfiles)
    .where(eq(buyerProfiles.id, request_.buyerProfileId))
    .limit(1);
  return { request: request_, owns: buyerProfile?.userId === userId };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [request_] = await db.select().from(sourcingRequests).where(eq(sourcingRequests.id, id)).limit(1);
  if (!request_) return errorResponse(404, "NOT_FOUND", "Sourcing request not found");
  return NextResponse.json(request_);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const { request: existing, owns } = await loadOwnedRequest(id, auth.sub);
  if (!existing) return errorResponse(404, "NOT_FOUND", "Sourcing request not found");
  if (!owns) return errorResponse(403, "FORBIDDEN", "You do not own this sourcing request");

  const parsed = UpdateSourcingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const merged = { ...existing, ...parsed.data };
  const completenessScore = computeSourcingRequestCompleteness(merged);

  const db = getDb();
  const [updated] = await db
    .update(sourcingRequests)
    .set({ ...parsed.data, completenessScore, updatedAt: new Date() })
    .where(eq(sourcingRequests.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const { request: existing, owns } = await loadOwnedRequest(id, auth.sub);
  if (!existing) return errorResponse(404, "NOT_FOUND", "Sourcing request not found");
  if (!owns) return errorResponse(403, "FORBIDDEN", "You do not own this sourcing request");

  const db = getDb();
  await db.update(sourcingRequests).set({ status: "closed", updatedAt: new Date() }).where(eq(sourcingRequests.id, id));

  return new NextResponse(null, { status: 204 });
}
