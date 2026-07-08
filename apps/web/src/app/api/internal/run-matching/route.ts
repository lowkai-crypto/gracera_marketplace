import { NextResponse } from "next/server";

import { AuthError, requireInternalSecret } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import {
  buyerProfiles,
  eq,
  getDb,
  matches,
  passesHardFilters,
  productLines,
  sourcingRequests,
  supplierProfiles,
  verificationBonus,
  type BuyerProfile,
  type ProductLine,
  type SourcingRequest,
  type SupplierProfile,
} from "@/lib/db";

// docs/07-matching-algorithm.md §7: this endpoint is the "daily batch"
// trigger. Publish/update-triggered immediate re-matching is deferred —
// see the Matches v0 plan's deferred list (needs a queue to do safely).
const MATCH_EXPIRY_DAYS = 30;
const SURFACE_THRESHOLD = 40; // docs/07 §6 — below this, "Not surfaced"

function pickRepresentativeProductLine(lines: ProductLine[]): ProductLine | null {
  if (lines.length === 0) return null;
  return lines.reduce((min, line) => (line.moq < min.moq ? line : min));
}

function buildSupplierInput(supplier: SupplierProfile, lines: ProductLine[]) {
  const line = pickRepresentativeProductLine(lines);
  if (
    !line ||
    !supplier.country ||
    !supplier.categories?.length ||
    !supplier.targetGeographies?.length ||
    !supplier.idealCustomerDescription ||
    !supplier.languagesSpoken?.length
  ) {
    return null;
  }
  return {
    company_name: supplier.companyName ?? "",
    country: supplier.country,
    categories: supplier.categories,
    target_geographies: supplier.targetGeographies,
    moq: line.moq,
    moq_unit: line.moqUnit,
    lead_time_days: line.leadTimeDays,
    certifications: supplier.certifications ?? [],
    target_customer_types: supplier.targetCustomerTypes ?? [],
    ideal_customer_description: supplier.idealCustomerDescription,
    languages_spoken: supplier.languagesSpoken,
  };
}

function buildBuyerInput(buyer: BuyerProfile, sourcingRequest: SourcingRequest) {
  if (
    !buyer.country ||
    !sourcingRequest.category ||
    !sourcingRequest.quantityRequired ||
    !sourcingRequest.quantityUnit ||
    !sourcingRequest.idealSupplierDescription ||
    !buyer.languagesSpoken?.length
  ) {
    return null;
  }
  return {
    company_name: buyer.companyName ?? "",
    country: buyer.country,
    category: sourcingRequest.category,
    quantity_required: sourcingRequest.quantityRequired,
    quantity_unit: sourcingRequest.quantityUnit,
    required_certifications: sourcingRequest.requiredCertifications ?? [],
    buyer_type: buyer.buyerType ?? [],
    ideal_supplier_description: sourcingRequest.idealSupplierDescription,
    languages_spoken: buyer.languagesSpoken,
  };
}

export async function POST(request: Request) {
  try {
    requireInternalSecret(request);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(401, "UNAUTHORIZED", err.message);
    throw err;
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) {
    return errorResponse(500, "MISCONFIGURED", "AI_SERVICE_URL is not set");
  }

  const db = getDb();

  const [activeSuppliers, openRequests, existingMatches] = await Promise.all([
    db.select().from(supplierProfiles).where(eq(supplierProfiles.profileStatus, "active")),
    db.select().from(sourcingRequests).where(eq(sourcingRequests.status, "open")),
    db.select({ supplierProfileId: matches.supplierProfileId, sourcingRequestId: matches.sourcingRequestId }).from(matches),
  ]);

  const allProductLines = await db.select().from(productLines);
  const productLinesBySupplier = new Map<string, ProductLine[]>();
  for (const line of allProductLines) {
    const list = productLinesBySupplier.get(line.supplierProfileId) ?? [];
    list.push(line);
    productLinesBySupplier.set(line.supplierProfileId, list);
  }

  // Unlike supplier_profiles, buyer_profiles has no "active" publish gate
  // anywhere in the app today — a buyer profile is usable as soon as it
  // exists, until soft-deleted. Filtering by `profileStatus = "active"`
  // here would silently match zero buyers ever.
  const buyers = await db.select().from(buyerProfiles);
  const buyersById = new Map(buyers.filter((b) => b.profileStatus !== "deleted").map((b) => [b.id, b]));

  const alreadyScored = new Set(
    existingMatches.map((m) => `${m.supplierProfileId}:${m.sourcingRequestId}`),
  );

  let pairsEvaluated = 0;
  let matchesCreated = 0;
  let skipped = 0;
  let errors = 0;

  for (const supplier of activeSuppliers) {
    const lines = productLinesBySupplier.get(supplier.id) ?? [];

    for (const sourcingRequest of openRequests) {
      const buyer = buyersById.get(sourcingRequest.buyerProfileId);
      if (!buyer) continue;
      if (alreadyScored.has(`${supplier.id}:${sourcingRequest.id}`)) continue;

      pairsEvaluated++;
      if (!passesHardFilters(supplier, lines, buyer, sourcingRequest)) continue;

      const supplierInput = buildSupplierInput(supplier, lines);
      const buyerInput = buildBuyerInput(buyer, sourcingRequest);
      if (!supplierInput || !buyerInput) {
        skipped++;
        continue;
      }

      const avgCompleteness = (supplier.completenessScore + buyer.completenessScore) / 2;
      const avgVerificationBonus =
        (verificationBonus(supplier.verificationLevel) + verificationBonus(buyer.verificationLevel)) / 2;

      let scoreResponse: { semantic_score: number; final_score: number; dimensions: unknown; summary: string };
      try {
        const upstream = await fetch(`${aiServiceUrl}/match/score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.AI_SERVICE_SECRET ? { "x-internal-secret": process.env.AI_SERVICE_SECRET } : {}),
          },
          body: JSON.stringify({
            supplier: supplierInput,
            buyer: buyerInput,
            bonuses: { profile_completeness: avgCompleteness, verification_bonus: avgVerificationBonus },
          }),
        });
        if (!upstream.ok) {
          errors++;
          continue;
        }
        scoreResponse = await upstream.json();
      } catch (err) {
        console.error("[run-matching] fetch to ai-service failed:", err);
        errors++;
        continue;
      }

      if (scoreResponse.final_score < SURFACE_THRESHOLD) continue;

      await db.insert(matches).values({
        supplierProfileId: supplier.id,
        buyerProfileId: buyer.id,
        sourcingRequestId: sourcingRequest.id,
        aiScore: scoreResponse.semantic_score,
        finalScore: scoreResponse.final_score,
        aiRationale: { dimensions: scoreResponse.dimensions, summary: scoreResponse.summary },
        expiresAt: new Date(Date.now() + MATCH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      });
      matchesCreated++;
    }
  }

  return NextResponse.json({ pairsEvaluated, matchesCreated, skipped, errors });
}
