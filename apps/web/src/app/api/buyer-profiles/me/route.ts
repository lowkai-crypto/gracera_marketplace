import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { buyerProfiles, eq, getDb } from "@/lib/db";

// Unlike the public /[id] GET, this is the owner viewing their own data —
// contact fields are included, not stripped.
export async function GET(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const db = getDb();
  const [profile] = await db
    .select()
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, auth.sub))
    .limit(1);

  if (!profile || profile.profileStatus === "deleted") {
    return errorResponse(404, "NO_PROFILE", "You don't have a buyer profile yet");
  }

  return NextResponse.json(profile);
}
