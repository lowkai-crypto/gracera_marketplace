import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { eq, getDb, matches, sourcingRequests } from "@/lib/db";
import { loadMatchAndCallerSide } from "@/lib/match-party";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const result = await loadMatchAndCallerSide(id, auth.sub);
  if (result.status === "not_found") return errorResponse(404, "NOT_FOUND", "Match not found");
  if (result.status === "forbidden") return errorResponse(403, "FORBIDDEN", "You are not a party to this match");

  const { side, match, supplierProfile, buyerProfile } = result;
  const db = getDb();

  // A match doesn't stop existing when the underlying context goes stale,
  // but accepting one that no longer means anything (profile deleted, or
  // the sourcing request it was scored against has since closed) would
  // silently create a Deal on nothing real once Deals reads this signal.
  if (supplierProfile.profileStatus === "deleted" || buyerProfile.profileStatus === "deleted") {
    return errorResponse(409, "MATCH_STALE", "One of the profiles in this match no longer exists");
  }
  if (match.sourcingRequestId) {
    const [sourcingRequest] = await db
      .select()
      .from(sourcingRequests)
      .where(eq(sourcingRequests.id, match.sourcingRequestId))
      .limit(1);
    if (sourcingRequest && sourcingRequest.status !== "open") {
      return errorResponse(409, "MATCH_STALE", "The sourcing request behind this match is no longer open");
    }
  }

  const [updated] = await db
    .update(matches)
    .set(side === "supplier" ? { supplierStatus: "accepted" } : { buyerStatus: "accepted" })
    .where(eq(matches.id, id))
    .returning();

  const bothAccepted = updated.supplierStatus === "accepted" && updated.buyerStatus === "accepted";

  // docs/10-api-reference.md: mutual accept auto-creates a Deal. Deferred
  // here — no `deals` table exists yet; Deals v0's first job will backfill
  // one for every already-mutually-accepted match instead of building a
  // one-off insert here.
  return NextResponse.json({
    id: updated.id,
    supplierStatus: updated.supplierStatus,
    buyerStatus: updated.buyerStatus,
    bothAccepted,
  });
}
