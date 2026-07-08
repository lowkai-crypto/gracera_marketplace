import { describe, expect, it } from "vitest";
import { passesHardFilters, qualityLabel, verificationBonus } from "./matching";
import type { BuyerProfile, ProductLine, SourcingRequest, SupplierProfile } from "./schema";

const SUPPLIER: Partial<SupplierProfile> = {
  country: "KR",
  categories: ["food-ingredients/sauces-condiments"],
  targetGeographies: ["US", "CA"],
};

const BUYER: Partial<BuyerProfile> = {
  country: "US",
  preferredSupplierCountries: [],
};

const SOURCING_REQUEST: Partial<SourcingRequest> = {
  category: "food-ingredients/sauces-condiments",
  quantityRequired: 1000,
  excludedSupplierCountries: [],
};

const PRODUCT_LINE: Pick<
  ProductLine,
  "name" | "description" | "unit" | "moq" | "moqUnit" | "leadTimeDays" | "sampleAvailable"
> = {
  name: "Gochujang",
  description: "Fermented chili paste",
  unit: "case",
  moq: 500,
  moqUnit: "cases",
  leadTimeDays: 30,
  sampleAvailable: true,
};

describe("passesHardFilters", () => {
  it("passes a fully compatible pair", () => {
    expect(passesHardFilters(SUPPLIER, [PRODUCT_LINE], BUYER, SOURCING_REQUEST)).toBe(true);
  });

  it("fails on category mismatch", () => {
    expect(
      passesHardFilters(SUPPLIER, [PRODUCT_LINE], BUYER, { ...SOURCING_REQUEST, category: "electronics/pcb" }),
    ).toBe(false);
  });

  it("fails when the supplier doesn't target the buyer's country", () => {
    expect(passesHardFilters(SUPPLIER, [PRODUCT_LINE], { ...BUYER, country: "DE" }, SOURCING_REQUEST)).toBe(false);
  });

  it("fails when the buyer's preferred countries exclude the supplier", () => {
    expect(
      passesHardFilters(SUPPLIER, [PRODUCT_LINE], { ...BUYER, preferredSupplierCountries: ["VN"] }, SOURCING_REQUEST),
    ).toBe(false);
  });

  it("passes when the buyer has no stated country preference", () => {
    expect(
      passesHardFilters(SUPPLIER, [PRODUCT_LINE], { ...BUYER, preferredSupplierCountries: null }, SOURCING_REQUEST),
    ).toBe(true);
  });

  it("fails when the supplier's country is excluded by the buyer", () => {
    expect(
      passesHardFilters(SUPPLIER, [PRODUCT_LINE], BUYER, { ...SOURCING_REQUEST, excludedSupplierCountries: ["KR"] }),
    ).toBe(false);
  });

  it("fails when quantity required is below MOQ minus the 20% buffer", () => {
    expect(
      passesHardFilters(SUPPLIER, [PRODUCT_LINE], BUYER, { ...SOURCING_REQUEST, quantityRequired: 300 }),
    ).toBe(false);
  });

  it("passes within the 20% MOQ buffer", () => {
    expect(
      passesHardFilters(SUPPLIER, [PRODUCT_LINE], BUYER, { ...SOURCING_REQUEST, quantityRequired: 400 }),
    ).toBe(true);
  });

  it("fails when the supplier has no product lines", () => {
    expect(passesHardFilters(SUPPLIER, [], BUYER, SOURCING_REQUEST)).toBe(false);
  });
});

describe("verificationBonus", () => {
  it("maps each level to its docs/07 §4 point value", () => {
    expect(verificationBonus("basic")).toBe(0);
    expect(verificationBonus("verified")).toBe(5);
    expect(verificationBonus("certified")).toBe(10);
    expect(verificationBonus("premium")).toBe(15);
  });
});

describe("qualityLabel", () => {
  it("maps scores to docs/07 §6 thresholds", () => {
    expect(qualityLabel(85)).toBe("Strong Match");
    expect(qualityLabel(65)).toBe("Good Match");
    expect(qualityLabel(45)).toBe("Potential Match");
    expect(qualityLabel(20)).toBe("Not Surfaced");
  });
});
