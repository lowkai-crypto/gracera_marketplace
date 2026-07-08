import type { BuyerProfile, ProductLine, SourcingRequest, SupplierProfile } from "./schema";

type Nullable<T> = { [K in keyof T]?: T[K] | null };

/** Only the fields needed to judge product-line completeness — callers can
 * pass either a full DB row or a not-yet-persisted create/update payload. */
export type ProductLineLike = Pick<
  ProductLine,
  "name" | "description" | "unit" | "moq" | "moqUnit" | "leadTimeDays" | "sampleAvailable"
>;

function presentRatio<T extends object>(obj: Nullable<T>, keys: (keyof T)[]): number {
  if (keys.length === 0) return 1;
  const filled = keys.filter((k) => isPresent(obj[k])).length;
  return filled / keys.length;
}

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

// ── Supplier profile — docs/05-supplier-profile-spec.md §2 ────────────────
// Section weights are fully specified in the docs; required-vs-optional
// fields within a section are enforced separately by request validation
// (see apps/web route handlers) — this score measures fill-rate, not just
// "did you satisfy the minimum to save a draft."

const SUPPLIER_SECTION_WEIGHTS = {
  companyIdentity: 0.15,
  productsAndServices: 0.3,
  certifications: 0.1,
  targetMarket: 0.3,
  capabilities: 0.1,
  references: 0.05,
} as const;

const COMPANY_IDENTITY_FIELDS: (keyof SupplierProfile)[] = [
  "companyName",
  "displayName",
  "country",
  "headquartersCity",
  "companySize",
  "businessRegNumber",
  "tagline",
  "description",
];

const TARGET_MARKET_FIELDS: (keyof SupplierProfile)[] = [
  "targetGeographies",
  "targetCustomerTypes",
  "idealCustomerDescription",
  "preferredDealTypes",
  "languagesSpoken",
];

const CAPABILITIES_FIELDS: (keyof SupplierProfile)[] = [
  "annualRevenueRange",
  "productionCapacityMonthly",
  "qualityControlProcess",
];

const REFERENCES_FIELDS: (keyof SupplierProfile)[] = ["notableCustomers", "referencesAvailable"];

function isCompleteProductLine(line: ProductLineLike): boolean {
  return (
    isPresent(line.name) &&
    isPresent(line.description) &&
    isPresent(line.unit) &&
    isPresent(line.moq) &&
    isPresent(line.moqUnit) &&
    isPresent(line.leadTimeDays) &&
    line.sampleAvailable !== null &&
    line.sampleAvailable !== undefined
  );
}

export function computeSupplierCompleteness(
  profile: Nullable<SupplierProfile>,
  productLines: ProductLineLike[] = [],
): number {
  const productsAndServicesScore =
    (isPresent(profile.supplierType) ? 1 / 3 : 0) +
    (isPresent(profile.categories) ? 1 / 3 : 0) +
    (productLines.some(isCompleteProductLine) ? 1 / 3 : 0);

  const sections = {
    companyIdentity: presentRatio(profile, COMPANY_IDENTITY_FIELDS),
    productsAndServices: productsAndServicesScore,
    certifications: isPresent(profile.certifications) ? 1 : 0,
    targetMarket: presentRatio(profile, TARGET_MARKET_FIELDS),
    capabilities: presentRatio(profile, CAPABILITIES_FIELDS),
    references: presentRatio(profile, REFERENCES_FIELDS),
  };

  const score = (Object.keys(SUPPLIER_SECTION_WEIGHTS) as (keyof typeof SUPPLIER_SECTION_WEIGHTS)[]).reduce(
    (sum, key) => sum + sections[key] * SUPPLIER_SECTION_WEIGHTS[key],
    0,
  );

  return Math.round(score * 100);
}

// docs/05 §1.7 contact fields are Required: Yes but aren't part of the
// weighted completeness score (no "Contact" section in the docs/05 §2 table)
// — they're enforced here as a publish gate only.
const SUPPLIER_CONTACT_REQUIRED_FIELDS: (keyof SupplierProfile)[] = [
  "primaryContactName",
  "primaryContactRole",
  "primaryContactEmail",
];

const SUPPLIER_REQUIRED_FIELDS: (keyof SupplierProfile)[] = [
  ...COMPANY_IDENTITY_FIELDS,
  "supplierType",
  "categories",
  ...TARGET_MARKET_FIELDS,
  ...SUPPLIER_CONTACT_REQUIRED_FIELDS,
];

/** docs/05 §5.1 step 3: profile below 60% completeness cannot be published. */
export function canPublishSupplierProfile(
  profile: Nullable<SupplierProfile>,
  productLines: ProductLineLike[] = [],
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const missing = SUPPLIER_REQUIRED_FIELDS.filter((f) => !isPresent(profile[f]));
  if (missing.length > 0) reasons.push(`Missing required fields: ${missing.join(", ")}`);
  if (productLines.length === 0 || !productLines.some(isCompleteProductLine)) {
    reasons.push("At least one complete product line is required");
  }
  const score = computeSupplierCompleteness(profile, productLines);
  if (score < 60) reasons.push(`Completeness score ${score} is below the 60% publish threshold`);
  return { ok: reasons.length === 0, reasons };
}

// ── Buyer profile ───────────────────────────────────────────────────────
// docs/06 doesn't give an explicit section-weighted formula for the buyer
// company profile (only for sourcing requests, below) — simple presence
// ratio across all optional-and-required fields.

const BUYER_PROFILE_FIELDS: (keyof BuyerProfile)[] = [
  "companyName",
  "displayName",
  "country",
  "headquartersCity",
  "companySize",
  "businessRegNumber",
  "industry",
  "buyerType",
  "annualPurchasingVolume",
  "preferredSupplierCountries",
  "languagesSpoken",
  "primaryContactName",
  "primaryContactRole",
];

export function computeBuyerProfileCompleteness(profile: Nullable<BuyerProfile>): number {
  return Math.round(presentRatio(profile, BUYER_PROFILE_FIELDS) * 100);
}

// ── Sourcing request — docs/06-buyer-profile-spec.md §3 ───────────────────

const SOURCING_SECTION_WEIGHTS = {
  productRequirements: 0.35,
  supplierRequirements: 0.2,
  dealParameters: 0.15,
  idealSupplierDescription: 0.3,
} as const;

const PRODUCT_REQUIREMENT_FIELDS: (keyof SourcingRequest)[] = [
  "productName",
  "quantityRequired",
  "quantityUnit",
  "orderFrequency",
  "sampleRequired",
];

const SUPPLIER_REQUIREMENT_FIELDS: (keyof SourcingRequest)[] = [
  "preferredSupplierTypes",
  "preferredSupplierCountries",
  "excludedSupplierCountries",
  "maxLeadTimeDays",
  "maxMoq",
  "auditRequired",
  "privateLabelNeeded",
  "oemNeeded",
];

const DEAL_PARAMETER_FIELDS: (keyof SourcingRequest)[] = [
  "targetUnitPriceUsd",
  "budgetRange",
  "dealTimeline",
];

export function computeSourcingRequestCompleteness(request: Nullable<SourcingRequest>): number {
  const sections = {
    productRequirements: presentRatio(request, PRODUCT_REQUIREMENT_FIELDS),
    supplierRequirements: presentRatio(request, SUPPLIER_REQUIREMENT_FIELDS),
    dealParameters: presentRatio(request, DEAL_PARAMETER_FIELDS),
    idealSupplierDescription: isPresent(request.idealSupplierDescription) ? 1 : 0,
  };

  const score = (Object.keys(SOURCING_SECTION_WEIGHTS) as (keyof typeof SOURCING_SECTION_WEIGHTS)[]).reduce(
    (sum, key) => sum + sections[key] * SOURCING_SECTION_WEIGHTS[key],
    0,
  );

  return Math.round(score * 100);
}

const SOURCING_REQUIRED_FIELDS: (keyof SourcingRequest)[] = [
  "title",
  "description",
  "category",
  "expiresAt",
  "productName",
  "quantityRequired",
  "quantityUnit",
  "orderFrequency",
  "sampleRequired",
  "idealSupplierDescription",
];

/** docs/06 §3: requests below 50% are flagged before publishing. */
export function canPublishSourcingRequest(request: Nullable<SourcingRequest>): {
  ok: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const missing = SOURCING_REQUIRED_FIELDS.filter((f) => !isPresent(request[f]));
  if (missing.length > 0) reasons.push(`Missing required fields: ${missing.join(", ")}`);
  const score = computeSourcingRequestCompleteness(request);
  if (score < 50) reasons.push(`Completeness score ${score} is below the 50% publish threshold`);
  return { ok: reasons.length === 0, reasons };
}
