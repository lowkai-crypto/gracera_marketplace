import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { and, buyerProfiles, deals, eq, getDb, inArray, or, supplierProfiles } from "@/lib/db";

// docs/10-api-reference.md's literal `GET /deals?user_id={id}` would let
// anyone view anyone's deals just by knowing their user ID — this scopes
// to the authenticated caller instead, same as GET /api/matches.
export async function GET(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");

  const db = getDb();
  const [[mySupplierProfile], [myBuyerProfile]] = await Promise.all([
    db.select().from(supplierProfiles).where(eq(supplierProfiles.userId, auth.sub)).limit(1),
    db.select().from(buyerProfiles).where(eq(buyerProfiles.userId, auth.sub)).limit(1),
  ]);

  if (!mySupplierProfile && !myBuyerProfile) {
    return NextResponse.json({ deals: [], total: 0 });
  }

  const ownershipFilter = or(
    mySupplierProfile ? eq(deals.supplierProfileId, mySupplierProfile.id) : undefined,
    myBuyerProfile ? eq(deals.buyerProfileId, myBuyerProfile.id) : undefined,
  );
  type DealStage = "messaging" | "rfq_issued" | "quote_submitted" | "deal_room" | "closed" | "abandoned";
  const conditions = [ownershipFilter, stage ? eq(deals.stage, stage as DealStage) : undefined].filter(
    (c): c is NonNullable<typeof c> => c !== undefined,
  );

  const rows = await db.select().from(deals).where(and(...conditions));

  const supplierSideIds = rows.filter((d) => d.supplierProfileId === mySupplierProfile?.id).map((d) => d.buyerProfileId);
  const buyerSideIds = rows.filter((d) => d.buyerProfileId === myBuyerProfile?.id).map((d) => d.supplierProfileId);

  const [buyerCounterparts, supplierCounterparts] = await Promise.all([
    supplierSideIds.length ? db.select().from(buyerProfiles).where(inArray(buyerProfiles.id, supplierSideIds)) : [],
    buyerSideIds.length ? db.select().from(supplierProfiles).where(inArray(supplierProfiles.id, buyerSideIds)) : [],
  ]);
  const buyerCounterpartsById = new Map(buyerCounterparts.map((c) => [c.id, c]));
  const supplierCounterpartsById = new Map(supplierCounterparts.map((c) => [c.id, c]));

  const results = rows
    .map((d) => {
      const iAmSupplier = d.supplierProfileId === mySupplierProfile?.id;
      const counterpart = iAmSupplier ? buyerCounterpartsById.get(d.buyerProfileId) : supplierCounterpartsById.get(d.supplierProfileId);
      return {
        id: d.id,
        stage: d.stage,
        counterpartProfile: counterpart ?? null,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        closedAt: d.closedAt,
      };
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return NextResponse.json({ deals: results, total: results.length });
}
