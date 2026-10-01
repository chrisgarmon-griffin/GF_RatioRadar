import { DEFAULT_ASSUMPTIONS, type Assumptions } from "./dscr";

// Griffin Funding property-tax guide, reviewed 2026-10-01. Investment-property
// effective estimates for the three currently supported listing markets.
// https://griffinfunding.com/blog/mortgage/property-tax-by-state/
export const INVESTMENT_TAX_RATES: Record<string, number> = { CA: 0.007, TX: 0.019, FL: 0.0102 };
// https://griffinfunding.com/non-qm-mortgages/dscr-loans/by-state/
// Published illustration uses 0.30% annually; actual premiums may be higher.
export function propertyAssumptions(state: string): Assumptions {
  const taxRate = INVESTMENT_TAX_RATES[state];
  if (taxRate === undefined) throw new Error(`No reviewed tax estimate for ${state}`);
  return { ...DEFAULT_ASSUMPTIONS, taxRate, insuranceRate: 0.003 };
}
