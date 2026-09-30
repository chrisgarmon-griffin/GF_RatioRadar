import { computeDscr, requiredDownPayment, TARGET_DSCR, type DownPaymentNeed } from "./dscr";
import { listings, ProviderError, rates, rents, type Listing, type RateQuote, type RentEstimate } from "./providers";

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
  /** Listings dropped because no rent estimate was available. Never shown with a made-up rent. */
  skipped: number;
  params: SearchParams;
}

const RENT_CONCURRENCY = 6;

/** Run async work over items with a fixed number in flight. Preserves order. */
export async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

const median = (xs: number[]) => {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

export async function runSearch(p: SearchParams): Promise<SearchResponse> {
  const found = await listings().search({ states: p.states, zip: p.zip, minPrice: p.minPrice, maxPrice: p.maxPrice });
  const medianPrice = median(found.map((l) => l.price));
  const rate = await rates().quote({
    interestOnly: p.interestOnly,
    fortyYear: p.fortyYear,
    downPct: p.downPct,
    loanAmount: medianPrice ? Math.round(medianPrice * (1 - p.downPct)) : undefined,
  });

  const priced = await mapPool(found, RENT_CONCURRENCY, async (listing): Promise<SearchRow | null> => {
    let rent: RentEstimate;
    try {
      rent = await rents().estimate(listing);
    } catch (e) {
      // A property the vendor cannot value is dropped. Anything else (auth, outage) fails the search.
      if (e instanceof ProviderError && /no rent estimate/.test(e.message)) return null;
      throw e;
    }
    const base = { price: listing.price, annualRate: rate.rate, interestOnly: p.interestOnly, fortyYear: p.fortyYear };
    const at = (monthlyRent: number, downPct: number) => computeDscr({ ...base, monthlyRent, downPct }).dscr;
    return {
      listing,
      rent,
      dscr: at(rent.monthlyRent, p.downPct),
      dscrLow: at(rent.low ?? rent.monthlyRent, p.downPct),
      dscrHigh: at(rent.high ?? rent.monthlyRent, p.downPct),
      need: requiredDownPayment({ ...base, monthlyRent: rent.monthlyRent }, TARGET_DSCR),
    };
  });
  const rows = priced.filter((r): r is SearchRow => r !== null);

  const sorted =
    p.mode === "inverse"
      ? rows
          .filter((r) => r.need.reachable && r.need.downPct <= p.downPct + 1e-9)
          .sort((a, b) => (a.need.reachable && b.need.reachable ? a.need.downPct - b.need.downPct : 0))
      : rows.sort((a, b) => b.dscr - a.dscr);

  return { rate, rows: sorted, skipped: priced.length - rows.length, params: p };
}
