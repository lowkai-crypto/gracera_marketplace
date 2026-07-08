import type { ProductLineLike } from "./completeness";
import type { BuyerProfile, SourcingRequest, SupplierProfile } from "./schema";

type Nullable<T> = { [K in keyof T]?: T[K] | null };

// docs/07-matching-algorithm.md §2 hard filters — everything computable from
// data already in Postgres. Active-status filtering happens in the
// caller's query (only fetch published/open rows), not here. Sanctioned
// country-pair blocking is deferred — no sanctions list exists anywhere in
// the codebase yet.

/** docs/07 §2 "Category overlap": supplier category ∩ buyer sourcing category ≠ ∅. */
function passesCategoryFilter(
  supplier: Nullable<Pick<SupplierProfile, "categories">>,
  sourcingRequest: Nullable<Pick<SourcingRequest, "category">>,
): boolean {
  if (!sourcingRequest.category || !supplier.categories?.length) return false;
  return supplier.categories.includes(sourcingRequest.category);
}

/**
 * docs/07 §2 "Geography" — checked from both angles: the supplier must
 * target the buyer's country, and if the buyer has stated a country
 * preference, the supplier's country must be in it (an unset preference
 * means "open to anywhere," not "compatible with nowhere").
 */
function passesGeographyFilter(
  supplier: Nullable<Pick<SupplierProfile, "country" | "targetGeographies">>,
  buyer: Nullable<Pick<BuyerProfile, "country" | "preferredSupplierCountries">>,
): boolean {
  if (!buyer.country || !supplier.targetGeographies?.includes(buyer.country)) return false;
  if (!supplier.country) return false;
  if (buyer.preferredSupplierCountries?.length) {
    return buyer.preferredSupplierCountries.includes(supplier.country);
  }
  return true;
}

/** docs/07 §2 "Excluded countries": supplier not in the buyer's exclusion list. */
function passesExcludedCountriesFilter(
  supplier: Nullable<Pick<SupplierProfile, "country">>,
  sourcingRequest: Nullable<Pick<SourcingRequest, "excludedSupplierCountries">>,
): boolean {
  if (!sourcingRequest.excludedSupplierCountries?.length) return true;
  if (!supplier.country) return true;
  return !sourcingRequest.excludedSupplierCountries.includes(supplier.country);
}

/**
 * docs/07 §2 "MOQ range": buyer's required quantity must meet at least one
 * of the supplier's product line MOQs, with a 20% buffer (a MOQ up to 20%
 * over the requested quantity still passes).
 */
function passesMoqFilter(
  productLines: ProductLineLike[],
  sourcingRequest: Nullable<Pick<SourcingRequest, "quantityRequired">>,
): boolean {
  if (!sourcingRequest.quantityRequired || productLines.length === 0) return false;
  return productLines.some((line) => sourcingRequest.quantityRequired! >= line.moq * 0.8);
}

export function passesHardFilters(
  supplier: Nullable<SupplierProfile>,
  productLines: ProductLineLike[],
  buyer: Nullable<BuyerProfile>,
  sourcingRequest: Nullable<SourcingRequest>,
): boolean {
  return (
    passesCategoryFilter(supplier, sourcingRequest) &&
    passesGeographyFilter(supplier, buyer) &&
    passesExcludedCountriesFilter(supplier, sourcingRequest) &&
    passesMoqFilter(productLines, sourcingRequest)
  );
}

// docs/07 §4 verification bonus point table.
const VERIFICATION_BONUS_POINTS: Record<SupplierProfile["verificationLevel"], number> = {
  basic: 0,
  verified: 5,
  certified: 10,
  premium: 15,
};

export function verificationBonus(level: SupplierProfile["verificationLevel"]): number {
  return VERIFICATION_BONUS_POINTS[level];
}

/** docs/07 §6 score thresholds — ported from apps/ai-service/matching.py::quality_label
 * so the frontend can render the same labels without a round trip. */
export function qualityLabel(finalScore: number): "Strong Match" | "Good Match" | "Potential Match" | "Not Surfaced" {
  if (finalScore >= 80) return "Strong Match";
  if (finalScore >= 60) return "Good Match";
  if (finalScore >= 40) return "Potential Match";
  return "Not Surfaced";
}
