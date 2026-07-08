import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse, validationErrorResponse } from "@/lib/api-error";
import { buyerProfiles, computeBuyerProfileCompleteness, getDb } from "@/lib/db";
import { CreateBuyerProfileSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }
  if (auth.role !== "buyer" && auth.role !== "both") {
    return errorResponse(403, "FORBIDDEN", "Only buyer accounts can create a buyer profile");
  }

  const parsed = CreateBuyerProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const completenessScore = computeBuyerProfileCompleteness(parsed.data);

  const db = getDb();
  const [profile] = await db
    .insert(buyerProfiles)
    .values({ ...parsed.data, userId: auth.sub, completenessScore })
    .returning();

  return NextResponse.json(profile, { status: 201 });
}
