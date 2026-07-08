import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { canPublishSupplierProfile, computeSupplierCompleteness, eq, getDb, productLines, supplierProfiles } from "@/lib/db";
import { UpdateSupplierProfileSchema } from "@/lib/schemas";

// Contact details are never public — no match/introduction flow exists yet
// to gate visibility on, so the safe default is "never public" (docs/06 §6).
function toPublic<T extends Record<string, unknown>>(profile: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primaryContactEmail, primaryContactPhone, ...rest } = profile;
  return rest;
}

async function loadProfile(id: string) {
  const db = getDb();
  const [profile] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.id, id)).limit(1);
  if (!profile) return null;
  const lines = await db.select().from(productLines).where(eq(productLines.supplierProfileId, id));
  return { profile, lines };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await loadProfile(id);
  if (!found || found.profile.profileStatus === "deleted") {
    return errorResponse(404, "NOT_FOUND", "Supplier profile not found");
  }
  return NextResponse.json({ ...toPublic(found.profile), productLines: found.lines });
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

  const found = await loadProfile(id);
  if (!found || found.profile.profileStatus === "deleted") {
    return errorResponse(404, "NOT_FOUND", "Supplier profile not found");
  }
  if (found.profile.userId !== auth.sub) {
    return errorResponse(403, "FORBIDDEN", "You do not own this profile");
  }

  const parsed = UpdateSupplierProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const { productLines: incomingLines, profileStatus, ...updates } = parsed.data;

  const db = getDb();
  let lines = found.lines;
  if (incomingLines) {
    await db.delete(productLines).where(eq(productLines.supplierProfileId, id));
    lines =
      incomingLines.length > 0
        ? await db.insert(productLines).values(incomingLines.map((l) => ({ ...l, supplierProfileId: id }))).returning()
        : [];
  }

  const merged = { ...found.profile, ...updates };
  const completenessScore = computeSupplierCompleteness(merged, lines);

  if (profileStatus === "active") {
    const { ok, reasons } = canPublishSupplierProfile(merged, lines);
    if (!ok) {
      return errorResponse(422, "INCOMPLETE_PROFILE", reasons.join("; "));
    }
  }

  const [updated] = await db
    .update(supplierProfiles)
    .set({ ...updates, ...(profileStatus ? { profileStatus } : {}), completenessScore, updatedAt: new Date() })
    .where(eq(supplierProfiles.id, id))
    .returning();

  return NextResponse.json({ ...updated, productLines: lines });
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

  const found = await loadProfile(id);
  if (!found) return errorResponse(404, "NOT_FOUND", "Supplier profile not found");
  if (found.profile.userId !== auth.sub) {
    return errorResponse(403, "FORBIDDEN", "You do not own this profile");
  }

  const db = getDb();
  await db
    .update(supplierProfiles)
    .set({ profileStatus: "deleted", updatedAt: new Date() })
    .where(eq(supplierProfiles.id, id));

  return new NextResponse(null, { status: 204 });
}
