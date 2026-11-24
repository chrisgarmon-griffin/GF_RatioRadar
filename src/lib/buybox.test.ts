import { describe, expect, it } from "vitest";
import { maxPriceForDscr, zipRents, DEMO_ZIPS } from "./buybox";
import { computeDscr } from "./dscr";

const base = { monthlyRent: 2450, annualRate: 0.0725, downPct: 0.2, interestOnly: false, fortyYear: false };

describe("ZIP buy box", () => {
  it("returns the price at which DSCR is exactly the target", () => {
    const price = maxPriceForDscr(base);
    expect(computeDscr({ ...base, price }).dscr).toBeCloseTo(1, 9);
    const at125 = maxPriceForDscr(base, 1.25);
    expect(computeDscr({ ...base, price: at125 }).dscr).toBeCloseTo(1.25, 9);
    expect(at125).toBeLessThan(price);
  });
  it("rises with more down, a longer term and interest-only", () => {
    const p = maxPriceForDscr(base);
    expect(maxPriceForDscr({ ...base, downPct: 0.3 })).toBeGreaterThan(p);
    expect(maxPriceForDscr({ ...base, fortyYear: true })).toBeGreaterThan(p);
    expect(maxPriceForDscr({ ...base, interestOnly: true })).toBeGreaterThan(maxPriceForDscr({ ...base, fortyYear: true }));
  });
  it("scales linearly with rent", () => {
    expect(maxPriceForDscr({ ...base, monthlyRent: 4900 })).toBeCloseTo(2 * maxPriceForDscr(base), 6);
  });
  it("has sample rents for the demo ZIPs, rising with bedrooms, and nothing for others", () => {
    expect(DEMO_ZIPS.length).toBeGreaterThan(0);
    const z = zipRents("93706");
    expect(z?.rents[3]).toBe(2450);
    expect(z!.rents[2]).toBeLessThan(z!.rents[3]);
    expect(z!.rents[4]).toBeGreaterThan(z!.rents[3]);
    expect(zipRents("00000")).toBeUndefined();
  });
});
