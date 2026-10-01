import {
  computeDscr,
  requiredDownPayment,
  requiredRate,
  type RateNeed,
  type Assumptions,
  TARGET_DSCR,
  type DownPaymentNeed,
} from "./dscr";
import {
  listings,
  RentUnavailableError,
  rates,
  rents,
  type Listing,
  type RateQuote,
  type RentEstimate,
} from "./providers";

import { propertyAssumptions } from "./property-costs";

export type SearchMode = "forward" | "inverse";

export interface SearchParams {
  states: string[];
  zip?: string;
  minPrice?: number;
  maxPrice?: number;
  mode: SearchMode;
  interestOnly: boolean;
  fortyYear: boolean;
  /** Down payment used for every ratio; inverse mode filters to DSCR at least 1.0. */
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
  rateNeed: RateNeed;
  assumptions: Assumptions;
  hoaKnown: boolean;
}

export interface SearchResponse {
  rate: RateQuote;
  rows: SearchRow[];
  /** Listings dropped because no rent estimate was available. Never shown with a made-up rent. */
  skipped: number;
  params: SearchParams;
}

const RENT_CONCURRENCY = 6;

/** Run async work over items with a fixed number in flight. Preserves order. */
export async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1)
    throw new Error("Concurrency must be a positive integer");
  const out: R[] = new Array(items.length);
  let next = 0;
  let stopped = false;
  const worker = async () => {
    while (!stopped && next < items.length) {
      const i = next++;
      try {
        out[i] = await fn(items[i]);
      } catch (error) {
        stopped = true;
        throw error;
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return out;
}

const median = (xs: number[]) => {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export async function runSearch(p: SearchParams): Promise<SearchResponse> {
  const found = await listings().search({
    states: p.states,
    zip: p.zip,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
  });
  const medianPrice = median(found.map((l) => l.price));
  const rate = await rates().quote({
    interestOnly: p.interestOnly,
    fortyYear: p.fortyYear,
    downPct: p.downPct,
    loanAmount: medianPrice
      ? Math.round(medianPrice * (1 - p.downPct))
      : undefined,
  });

  const priced = await mapPool(
    found,
    RENT_CONCURRENCY,
    async (listing): Promise<SearchRow | null> => {
      let rent: RentEstimate;
      try {
        rent = await rents().estimate(listing);
      } catch (e) {
        // A property the vendor cannot value is dropped. Anything else (auth, outage) fails the search.
        if (e instanceof RentUnavailableError) return null;
        throw e;
      }
      const assumptions = propertyAssumptions(listing.state);
      const base = {
        monthlyHoa: listing.monthlyHoa ?? 0,
        price: listing.price,
        annualRate: rate.rate,
        interestOnly: p.interestOnly,
        fortyYear: p.fortyYear,
      };
      const at = (monthlyRent: number, downPct: number) =>
        computeDscr({ ...base, monthlyRent, downPct }, assumptions).dscr;
      return {
        listing,
        rent,
        assumptions,
        hoaKnown: listing.monthlyHoa != null,
        rateNeed: requiredRate({ ...base, monthlyRent: rent.monthlyRent, downPct: p.downPct }, TARGET_DSCR, assumptions),
        dscr: at(rent.monthlyRent, p.downPct),
        dscrLow: at(rent.low ?? rent.monthlyRent, p.downPct),
        dscrHigh: at(rent.high ?? rent.monthlyRent, p.downPct),
        need: requiredDownPayment(
          { ...base, monthlyRent: rent.monthlyRent },
          TARGET_DSCR,
          assumptions,
        ),
      };
    },
  );
  const rows = priced.filter((r): r is SearchRow => r !== null);

  const sorted =
    p.mode === "inverse"
      ? rows
          .filter((r) => r.dscr >= TARGET_DSCR)
          .sort((a, b) =>
            b.dscr - a.dscr,
          )
      : rows.sort((a, b) => b.dscr - a.dscr);

  return {
    rate,
    rows: sorted,
    skipped: priced.length - rows.length,
    params: p,
  };
}
