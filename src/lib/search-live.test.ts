import { describe, expect, it, vi } from "vitest";

const l = (id: string, price: number) => ({
  id, address: `${id} Main St`, city: "Fresno", state: "CA", zip: "93706", price, beds: 3, baths: 2, sqft: 1400,
  propertyType: "SFR" as const, daysOnMarket: 5, photoUrl: null, source: "t",
});

vi.mock("./providers", async () => {
  const actual = await vi.importActual<typeof import("./providers")>("./providers");
  return {
    ...actual,
    listings: () => ({ search: async () => [l("a", 300000), l("b", 320000), l("c", 340000)] }),
    rates: () => ({ quote: vi.fn(async () => ({ rate: 0.07, asOf: "2026-09-30", source: "t" })) }),
    rents: () => ({
      estimate: async (x: { id: string }) => {
        if (x.id === "b") throw new actual.ProviderError("housecanary", "no rent estimate (no data)");
        if (x.id === "c" && process.env.FAIL_C) throw new actual.ProviderError("housecanary", "HTTP 401", 401);
        return { monthlyRent: 2500, low: 2300, high: 2700, source: "t" };
      },
    }),
  };
});

import { runSearch } from "./search";

const p = { states: ["CA"], mode: "forward" as const, interestOnly: false, fortyYear: false, downPct: 0.2 };

describe("runSearch with a live-style rent provider", () => {
  it("drops listings with no rent estimate and reports the count", async () => {
    const r = await runSearch(p);
    expect(r.rows.map((x) => x.listing.id).sort()).toEqual(["a", "c"]);
    expect(r.skipped).toBe(1);
  });
  it("fails the whole search on an auth or outage error", async () => {
    process.env.FAIL_C = "1";
    await expect(runSearch(p)).rejects.toThrow(/HTTP 401/);
    delete process.env.FAIL_C;
  });
});
