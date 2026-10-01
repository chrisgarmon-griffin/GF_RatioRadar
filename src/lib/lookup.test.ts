import { describe, expect, it } from "vitest";
import { lookupAddress, makeLimiter, validateLookup } from "./lookup";

const good = { address: "2439 Russell St", zip: "94705", price: 900000 };

describe("validateLookup", () => {
  it("accepts a normal request and normalizes", () => {
    const r = validateLookup({ ...good, state: "ca", fortyYear: true, interestOnly: true });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.input).toMatchObject({ state: "CA", interestOnly: true, fortyYear: false, downPct: 0.2 });
  });
  it("rejects bad address, zip, price and down payment", () => {
    expect(validateLookup({ ...good, address: "Main" }).ok).toBe(false);
    expect(validateLookup({ ...good, zip: "947" }).ok).toBe(false);
    expect(validateLookup({ ...good, price: 10 }).ok).toBe(false);
    expect(validateLookup({ ...good, downPct: 0.1 }).ok).toBe(false);
    expect(validateLookup(null).ok).toBe(false);
  });
});

describe("lookupAddress (fixture providers)", () => {
  it("returns one priced row", async () => {
    const v = validateLookup(good);
    if (!v.ok) throw new Error("bad fixture");
    const r = await lookupAddress(v.input);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].dscrLow).toBeLessThanOrEqual(r.rows[0].dscrHigh);
    expect(r.rows[0].listing.price).toBe(900000);
  });
});

describe("makeLimiter", () => {
  it("blocks after max hits in the window and recovers", () => {
    let t = 0;
    const allow = makeLimiter(2, 1000, () => t);
    expect([allow("a"), allow("a"), allow("a")]).toEqual([true, true, false]);
    expect(allow("b")).toBe(true);
    t = 1001;
    expect(allow("a")).toBe(true);
  });
});
