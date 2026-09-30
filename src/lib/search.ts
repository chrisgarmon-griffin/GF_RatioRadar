import { computeDscr, requiredDownPayment, TARGET_DSCR, type DownPaymentNeed } from "./dscr";
import { listings, rates, rents, type Listing, type RateQuote, type RentEstimate } from "./providers";

export type SearchMode = "forward" | "inverse";

export interface SearchParams {
  states: string[];
  zip?: string;
  minPrice?: number;
  maxPrice?: number;
  mode: SearchMode;
  interestOnly: boolean;
  fortyYear: boolean;
  /** Forward mode: the down payment used for every ratio. Inverse mode: the most the buyer will bring. */
  downPct: number;
}

export interface SearchRow {
  listing: Listing;
  rent: RentEstimate;
  /** Ratio at params.downPct with the selected toggles, using the mid rent estimate. */
  dscr: number;
  /** Same ratio at the low and high ends of the rent estimate. */
  dscrLow: number;
  dscrHigh: number;
  /** Smallest down payment that reaches 1.0 with the selected toggles. */
  need: DownPaymentNeed;
}

export interface SearchResponse {
  rate: RateQuote;
  rows: SearchRow[];
  params: SearchParams;
}

export async function runSearch(p: SearchParams): Promise<SearchResponse> {
  const [found, rate] = await Promise.all([
    listings().search({ states: p.states, zip: p.zip, minPrice: p.minPrice, maxPrice: p.maxPrice }),
    rates().quote({ interestOnly: p.interestOnly, fortyYear: p.fortyYear, downPct: p.downPct }),
  ]);

  const rows: SearchRow[] = await Promise.all(
    found.map(async (listing) => {
      const rent = await rents().estimate(listing);
      const base = {
        price: listing.price,
        annualRate: rate.rate,
        interestOnly: p.interestOnly,
        fortyYear: p.fortyYear,
      };
      const at = (monthlyRent: number, downPct: number) => computeDscr({ ...base, monthlyRent, downPct }).dscr;
      return {
        listing,
        rent,
        dscr: at(rent.monthlyRent, p.downPct),
        dscrLow: at(rent.low ?? rent.monthlyRent, p.downPct),
        dscrHigh: at(rent.high ?? rent.monthlyRent, p.downPct),
        need: requiredDownPayment({ ...base, monthlyRent: rent.monthlyRent }, TARGET_DSCR),
      };
    }),
  );

  const sorted =
    p.mode === "inverse"
      ? rows
          .filter((r) => r.need.reachable && r.need.downPct <= p.downPct + 1e-9)
          .sort((a, b) => (a.need.reachable && b.need.reachable ? a.need.downPct - b.need.downPct : 0))
      : rows.sort((a, b) => b.dscr - a.dscr);

  return { rate, rows: sorted, params: p };
}
