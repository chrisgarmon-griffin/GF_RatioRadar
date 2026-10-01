import { describe, expect, it } from "vitest";
import { runSearch, type SearchParams } from "./search";

const base: SearchParams = {
  states: ["CA", "TX", "FL"],
  mode: "forward",
  interestOnly: false,
  fortyYear: false,
  downPct: 0.2,
};

describe("runSearch", () => {
  it("sorts forward results by ratio, best first", async () => {
    const { rows } = await runSearch(base);
    const ratios = rows.map((r) => r.dscr);
    expect(ratios).toEqual([...ratios].sort((a, b) => b - a));
  });

  it("orders the rent range low to high", async () => {
    const { rows } = await runSearch(base);
    for (const r of rows) {
      expect(r.dscrLow).toBeLessThanOrEqual(r.dscr);
      expect(r.dscrHigh).toBeGreaterThanOrEqual(r.dscr);
    }
  });

  it("inverse mode only returns listings reachable within the down payment cap", async () => {
    const { rows } = await runSearch({ ...base, mode: "inverse", downPct: 0.3 });
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r.need.reachable).toBe(true);
      expect(r.dscr).toBeGreaterThanOrEqual(1);
    }
  });

  it("a bigger down payment cap never returns fewer inverse results", async () => {
    const low = await runSearch({ ...base, mode: "inverse", downPct: 0.2 });
    const high = await runSearch({ ...base, mode: "inverse", downPct: 0.5 });
    expect(high.rows.length).toBeGreaterThanOrEqual(low.rows.length);
  });

  it("filters by ZIP prefix and price", async () => {
    const zip = await runSearch({ ...base, zip: "937" });
    expect(zip.rows.length).toBeGreaterThan(0);
    expect(zip.rows.every((r) => r.listing.zip.startsWith("937"))).toBe(true);
    const cheap = await runSearch({ ...base, maxPrice: 300000 });
    expect(cheap.rows.every((r) => r.listing.price <= 300000)).toBe(true);
  });
});

 it("uses the CEO example rate and state investment-property costs", async () => {
   const result = await runSearch(base);
   expect(result.rate.rate).toBe(0.0799);
   for (const row of result.rows) {
     expect(row.assumptions.insuranceRate).toBe(0.003);
     expect(row.assumptions.taxRate).toBe(({ CA: 0.007, TX: 0.019, FL: 0.0102 } as Record<string, number>)[row.listing.state]);
     expect(row.hoaKnown).toBe(false);
   }
 });
