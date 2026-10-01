import { computeDscr, requiredDownPayment, TARGET_DSCR } from "./dscr";
import { rates, rents, type Listing } from "./providers";
import type { SearchParams, SearchResponse, SearchRow } from "./search";

export interface LookupInput {
  address: string;
  zip: string;
  city?: string;
  state?: string;
  price: number;
  interestOnly: boolean;
  fortyYear: boolean;
  downPct: number;
}

export type LookupValidation = { ok: true; input: LookupInput } | { ok: false; error: string };

export function validateLookup(body: unknown): LookupValidation {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request" };
  const b = body as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const address = str(b.address, 120);
  const zip = str(b.zip, 10);
  const city = str(b.city, 60);
  const state = str(b.state, 2).toUpperCase();
  const price = Number(b.price);
  const downPct = Number(b.downPct ?? 0.2);
  if (address.length < 5 || !/\d/.test(address)) return { ok: false, error: "Enter a street address with a number" };
  if (!/^\d{5}$/.test(zip)) return { ok: false, error: "Enter a 5-digit ZIP code" };
  if (state && !/^[A-Z]{2}$/.test(state)) return { ok: false, error: "State must be a 2-letter code" };
  if (!Number.isFinite(price) || price < 50_000 || price > 10_000_000) {
    return { ok: false, error: "Enter a price between $50,000 and $10,000,000" };
  }
  if (!(downPct >= 0.2 && downPct <= 0.5)) return { ok: false, error: "Down payment must be 20% to 50%" };
  return {
    ok: true,
    input: {
      address, zip, city, state, price, downPct,
      interestOnly: b.interestOnly === true,
      fortyYear: b.fortyYear === true && b.interestOnly !== true,
    },
  };
}

/** Price one address the user typed in. No listing feed involved: the user supplies the price. */
export async function lookupAddress(i: LookupInput): Promise<SearchResponse> {
  const listing: Listing = {
    id: `lookup-${i.zip}-${i.address}`.toLowerCase().replace(/\W+/g, "-"),
    address: i.address, city: i.city ?? "", state: i.state ?? "", zip: i.zip, price: i.price,
    beds: 0, baths: 0, sqft: 0, propertyType: "SFR", daysOnMarket: 0, photoUrl: null, source: "lookup",
  };
  const [rent, rate] = await Promise.all([
    rents("lookup").estimate(listing),
    rates().quote({ interestOnly: i.interestOnly, fortyYear: i.fortyYear, downPct: i.downPct, loanAmount: Math.round(i.price * (1 - i.downPct)) }),
  ]);
  const base = { price: i.price, annualRate: rate.rate, interestOnly: i.interestOnly, fortyYear: i.fortyYear };
  const at = (monthlyRent: number) => computeDscr({ ...base, monthlyRent, downPct: i.downPct }).dscr;
  const row: SearchRow = {
    listing, rent,
    dscr: at(rent.monthlyRent),
    dscrLow: at(rent.low ?? rent.monthlyRent),
    dscrHigh: at(rent.high ?? rent.monthlyRent),
    need: requiredDownPayment({ ...base, monthlyRent: rent.monthlyRent }, TARGET_DSCR),
  };
  const params: SearchParams = {
    states: i.state ? [i.state] : [], zip: i.zip, mode: "forward",
    interestOnly: i.interestOnly, fortyYear: i.fortyYear, downPct: i.downPct,
  };
  return { rate, rows: [row], skipped: 0, params };
}

/** Speed bump against cost abuse: N lookups per window per key. Per server instance only. */
export function makeLimiter(max: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    hits.set(key, [...recent, t]);
    return true;
  };
}

/**
 * Ceiling on billed lookups per UTC day, per server instance. Serverless instances do not share memory,
 * so this is a guard against runaway cost, not an exact budget. A durable counter needs a shared store.
 */
export function makeDailyCap(max: number, now: () => number = Date.now) {
  let day = "";
  let used = 0;
  return () => {
    const today = new Date(now()).toISOString().slice(0, 10);
    if (today !== day) {
      day = today;
      used = 0;
    }
    if (used >= max) return false;
    used++;
    return true;
  };
}
