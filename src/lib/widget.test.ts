import { describe, expect, it } from "vitest";
import { quoteWidget, validateWidget } from "./widget";

const base = { address: "1204 Alder St", city: "Fresno", state: "ca", zip: "93706", price: "349000", beds: "3", baths: "2", sqft: "1420" };

describe("widget validation", () => {
  it("accepts data-attribute strings and applies defaults", () => {
    const v = validateWidget(base);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    expect(v.input).toMatchObject({ price: 349000, state: "CA", downPct: 0.2, interestOnly: false, fortyYear: false });
    expect(v.input.taxAnnual).toBeUndefined();
  });
  it("rejects missing price, bad zip and out-of-range down payment", () => {
    expect(validateWidget({ ...base, price: "" })).toMatchObject({ ok: false });
    expect(validateWidget({ ...base, zip: "937" })).toMatchObject({ ok: false });
    expect(validateWidget({ ...base, downPct: 0.1 })).toMatchObject({ ok: false });
    expect(validateWidget(null)).toMatchObject({ ok: false });
  });
  it("makes interest-only and 40-year mutually exclusive", () => {
    const v = validateWidget({ ...base, interestOnly: true, fortyYear: true });
    expect(v.ok && v.input.interestOnly && !v.input.fortyYear).toBe(true);
  });
});

describe("widget quote (fixture providers)", () => {
  const input = (extra: object = {}) => {
    const v = validateWidget({ ...base, ...extra });
    if (!v.ok) throw new Error(v.error);
    return v.input;
  };
  it("uses the placeholder tax when the listing has none", async () => {
    const q = await quoteWidget(input());
    expect(q.usedListingTax).toBe(false);
    expect(q.monthlyTax).toBeCloseTo((349000 * 0.011) / 12, 2);
    expect(q.pitia).toBeCloseTo(q.monthlyPI + q.monthlyTax + q.monthlyInsurance, 2);
    expect(q.dscr).toBeCloseTo(q.monthlyRent / q.pitia, 6);
  });
  it("uses listing tax and HOA when given, and they lower the ratio", async () => {
    const plain = await quoteWidget(input({ taxAnnual: 3640 }));
    const withHoa = await quoteWidget(input({ taxAnnual: 3640, hoaMonthly: 250 }));
    expect(plain.usedListingTax).toBe(true);
    expect(plain.monthlyTax).toBeCloseTo(3640 / 12, 2);
    expect(withHoa.pitia).toBeCloseTo(plain.pitia + 250, 2);
    expect(withHoa.dscr).toBeLessThan(plain.dscr);
  });
  it("returns a range and a required down payment", async () => {
    const q = await quoteWidget(input());
    expect(q.dscrLow!).toBeLessThan(q.dscr);
    expect(q.dscrHigh!).toBeGreaterThan(q.dscr);
    expect(q.need.reachable ? q.need.downPct >= 0.2 : true).toBe(true);
  });
});
