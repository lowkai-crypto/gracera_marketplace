import { NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-error";
import { buyerProfiles, desc, eq, getDb, inArray, sourcingRequests } from "@/lib/db";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  try {
    await requireAdminRole(request, { roles: ["content_mod", "super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const db = getDb();
  const pending = await db
    .select()
    .from(sourcingRequests)
    .where(eq(sourcingRequests.status, "pending_moderation"))
    .orderBy(desc(sourcingRequests.createdAt))
    .limit(PAGE_SIZE);

  const buyerProfileIds = pending.map((r) => r.buyerProfileId);
  const buyers = buyerProfileIds.length
    ? await db.select().from(buyerProfiles).where(inArray(buyerProfiles.id, buyerProfileIds))
    : [];
  const buyerById = new Map(buyers.map((b) => [b.id, b]));

  const results = pending.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    buyerCompanyName: buyerById.get(r.buyerProfileId)?.companyName ?? null,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({ results });
}
