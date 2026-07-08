import { buyerProfiles, eq, getDb, matches, supplierProfiles, type Match } from "@/lib/db";

export type MatchParty = "supplier" | "buyer";

export type MatchAndSideResult =
  | { status: "not_found" }
  | { status: "forbidden" }
  | { status: "ok"; match: Match; side: MatchParty };

/** Loads a match and determines which side (if any) the given user is a party to. */
export async function loadMatchAndCallerSide(matchId: string, userId: string): Promise<MatchAndSideResult> {
  const db = getDb();
  const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!match) return { status: "not_found" };

  const [supplierProfile] = await db
    .select()
    .from(supplierProfiles)
    .where(eq(supplierProfiles.id, match.supplierProfileId))
    .limit(1);
  if (supplierProfile?.userId === userId) return { status: "ok", match, side: "supplier" };

  const [buyerProfile] = await db.select().from(buyerProfiles).where(eq(buyerProfiles.id, match.buyerProfileId)).limit(1);
  if (buyerProfile?.userId === userId) return { status: "ok", match, side: "buyer" };

  return { status: "forbidden" };
}
