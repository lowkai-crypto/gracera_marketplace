import { NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-error";
import { and, buyerProfiles, desc, eq, getDb, inArray, supplierProfiles, verificationRequests } from "@/lib/db";

const PAGE_SIZE = 50;

// docs/20 §3: business-registration + cert-upload AI triage feed. There's no
// status column on verification_requests by design (see the comment on the
// table in schema.ts) -- this queue is "AI triage results for profiles still
// at verificationLevel = 'basic'", not a formal pending/cleared lifecycle.
export async function GET(request: Request) {
  try {
    await requireAdminRole(request, { roles: ["trust_team", "super_admin"] });
  } catch (err) {
    return authErrorResponse(err);
  }

  const db = getDb();
  const triageRows = await db
    .select()
    .from(verificationRequests)
    .orderBy(desc(verificationRequests.createdAt))
    .limit(PAGE_SIZE);

  const supplierProfileIds = triageRows.map((r) => r.supplierProfileId).filter((id) => id !== null);
  const buyerProfileIds = triageRows.map((r) => r.buyerProfileId).filter((id) => id !== null);

  const [basicSuppliers, basicBuyers] = await Promise.all([
    supplierProfileIds.length
      ? db
          .select()
          .from(supplierProfiles)
          .where(and(inArray(supplierProfiles.id, supplierProfileIds), eq(supplierProfiles.verificationLevel, "basic")))
      : Promise.resolve([]),
    buyerProfileIds.length
      ? db
          .select()
          .from(buyerProfiles)
          .where(and(inArray(buyerProfiles.id, buyerProfileIds), eq(buyerProfiles.verificationLevel, "basic")))
      : Promise.resolve([]),
  ]);

  const supplierById = new Map(basicSuppliers.map((p) => [p.id, p]));
  const buyerById = new Map(basicBuyers.map((p) => [p.id, p]));

  const results = triageRows
    .map((row) => {
      const profile = row.supplierProfileId
        ? supplierById.get(row.supplierProfileId)
        : row.buyerProfileId
          ? buyerById.get(row.buyerProfileId)
          : undefined;
      // Already verified (or profile deleted) since this triage ran -- drop
      // it from the queue rather than showing a stale entry.
      if (!profile) return null;

      return {
        id: row.id,
        profileType: row.profileType,
        profileId: profile.id,
        companyName: profile.companyName,
        displayName: profile.displayName,
        triageSummary: row.triageSummary,
        triageFlags: row.triageFlags,
        createdAt: row.createdAt,
      };
    })
    .filter((r) => r !== null);

  return NextResponse.json({ results });
}
