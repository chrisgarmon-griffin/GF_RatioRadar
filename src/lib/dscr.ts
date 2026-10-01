/**
 * DSCR engine. Pure functions, no I/O.
 *
 * DSCR = gross monthly rent / PITIA, where PITIA = principal + interest + property tax + insurance.
 * Tax and insurance are assumptions (rates of purchase price) until a real source is wired in.
 */

export interface Assumptions {
  /** Annual property tax as a fraction of price (e.g. 0.011). */
  taxRate: number;
  /** Annual insurance as a fraction of price. */
  insuranceRate: number;
  /** Minimum down payment fraction a lender will accept. */
  minDownPct: number;
  /** Highest down payment fraction we will suggest before calling a deal unreachable. */
  maxDownPct: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  taxRate: 0.011,
  insuranceRate: 0.003,
  minDownPct: 0.2,
  maxDownPct: 1,
};

export interface Scenario {
  price: number;
  monthlyRent: number;
  /** Annual note rate as a fraction (0.075 = 7.5%). */
  annualRate: number;
  /** Down payment as a fraction of price. */
  downPct: number;
  interestOnly: boolean;
  /** 40-year amortization instead of 30. Ignored when interestOnly is true. */
  fortyYear: boolean;
  /** Monthly listing HOA dues; omitted dues must be disclosed by the caller. */
  monthlyHoa?: number;
}

export const TARGET_DSCR = 1.0;

/** Monthly principal and interest per $1 of loan. */
export function paymentFactor(annualRate: number, interestOnly: boolean, fortyYear: boolean): number {
  const r = annualRate / 12;
  if (interestOnly) return r;
  const n = (fortyYear ? 40 : 30) * 12;
  if (r === 0) return 1 / n;
  return (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function monthlyTaxIns(price: number, a: Assumptions = DEFAULT_ASSUMPTIONS): number {
  return (price * (a.taxRate + a.insuranceRate)) / 12;
}

export interface DscrResult {
  loanAmount: number;
  downPayment: number;
  monthlyPI: number;
  monthlyTaxIns: number;
  pitia: number;
  dscr: number;
}

export function computeDscr(s: Scenario, a: Assumptions = DEFAULT_ASSUMPTIONS): DscrResult {
  const downPayment = s.price * s.downPct;
  const loanAmount = s.price - downPayment;
  const monthlyPI = loanAmount * paymentFactor(s.annualRate, s.interestOnly, s.fortyYear);
  const taxIns = monthlyTaxIns(s.price, a);
  const pitia = monthlyPI + taxIns + (s.monthlyHoa ?? 0);
  return {
    loanAmount,
    downPayment,
    monthlyPI,
    monthlyTaxIns: taxIns,
    pitia,
    dscr: pitia > 0 ? s.monthlyRent / pitia : Infinity,
  };
}

export type DownPaymentNeed =
  | { reachable: true; downPct: number; downPayment: number }
  | { reachable: false; reason: "rent-below-tax-ins" | "exceeds-max-down" };

/**
 * Smallest down payment (never below minDownPct) that reaches the target DSCR
 * for the scenario's rate, term, and IO settings. Closed form: tax and insurance
 * depend on price, not loan, so the affordable P&I is rent/target minus tax+ins.
 */
export function requiredDownPayment(
  s: Omit<Scenario, "downPct">,
  target: number = TARGET_DSCR,
  a: Assumptions = DEFAULT_ASSUMPTIONS,
): DownPaymentNeed {
  const affordablePI = s.monthlyRent / target - monthlyTaxIns(s.price, a) - (s.monthlyHoa ?? 0);
  if (affordablePI <= 0) return { reachable: false, reason: "rent-below-tax-ins" };
  const maxLoan = affordablePI / paymentFactor(s.annualRate, s.interestOnly, s.fortyYear);
  const downPct = Math.max(a.minDownPct, 1 - maxLoan / s.price);
  if (downPct > a.maxDownPct) return { reachable: false, reason: "exceeds-max-down" };
  return { reachable: true, downPct, downPayment: s.price * downPct };
}

export type RateNeed =
  | { reachable: true; annualRate: number; alreadyMeets: boolean }
  | { reachable: false; reason: "fixed-costs" | "zero-rate-insufficient" };

/** Highest rate at or below the current rate that meets the target at unchanged down payment.
 * This is a mathematical target, not available pricing or a buydown-cost quote. */
export function requiredRate(s: Scenario, target = TARGET_DSCR, a = DEFAULT_ASSUMPTIONS): RateNeed {
  const affordablePI = s.monthlyRent / target - monthlyTaxIns(s.price, a) - (s.monthlyHoa ?? 0);
  if (affordablePI <= 0) return { reachable: false, reason: "fixed-costs" };
  const loan = s.price * (1 - s.downPct);
  if (computeDscr(s, a).dscr >= target)
    return { reachable: true, annualRate: s.annualRate, alreadyMeets: true };
  if (loan * paymentFactor(0, s.interestOnly, s.fortyYear) > affordablePI)
    return { reachable: false, reason: "zero-rate-insufficient" };
  let low = 0, high = s.annualRate;
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    if (loan * paymentFactor(mid, s.interestOnly, s.fortyYear) <= affordablePI) low = mid;
    else high = mid;
  }
  return { reachable: true, annualRate: low, alreadyMeets: false };
}
