import { buyerProfiles, eq, getDb, matches, supplierProfiles, type BuyerProfile, type Match, type SupplierProfile } from "@/lib/db";

export type MatchParty = "supplier" | "buyer";

export type MatchAndSideResult =
  | { status: "not_found" }
  | { status: "forbidden" }
  | { status: "ok"; match: Match; side: MatchParty; supplierProfile: SupplierProfile; buyerProfile: BuyerProfile };

/** Loads a match, its two profiles, and determines which side (if any) the given user is a party to. */
export async function loadMatchAndCallerSide(matchId: string, userId: string): Promise<MatchAndSideResult> {
  const db = getDb();
  const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!match) return { status: "not_found" };

  const [[supplierProfile], [buyerProfile]] = await Promise.all([
    db.select().from(supplierProfiles).where(eq(supplierProfiles.id, match.supplierProfileId)).limit(1),
    db.select().from(buyerProfiles).where(eq(buyerProfiles.id, match.buyerProfileId)).limit(1),
  ]);
  if (!supplierProfile || !buyerProfile) return { status: "not_found" };

  if (supplierProfile.userId === userId) return { status: "ok", match, side: "supplier", supplierProfile, buyerProfile };
  if (buyerProfile.userId === userId) return { status: "ok", match, side: "buyer", supplierProfile, buyerProfile };

  return { status: "forbidden" };
}
