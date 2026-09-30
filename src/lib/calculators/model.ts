import {
  dscrCalc,
  strDscrCalc,
  dscrCashoutCalc,
  loanFromModeledPayment,
} from "./vendor/nonqm-engine";
export type Transaction = "purchase" | "refinance";
export type Rental = "ltr" | "str";
export type Payment = "amortizing" | "interest_only";
export type Values = Record<string, string>;
export interface Scenario {
  transaction: Transaction;
  rental: Rental;
  payment: Payment;
  values: Values;
}
export const emptyScenario = (): Scenario => ({
  transaction: "purchase",
  rental: "ltr",
  payment: "amortizing",
  values: { downPct: "20", termYears: "30", strFactor: "20", maxLtv: "80" },
});
export const sampleScenario = (): Scenario => ({
  transaction: "purchase",
  rental: "ltr",
  payment: "amortizing",
  values: {
    propertyValue: "375000",
    downPct: "20",
    loanAmount: "300000",
    grossRent: "3000",
    annualRevenue: "45000",
    ratePct: "7",
    termYears: "30",
    taxes: "367",
    insurance: "167",
    hoa: "120",
    flood: "0",
    strFactor: "20",
    maxLtv: "80",
    currentBalance: "200000",
    desiredCashOut: "50000",
    closingCosts: "5000",
    vacancyPct: "5",
    management: "150",
    maintenance: "125",
    utilities: "0",
    otherOperating: "50",
    debtService: "1995.91",
    cashInvested: "80000",
  },
});
export const number = (v: Values, k: string) => {
  const n = Number(v[k]);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
const boundKeys: Record<string, number> = {
  downPct: 100,
  strFactor: 100,
  maxLtv: 100,
  vacancyPct: 100,
  ratePct: 30,
  termYears: 40,
};
export function validation(s: Scenario, kind: "dscr" | "cashflow"): string[] {
  const { values: v } = s;
  const keys =
    kind === "cashflow"
      ? [
          s.rental === "ltr" ? "grossRent" : "annualRevenue",
          "vacancyPct",
          "taxes",
          "insurance",
          "hoa",
          "flood",
          "management",
          "maintenance",
          "utilities",
          "otherOperating",
          "debtService",
          "propertyValue",
          "cashInvested",
        ]
      : [
          "propertyValue",
          s.rental === "ltr" ? "grossRent" : "annualRevenue",
          ...(s.rental === "str" ? ["strFactor"] : []),
          "ratePct",
          "termYears",
          "taxes",
          "insurance",
          "hoa",
          "flood",
          ...(s.transaction === "purchase"
            ? ["downPct"]
            : ["currentBalance", "desiredCashOut", "closingCosts", "maxLtv"]),
        ];
  const missing = keys.filter((k) => v[k] === undefined || v[k] === "");
  const invalid = keys.filter(
    (k) =>
      v[k] !== undefined &&
      v[k] !== "" &&
      (!Number.isFinite(Number(v[k])) ||
        Number(v[k]) < 0 ||
        Number(v[k]) > (boundKeys[k] ?? 1000000000)),
  );
  if (kind === "dscr" && Number(v.propertyValue) <= 0)
    invalid.push("propertyValue");
  if (kind === "dscr" && !["15", "20", "25", "30", "40"].includes(v.termYears))
    invalid.push("termYears");
  if (kind === "dscr" && s.transaction === "refinance" && Number(v.maxLtv) <= 0)
    invalid.push("maxLtv");
  return [...new Set([...missing, ...invalid])];
}
export function calculateDscr(s: Scenario) {
  if (validation(s, "dscr").length) return null;
  const v = s.values;
  const loanAmount =
    number(v, "propertyValue") * (1 - number(v, "downPct") / 100);
  const input = {
    grossRent: number(v, "grossRent"),
    annualStrRevenue: number(v, "annualRevenue"),
    strIncomeHaircutPct: number(v, "strFactor"),
    loanAmount,
    ratePct: number(v, "ratePct"),
    termYears: number(v, "termYears"),
    paymentMode: s.payment,
    taxes: number(v, "taxes"),
    insurance: number(v, "insurance"),
    hoa: number(v, "hoa"),
    flood: number(v, "flood"),
    propertyValue: number(v, "propertyValue"),
  };
  const rent =
    s.rental === "str" ? strDscrCalc(input).qualifyingRent : input.grossRent;
  const refinance =
    s.transaction === "refinance"
      ? dscrCashoutCalc({
          ...input,
          grossRent: rent,
          currentLoanBalance: number(v, "currentBalance"),
          desiredCashOut: number(v, "desiredCashOut"),
          closingCosts: number(v, "closingCosts"),
          maxLtvPct: number(v, "maxLtv"),
        })
      : null;
  const result = refinance ?? dscrCalc({ ...input, grossRent: rent });
  const actualLoan = refinance ? refinance.newLoanAmount : loanAmount;
  const fixed = input.taxes + input.insurance + input.hoa + input.flood;
  const buyingPower = (target: number) => {
    const budget = rent / target - fixed;
    if (budget <= 0) return 0;
    if (s.payment === "interest_only" && input.ratePct === 0) return null;
    return loanFromModeledPayment(
      budget,
      input.ratePct,
      input.termYears,
      s.payment,
    );
  };
  return {
    ...result,
    refinance,
    modeledLoan: actualLoan,
    displayRatio: result.pitia > 0 ? result.lenderDscr : null,
    buyingPower100: buyingPower(1),
    buyingPower125: buyingPower(1.25),
  };
}
export function calculateCashFlow(s: Scenario) {
  if (validation(s, "cashflow").length) return null;
  const v = s.values;
  const debt = number(v, "debtService");
  const result = dscrCalc({
    grossRent:
      s.rental === "str"
        ? number(v, "annualRevenue") / 12
        : number(v, "grossRent"),
    loanAmount: 0,
    piOverride: debt,
    taxes: number(v, "taxes"),
    insurance: number(v, "insurance"),
    hoa: number(v, "hoa"),
    flood: number(v, "flood"),
    investorVacancyPct: number(v, "vacancyPct"),
    management: number(v, "management"),
    maintenance: number(v, "maintenance"),
    utilities: number(v, "utilities"),
    otherOperating: number(v, "otherOperating"),
    propertyValue: number(v, "propertyValue"),
    cashInvested: number(v, "cashInvested"),
  });
  return {
    ...result,
    displayInvestorDscr: debt > 0 ? result.investorDscr : null,
    displayCapRate: number(v, "propertyValue") > 0 ? result.capRate : null,
    displayCashOnCash: number(v, "cashInvested") > 0 ? result.cashOnCash : null,
  };
}
export function cashFlowHandoff(s: Scenario): Scenario | null {
  const r = calculateDscr(s);
  if (!r) return null;
  return {
    ...s,
    values: {
      ...s.values,
      debtService: r.pi.toFixed(2),
      cashInvested:
        s.transaction === "purchase"
          ? (number(s.values, "propertyValue") - r.modeledLoan).toFixed(2)
          : "",
      vacancyPct: "",
      management: "",
      maintenance: "",
      utilities: "",
      otherOperating: "",
    },
  };
}
export function dscrHandoff(s: Scenario): Scenario {
  // Cash-flow financing payment is an expense, not enough evidence to infer a new note rate or principal.
  return { ...s, values: { ...s.values } };
}
