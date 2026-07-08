import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { computeSupplierCompleteness, getDb, productLines, supplierProfiles } from "@/lib/db";
import { CreateSupplierProfileSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }
  if (auth.role !== "supplier" && auth.role !== "both") {
    return errorResponse(403, "FORBIDDEN", "Only supplier accounts can create a supplier profile");
  }

  const parsed = CreateSupplierProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const { productLines: incomingLines, ...profileFields } = parsed.data;

  const completenessScore = computeSupplierCompleteness(profileFields, incomingLines ?? []);

  const db = getDb();
  const [profile] = await db
    .insert(supplierProfiles)
    .values({ ...profileFields, userId: auth.sub, completenessScore })
    .returning();

  let lines: (typeof productLines.$inferSelect)[] = [];
  if (incomingLines && incomingLines.length > 0) {
    lines = await db
      .insert(productLines)
      .values(incomingLines.map((l) => ({ ...l, supplierProfileId: profile.id })))
      .returning();
  }

  return NextResponse.json({ ...profile, productLines: lines }, { status: 201 });
}
