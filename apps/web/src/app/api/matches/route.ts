import { NextResponse } from "next/server";

import { AuthError, requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { buyerProfiles, eq, getDb, inArray, matches, qualityLabel, sourcingRequests, supplierProfiles } from "@/lib/db";

// docs/06 §6 / docs/10: contact fields are hidden until both parties have
// accepted — same rule as the public supplier/buyer profile GETs, just
// scoped to this response instead of changing those routes' behavior.
function toPublic<T extends Record<string, unknown>>(profile: T, revealContact: boolean) {
  if (revealContact) return profile;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primaryContactEmail, primaryContactPhone, ...rest } = profile;
  return rest;
}

export async function GET(request: Request) {
  let auth;
  try {
    auth = await requireAuth(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const profileType = searchParams.get("profile_type");
  const profileId = searchParams.get("profile_id");
  if (profileType !== "supplier" && profileType !== "buyer") {
    return errorResponse(400, "VALIDATION_ERROR", "profile_type must be 'supplier' or 'buyer'", "profile_type");
  }
  if (!profileId) {
    return errorResponse(400, "VALIDATION_ERROR", "profile_id is required", "profile_id");
  }

  const db = getDb();
  const ownTable = profileType === "supplier" ? supplierProfiles : buyerProfiles;
  const [ownProfile] = await db.select().from(ownTable).where(eq(ownTable.id, profileId)).limit(1);
  if (!ownProfile) return errorResponse(404, "NOT_FOUND", `${profileType} profile not found`);
  if (ownProfile.userId !== auth.sub) return errorResponse(403, "FORBIDDEN", "You do not own this profile");

  const matchColumn = profileType === "supplier" ? matches.supplierProfileId : matches.buyerProfileId;
  const rows = await db.select().from(matches).where(eq(matchColumn, profileId));

  const counterpartTable = profileType === "supplier" ? buyerProfiles : supplierProfiles;
  const counterpartIds = [
    ...new Set(rows.map((m) => (profileType === "supplier" ? m.buyerProfileId : m.supplierProfileId))),
  ];
  const counterparts = counterpartIds.length
    ? await db.select().from(counterpartTable).where(inArray(counterpartTable.id, counterpartIds))
    : [];
  const counterpartsById = new Map(counterparts.map((c) => [c.id, c]));

  // The score/rationale alone don't tell a supplier *what* is being
  // requested — without this, they're relying entirely on Claude's one-
  // sentence summary to know what the buyer actually wants.
  const sourcingRequestIds = [...new Set(rows.map((m) => m.sourcingRequestId).filter((id): id is string => !!id))];
  const requests = sourcingRequestIds.length
    ? await db.select().from(sourcingRequests).where(inArray(sourcingRequests.id, sourcingRequestIds))
    : [];
  const requestsById = new Map(requests.map((r) => [r.id, r]));

  const sorted = [...rows].sort((a, b) => b.finalScore - a.finalScore);
  const results = sorted.map((m) => {
    const bothAccepted = m.supplierStatus === "accepted" && m.buyerStatus === "accepted";
    const counterpartId = profileType === "supplier" ? m.buyerProfileId : m.supplierProfileId;
    const counterpart = counterpartsById.get(counterpartId);
    const sourcingRequest = m.sourcingRequestId ? requestsById.get(m.sourcingRequestId) : undefined;
    const rationale = m.aiRationale as { dimensions?: unknown; summary?: string } | null;
    return {
      id: m.id,
      score: m.finalScore,
      quality: qualityLabel(m.finalScore),
      summary: rationale?.summary ?? "",
      dimensions: rationale?.dimensions ?? {},
      counterpartProfile: counterpart ? toPublic(counterpart, bothAccepted) : null,
      sourcingRequest: sourcingRequest
        ? {
            id: sourcingRequest.id,
            title: sourcingRequest.title,
            category: sourcingRequest.category,
            productName: sourcingRequest.productName,
            quantityRequired: sourcingRequest.quantityRequired,
            quantityUnit: sourcingRequest.quantityUnit,
            status: sourcingRequest.status,
          }
        : null,
      supplierStatus: m.supplierStatus,
      buyerStatus: m.buyerStatus,
      createdAt: m.createdAt,
    };
  });

  return NextResponse.json({ matches: results, total: results.length });
}
