import { computeDscr, requiredDownPayment, TARGET_DSCR, type DownPaymentNeed } from "./dscr";
import { listings, rates, rents, type Listing, type RateQuote, type RentEstimate } from "./providers";

export type SearchMode = "forward" | "inverse";

export interface SearchParams {
  states: string[];
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
  /** Ratio at params.downPct with the selected toggles. */
  dscr: number;
  /** Smallest down payment that reaches 1.0 with the selected toggles. */
  need: DownPaymentNeed;
  /** Ratio at 20% down, no toggles: the headline number. */
  baseDscr: number;
}

export interface SearchResponse {
  rate: RateQuote;
  rows: SearchRow[];
  params: SearchParams;
}

export async function runSearch(p: SearchParams): Promise<SearchResponse> {
  const [found, rate, baseRate] = await Promise.all([
    listings().search({ states: p.states, minPrice: p.minPrice, maxPrice: p.maxPrice }),
    rates().quote({ interestOnly: p.interestOnly, fortyYear: p.fortyYear, downPct: p.downPct }),
    rates().quote({ interestOnly: false, fortyYear: false, downPct: 0.2 }),
  ]);

  const rows: SearchRow[] = await Promise.all(
    found.map(async (listing) => {
      const rent = await rents().estimate(listing);
      const common = { price: listing.price, monthlyRent: rent.monthlyRent };
      const scenario = { ...common, annualRate: rate.rate, interestOnly: p.interestOnly, fortyYear: p.fortyYear };
      return {
        listing,
        rent,
        dscr: computeDscr({ ...scenario, downPct: p.downPct }).dscr,
        need: requiredDownPayment(scenario, TARGET_DSCR),
        baseDscr: computeDscr({
          ...common,
          annualRate: baseRate.rate,
          interestOnly: false,
          fortyYear: false,
          downPct: 0.2,
        }).dscr,
      };
    }),
  );

  const filtered =
    p.mode === "inverse"
      ? rows
          .filter((r) => r.need.reachable && r.need.downPct <= p.downPct + 1e-9)
          .sort((a, b) => (a.need.reachable && b.need.reachable ? a.need.downPct - b.need.downPct : 0))
      : rows.sort((a, b) => b.dscr - a.dscr);

  return { rate, rows: filtered, params: p };
}
