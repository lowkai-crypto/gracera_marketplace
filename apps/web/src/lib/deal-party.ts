import { buyerProfiles, deals, eq, getDb, supplierProfiles, type BuyerProfile, type Deal, type SupplierProfile } from "@/lib/db";

export type DealParty = "supplier" | "buyer";

export type DealAndSideResult =
  | { status: "not_found" }
  | { status: "forbidden" }
  | { status: "ok"; deal: Deal; side: DealParty; supplierProfile: SupplierProfile; buyerProfile: BuyerProfile };

/** Loads a deal, its two profiles, and determines which side (if any) the given user is a party to. */
export async function loadDealAndCallerSide(dealId: string, userId: string): Promise<DealAndSideResult> {
  const db = getDb();
  const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
  if (!deal) return { status: "not_found" };

  const [[supplierProfile], [buyerProfile]] = await Promise.all([
    db.select().from(supplierProfiles).where(eq(supplierProfiles.id, deal.supplierProfileId)).limit(1),
    db.select().from(buyerProfiles).where(eq(buyerProfiles.id, deal.buyerProfileId)).limit(1),
  ]);
  if (!supplierProfile || !buyerProfile) return { status: "not_found" };

  if (supplierProfile.userId === userId) return { status: "ok", deal, side: "supplier", supplierProfile, buyerProfile };
  if (buyerProfile.userId === userId) return { status: "ok", deal, side: "buyer", supplierProfile, buyerProfile };

  return { status: "forbidden" };
}
