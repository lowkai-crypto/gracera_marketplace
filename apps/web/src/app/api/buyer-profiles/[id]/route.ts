import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { buyerProfiles, computeBuyerProfileCompleteness, eq, getDb } from "@/lib/db";
import { UpdateBuyerProfileSchema } from "@/lib/schemas";

// Contact details are never public — see supplier-profiles/[id]/route.ts note.
function toPublic<T extends Record<string, unknown>>(profile: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primaryContactEmail, primaryContactPhone, ...rest } = profile;
  return rest;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [profile] = await db.select().from(buyerProfiles).where(eq(buyerProfiles.id, id)).limit(1);
  if (!profile || profile.profileStatus === "deleted") {
    return errorResponse(404, "NOT_FOUND", "Buyer profile not found");
  }
  return NextResponse.json(toPublic(profile));
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

  const db = getDb();
  const [existing] = await db.select().from(buyerProfiles).where(eq(buyerProfiles.id, id)).limit(1);
  if (!existing || existing.profileStatus === "deleted") {
    return errorResponse(404, "NOT_FOUND", "Buyer profile not found");
  }
  if (existing.userId !== auth.sub) {
    return errorResponse(403, "FORBIDDEN", "You do not own this profile");
  }

  const parsed = UpdateBuyerProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const merged = { ...existing, ...parsed.data };
  const completenessScore = computeBuyerProfileCompleteness(merged);

  const [updated] = await db
    .update(buyerProfiles)
    .set({ ...parsed.data, completenessScore, updatedAt: new Date() })
    .where(eq(buyerProfiles.id, id))
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

  const db = getDb();
  const [existing] = await db.select().from(buyerProfiles).where(eq(buyerProfiles.id, id)).limit(1);
  if (!existing) return errorResponse(404, "NOT_FOUND", "Buyer profile not found");
  if (existing.userId !== auth.sub) {
    return errorResponse(403, "FORBIDDEN", "You do not own this profile");
  }

  await db
    .update(buyerProfiles)
    .set({ profileStatus: "deleted", updatedAt: new Date() })
    .where(eq(buyerProfiles.id, id));

  return new NextResponse(null, { status: 204 });
}
