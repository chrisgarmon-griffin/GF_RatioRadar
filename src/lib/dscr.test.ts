import { describe, expect, it } from "vitest";
import { computeDscr, paymentFactor, requiredDownPayment, type Scenario } from "./dscr";

const base: Scenario = {
  price: 400_000,
  monthlyRent: 2_800,
  annualRate: 0.075,
  downPct: 0.2,
  interestOnly: false,
  fortyYear: false,
};

describe("paymentFactor", () => {
  it("matches the standard 30-year amortization figure", () => {
    // $100k at 7.5% / 30yr = $699.21/mo
    expect(paymentFactor(0.075, false, false) * 100_000).toBeCloseTo(699.21, 1);
  });
  it("interest-only is rate / 12", () => {
    expect(paymentFactor(0.075, true, false)).toBeCloseTo(0.00625, 8);
  });
  it("40-year is lower than 30-year", () => {
    expect(paymentFactor(0.075, false, true)).toBeLessThan(paymentFactor(0.075, false, false));
  });
});

describe("computeDscr", () => {
  it("computes PITIA and ratio for the base case", () => {
    const r = computeDscr(base);
    expect(r.loanAmount).toBe(320_000);
    expect(r.monthlyPI).toBeCloseTo(2237.5, 0);
    expect(r.dscr).toBeCloseTo(2800 / r.pitia, 10);
    expect(r.dscr).toBeGreaterThan(1);
  });
  it("interest-only and 40-year both raise the ratio", () => {
    const std = computeDscr(base).dscr;
    expect(computeDscr({ ...base, interestOnly: true }).dscr).toBeGreaterThan(std);
    expect(computeDscr({ ...base, fortyYear: true }).dscr).toBeGreaterThan(std);
  });
  it("more down raises the ratio", () => {
    expect(computeDscr({ ...base, downPct: 0.3 }).dscr).toBeGreaterThan(computeDscr(base).dscr);
  });
});

describe("requiredDownPayment", () => {
  it("floors at the minimum down when the deal already works", () => {
    expect(requiredDownPayment(base)).toMatchObject({ reachable: true, downPct: 0.2 });
  });
  it("lands exactly on 1.0 when more down is needed", () => {
    const weak = { ...base, monthlyRent: 2_500 };
    const need = requiredDownPayment(weak);
    expect(need.reachable).toBe(true);
    if (!need.reachable) return;
    expect(need.downPct).toBeGreaterThan(0.2);
    expect(computeDscr({ ...weak, downPct: need.downPct }).dscr).toBeCloseTo(1.0, 6);
  });
  it("is unreachable when rent cannot cover tax and insurance", () => {
    expect(requiredDownPayment({ ...base, monthlyRent: 500 })).toEqual({
      reachable: false,
      reason: "rent-below-tax-ins",
    });
  });
  it("is unreachable past the max down cap", () => {
    expect(requiredDownPayment({ ...base, monthlyRent: 1_800 })).toEqual({
      reachable: false,
      reason: "exceeds-max-down",
    });
  });
  it("IO needs less down than standard", () => {
    const weak = { ...base, monthlyRent: 2_500 };
    const std = requiredDownPayment(weak);
    const io = requiredDownPayment({ ...weak, interestOnly: true });
    expect(std.reachable && io.reachable).toBe(true);
    if (std.reachable && io.reachable) expect(io.downPct).toBeLessThan(std.downPct);
  });
});
