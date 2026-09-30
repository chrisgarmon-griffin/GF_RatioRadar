import { describe, it, expect } from "vitest";
import {
  calculateDscr,
  calculateCashFlow,
  cashFlowHandoff,
  emptyScenario,
  sampleScenario,
  validation,
} from "./model";
describe("imported calculator integration", () => {
  it("requires explicit costs rather than silently assuming zero", () => {
    expect(calculateDscr(emptyScenario())).toBeNull();
    const s = sampleScenario();
    s.values.hoa = "";
    expect(validation(s, "dscr")).toContain("hoa");
  });
  it("matches an independently calculated 300k 7% 30-year mortgage and full housing costs", () => {
    const r = calculateDscr(sampleScenario())!;
    expect(r.pi).toBeCloseTo(1995.9074855, 5);
    expect(r.pitia).toBeCloseTo(2649.9074855, 5);
    expect(r.displayRatio).toBeCloseTo(3000 / 2649.9074855, 8);
    expect(r.buyingPower100).toBeCloseTo(352621.55455, 1);
  });
  it("uses editable STR reductions, including zero", () => {
    const s = sampleScenario();
    s.rental = "str";
    expect(calculateDscr(s)!.qualifyingRent).toBe(3000);
    s.values.strFactor = "0";
    expect(calculateDscr(s)!.qualifyingRent).toBe(3750);
    s.values.strFactor = "35";
    expect(calculateDscr(s)!.qualifyingRent).toBe(2437.5);
  });
  it("models IO and zero-rate limits without inventing infinite buying power", () => {
    const s = sampleScenario();
    s.payment = "interest_only";
    expect(calculateDscr(s)!.pi).toBe(1750);
    s.values.ratePct = "0";
    expect(calculateDscr(s)!.buyingPower100).toBeNull();
    s.payment = "amortizing";
    expect(calculateDscr(s)!.pi).toBeCloseTo(300000 / 360, 8);
  });
  it("caps cash-out and exposes a refinance shortfall", () => {
    const s = sampleScenario();
    s.transaction = "refinance";
    s.values.desiredCashOut = "150000";
    let r = calculateDscr(s)!.refinance!;
    expect(r.newLoanAmount).toBe(300000);
    expect(r.estimatedCashOut).toBe(95000);
    expect(r.cashOutLimited).toBe(true);
    s.values.currentBalance = "320000";
    r = calculateDscr(s)!.refinance!;
    expect(r.estimatedCashOut).toBe(0);
    expect(r.cashToClose).toBe(25000);
  });
  it("preserves negative NOI, cash flow, and returns", () => {
    const s = sampleScenario();
    s.values.grossRent = "100";
    const r = calculateCashFlow(s)!;
    expect(r.monthlyNoi).toBeLessThan(0);
    expect(r.monthlyCashFlow).toBeLessThan(0);
    expect(r.displayCapRate).toBeLessThan(0);
    expect(r.displayCashOnCash).toBeLessThan(0);
  });
  it("calculates investor returns as fractions and keeps taxes separate from debt", () => {
    const r = calculateCashFlow(sampleScenario())!;
    expect(r.investorEffectiveIncome).toBe(2850);
    expect(r.operatingExpenses).toBe(979);
    expect(r.monthlyNoi).toBe(1871);
    expect(r.monthlyCashFlow).toBeCloseTo(-124.91, 2);
    expect(r.displayCapRate).toBeCloseTo(22452 / 375000, 8);
    expect(r.displayCashOnCash).toBeCloseTo(-1498.92 / 80000, 8);
  });
  it("shows undefined ratios for zero denominators", () => {
    const s = sampleScenario();
    s.values.debtService = "0";
    s.values.propertyValue = "0";
    s.values.cashInvested = "0";
    const r = calculateCashFlow(s)!;
    expect(r.displayInvestorDscr).toBeNull();
    expect(r.displayCapRate).toBeNull();
    expect(r.displayCashOnCash).toBeNull();
  });
  it("hands off the payment but leaves unverified operating inputs blank", () => {
    const s = cashFlowHandoff(sampleScenario())!;
    expect(s.values.debtService).toBe("1995.91");
    expect(s.values.cashInvested).toBe("75000.00");
    expect(calculateCashFlow(s)).toBeNull();
    expect(s.values.vacancyPct).toBe("");
  });
  it("rejects negative and out-of-range entries", () => {
    const s = sampleScenario();
    for (const [key, value] of [
      ["ratePct", "-1"],
      ["downPct", "101"],
      ["taxes", "NaN"],
    ]) {
      s.values[key] = value;
      expect(validation(s, "dscr")).toContain(key);
    }
  });
});
