import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { deals, eq, getDb, matches, notifications, sourcingRequests } from "@/lib/db";
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

  // docs/10-api-reference.md: mutual accept auto-creates a Deal. Guarded
  // by checking for an existing deal first — accept can be called more
  // than once (e.g. a duplicate request), and `deals.match_id` is also
  // unique at the DB level as a second line of defense against the race.
  let dealId: string | undefined;
  if (bothAccepted) {
    const [existingDeal] = await db.select().from(deals).where(eq(deals.matchId, id)).limit(1);
    if (existingDeal) {
      dealId = existingDeal.id;
    } else {
      try {
        const [created] = await db
          .insert(deals)
          .values({
            matchId: id,
            supplierProfileId: updated.supplierProfileId,
            buyerProfileId: updated.buyerProfileId,
          })
          .returning();
        dealId = created.id;

        // Only on first creation — not on a repeat/idempotent accept call,
        // which would otherwise re-notify both parties every time.
        await db.insert(notifications).values([
          {
            userId: supplierProfile.userId,
            type: "match.accepted",
            title: "You have a new deal",
            body: `${buyerProfile.companyName ?? "A buyer"} accepted your introduction — start the conversation.`,
            entityType: "deal",
            entityId: created.id,
          },
          {
            userId: buyerProfile.userId,
            type: "match.accepted",
            title: "You have a new deal",
            body: `${supplierProfile.companyName ?? "A supplier"} accepted your introduction — start the conversation.`,
            entityType: "deal",
            entityId: created.id,
          },
        ]);
      } catch (err) {
        // Unique violation on deals.match_id — a concurrent accept call
        // won the race between the SELECT above and this INSERT. The
        // deal exists either way; fetch it rather than treat this as an error.
        if ((err as { code?: string }).code !== "23505") throw err;
        const [raceWinner] = await db.select().from(deals).where(eq(deals.matchId, id)).limit(1);
        dealId = raceWinner?.id;
      }
    }
  }

  return NextResponse.json({
    id: updated.id,
    supplierStatus: updated.supplierStatus,
    buyerStatus: updated.buyerStatus,
    bothAccepted,
    dealId,
  });
}
