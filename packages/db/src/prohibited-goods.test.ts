import { describe, expect, it } from "vitest";
import { scanProhibitedGoods } from "./prohibited-goods";

describe("scanProhibitedGoods", () => {
  it("returns no matches for an ordinary sourcing request", () => {
    expect(
      scanProhibitedGoods(
        "Bulk sauces and condiments",
        "Looking for a manufacturer of fermented sauces for US grocery distribution",
      ),
    ).toEqual([]);
  });

  it("flags a firearms-related request", () => {
    expect(scanProhibitedGoods("Sourcing handgun components", null)).toContain("handgun");
  });

  it("flags counterfeit goods regardless of casing", () => {
    expect(scanProhibitedGoods("COUNTERFEIT designer bags", undefined)).toContain("counterfeit");
  });

  it("matches across multiple concatenated fields", () => {
    const result = scanProhibitedGoods("Fashion accessories", "Need a supplier of replica watch parts");
    expect(result).toContain("replica watch");
  });

  it("ignores null and undefined fields without throwing", () => {
    expect(scanProhibitedGoods(null, undefined, "")).toEqual([]);
  });
});
