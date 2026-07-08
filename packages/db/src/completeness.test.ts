import { describe, expect, it } from "vitest";
import {
  canPublishSourcingRequest,
  canPublishSupplierProfile,
  computeBuyerProfileCompleteness,
  computeSourcingRequestCompleteness,
  computeSupplierCompleteness,
} from "./completeness";
import type { BuyerProfile, ProductLine, SourcingRequest, SupplierProfile } from "./schema";

const EMPTY_SUPPLIER: Partial<SupplierProfile> = {};

const FULL_SUPPLIER: Partial<SupplierProfile> = {
  companyName: "Jangdok Foods",
  displayName: "Jangdok",
  country: "KR",
  headquartersCity: "Seoul",
  companySize: "medium",
  businessRegNumber: "123-45-67890",
  tagline: "Korean fermented condiments",
  description: "A description of the company.",
  supplierType: ["manufacturer"],
  categories: ["food-ingredients/sauces-condiments"],
  targetGeographies: ["US"],
  targetCustomerTypes: ["distributor"],
  idealCustomerDescription: "Mid-size US distributors.",
  preferredDealTypes: ["annual_contract"],
  languagesSpoken: ["ko", "en"],
  annualRevenueRange: "2m_10m",
  productionCapacityMonthly: "50,000 units/month",
  qualityControlProcess: "In-house QC lab",
  certifications: ["FDA", "HACCP"],
  notableCustomers: ["Acme Corp"],
  referencesAvailable: true,
  primaryContactName: "Jane Kim",
  primaryContactRole: "export_sales_director",
  primaryContactEmail: "jane@jangdokfoods.example",
};

const COMPLETE_PRODUCT_LINE: ProductLine = {
  id: "11111111-1111-1111-1111-111111111111",
  supplierProfileId: "22222222-2222-2222-2222-222222222222",
  name: "Gochujang",
  description: "Fermented chili paste",
  hsCode: null,
  unit: "case",
  moq: 500,
  moqUnit: "cases",
  priceMinUsd: null,
  priceMaxUsd: null,
  leadTimeDays: 28,
  sampleAvailable: true,
  createdAt: new Date(),
};

describe("computeSupplierCompleteness", () => {
  it("scores an empty profile at 0", () => {
    expect(computeSupplierCompleteness(EMPTY_SUPPLIER as SupplierProfile, [])).toBe(0);
  });

  it("scores a fully-filled profile with a complete product line at 100", () => {
    expect(computeSupplierCompleteness(FULL_SUPPLIER as SupplierProfile, [COMPLETE_PRODUCT_LINE])).toBe(100);
  });

  it("scores a fully-filled profile with no product lines below 100", () => {
    const score = computeSupplierCompleteness(FULL_SUPPLIER as SupplierProfile, []);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(0);
  });
});

describe("canPublishSupplierProfile", () => {
  it("rejects an empty profile", () => {
    const result = canPublishSupplierProfile(EMPTY_SUPPLIER as SupplierProfile, []);
    expect(result.ok).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("accepts a complete profile with a valid product line", () => {
    const result = canPublishSupplierProfile(FULL_SUPPLIER as SupplierProfile, [COMPLETE_PRODUCT_LINE]);
    expect(result.ok).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("rejects a complete profile with no product lines", () => {
    const result = canPublishSupplierProfile(FULL_SUPPLIER as SupplierProfile, []);
    expect(result.ok).toBe(false);
    expect(result.reasons.some((r) => r.includes("product line"))).toBe(true);
  });
});

describe("computeBuyerProfileCompleteness", () => {
  it("scores an empty profile at 0", () => {
    expect(computeBuyerProfileCompleteness({} as BuyerProfile)).toBe(0);
  });

  it("scores a fully-filled profile at 100", () => {
    const full: Partial<BuyerProfile> = {
      companyName: "Lone Star Specialty",
      displayName: "Lone Star",
      country: "US",
      headquartersCity: "Austin",
      companySize: "medium",
      businessRegNumber: "TX-123456",
      industry: "food-ingredients",
      buyerType: ["distributor"],
      annualPurchasingVolume: "500k_2m",
      preferredSupplierCountries: ["KR"],
      languagesSpoken: ["en"],
      primaryContactName: "Jane Doe",
      primaryContactRole: "procurement_manager",
    };
    expect(computeBuyerProfileCompleteness(full as BuyerProfile)).toBe(100);
  });
});

describe("computeSourcingRequestCompleteness / canPublishSourcingRequest", () => {
  const FULL_REQUEST: Partial<SourcingRequest> = {
    title: "Sourcing: Korean hot sauce",
    description: "Looking for a reliable Korean condiment manufacturer.",
    category: "food-ingredients/sauces-condiments",
    expiresAt: new Date("2027-01-01"),
    productName: "Gochujang",
    quantityRequired: 400,
    quantityUnit: "cases",
    orderFrequency: "monthly",
    sampleRequired: true,
    idealSupplierDescription: "A Korean manufacturer with FDA and HACCP certification.",
  };

  it("scores an empty request at 0", () => {
    expect(computeSourcingRequestCompleteness({} as SourcingRequest)).toBe(0);
  });

  it("weights the required-only fields correctly (product + description sections)", () => {
    // productRequirements (0.35) + idealSupplierDescription (0.30) = 0.65 -> 65
    expect(computeSourcingRequestCompleteness(FULL_REQUEST as SourcingRequest)).toBe(65);
  });

  it("rejects a request below the 50% threshold", () => {
    const result = canPublishSourcingRequest({} as SourcingRequest);
    expect(result.ok).toBe(false);
  });

  it("accepts a request meeting required fields and the threshold", () => {
    const result = canPublishSourcingRequest(FULL_REQUEST as SourcingRequest);
    expect(result.ok).toBe(true);
    expect(result.reasons).toEqual([]);
  });
});
