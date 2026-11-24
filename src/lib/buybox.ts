import { DEFAULT_ASSUMPTIONS, paymentFactor, TARGET_DSCR, type Assumptions } from "./dscr";
import { PARTNER_LISTINGS } from "./partner-listings";

/**
 * ZIP buy box: the highest price that still reaches the target DSCR for a given rent, rate, term and down payment.
 * It answers "what works in this ZIP" without any listing data.
 *
 * DSCR = rent / (P&I + tax + insurance), and every cost scales with price, so the ceiling is closed form:
 *   price = rent / target / ((1 - down) * paymentFactor + (taxRate + insuranceRate) / 12)
 * Tax and insurance use the purchase-price placeholders. This is a market-level estimate, not a property quote.
 */
export function maxPriceForDscr(
  o: { monthlyRent: number; annualRate: number; downPct: number; interestOnly: boolean; fortyYear: boolean },
  target: number = TARGET_DSCR,
  a: Assumptions = DEFAULT_ASSUMPTIONS,
): number {
  const perDollar = (1 - o.downPct) * paymentFactor(o.annualRate, o.interestOnly, o.fortyYear) + (a.taxRate + a.insuranceRate) / 12;
  return o.monthlyRent / target / perDollar;
}

export const BUYBOX_BEDS = [2, 3, 4] as const;
export type BuyBoxBeds = (typeof BUYBOX_BEDS)[number];

export interface ZipRents {
  zip: string;
  city: string;
  state: string;
  /** Typical monthly rent by bedroom count. */
  rents: Record<BuyBoxBeds, number>;
  source: string;
}

/**
 * PRIVATE DEMO DATA. Sample rents for the ZIPs of the demo listings, derived from each listing's sample rent.
 * The real version would use a licensed or public rent benchmark by ZIP and bedroom count (for example HUD
 * Small Area Fair Market Rents), checked against Griffin's funded DSCR loans before anything is shown publicly.
 */
const BED_FACTOR: Record<BuyBoxBeds, number> = { 2: 0.84, 3: 1, 4: 1.18 };

const SAMPLE_ZIPS: ZipRents[] = PARTNER_LISTINGS.map((l) => {
  const beds = (BUYBOX_BEDS as readonly number[]).includes(l.beds) ? (l.beds as BuyBoxBeds) : 3;
  const threeBed = l.sampleRent / BED_FACTOR[beds];
  const at = (b: BuyBoxBeds) => Math.round((threeBed * BED_FACTOR[b]) / 25) * 25;
  return { zip: l.zip, city: l.city, state: l.state, rents: { 2: at(2), 3: at(3), 4: at(4) }, source: "sample" };
});

export const DEMO_ZIPS = SAMPLE_ZIPS.map((z) => ({ zip: z.zip, city: z.city, state: z.state }));

export const zipRents = (zip: string): ZipRents | undefined => SAMPLE_ZIPS.find((z) => z.zip === zip);
