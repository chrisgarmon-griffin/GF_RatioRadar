import { fetchJson, TtlCache, type FetchLike } from "./http";
import { ProviderError, type Listing, type RentEstimate, type RentProvider } from "./types";

/**
 * RentCast rent AVM adapter.
 *
 * Contract used (RentCast API docs, GET /v1/avm/rent/long-term; request and response shape taken from the docs
 * page and its 200 sample on 2026-10-06; not yet run against a live key):
 *   GET https://api.rentcast.io/v1/avm/rent/long-term?address=<Street, City, State, Zip>&propertyType=&bedrooms=&bathrooms=&squareFootage=
 *   Header X-Api-Key.
 *   200 body: { rent, rentRangeLow, rentRangeHigh, subjectProperty, comparables[] }
 * Billing: only successful 200 responses count. A monthly plan has a request limit, then a per-request overage
 * fee, and there is NO hard cap, so our own limiter and daily cap are the only spend protection. Confirm the
 * per-request price on the RentCast pricing page. Free Developer plan: 50 requests a month.
 * Multi-family (and Apartment) returns the rent of a SINGLE UNIT. A DSCR needs the whole building, and our
 * listings carry no unit count, so 2-4 unit properties are refused instead of understated.
 * The range is rentRangeLow/High. It is not a statistical band like HouseCanary's fsd, so no fsd is set.
 */

const BASE = "https://api.rentcast.io/v1";

const TYPE: Record<Listing["propertyType"], string | null> = {
  SFR: "Single Family",
  Condo: "Condo",
  Townhome: "Townhouse",
  "2-4 Unit": null,
};

interface RentAvmBody {
  rent?: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
}

export function parseRentAvm(body: unknown): RentEstimate {
  const b = body as RentAvmBody | null | undefined;
  if (!b || typeof b !== "object" || typeof b.rent !== "number") {
    throw new ProviderError("rentcast", "unexpected response shape");
  }
  if (!(b.rent > 0)) throw new ProviderError("rentcast", "no rent estimate");
  return {
    monthlyRent: Math.round(b.rent),
    low: typeof b.rentRangeLow === "number" ? Math.round(b.rentRangeLow) : undefined,
    high: typeof b.rentRangeHigh === "number" ? Math.round(b.rentRangeHigh) : undefined,
    source: "RentCast",
  };
}

export interface RentCastOptions {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  /** Cache rent by address so repeated searches do not re-bill. Default 24 hours. */
  cacheTtlMs?: number;
}

export function createRentCastRent(o: RentCastOptions): RentProvider {
  const cache = new TtlCache<RentEstimate>(o.cacheTtlMs ?? 24 * 60 * 60 * 1000);
  return {
    estimate(l: Listing) {
      const type = TYPE[l.propertyType];
      if (type === null) {
        return Promise.reject(new ProviderError("rentcast", "multi-family rent is per unit, not per building"));
      }
      const key = `${l.address}|${l.zip}|${l.beds}|${l.baths}|${l.sqft}|${l.propertyType}`.toLowerCase();
      return cache.get(key, async () => {
        const address = [l.address, l.city, l.state, l.zip].filter(Boolean).join(", ");
        const qs = new URLSearchParams({ address, propertyType: type });
        if (l.beds > 0) qs.set("bedrooms", String(l.beds));
        if (l.baths > 0) qs.set("bathrooms", String(l.baths));
        if (l.sqft > 0) qs.set("squareFootage", String(l.sqft));
        const body = await fetchJson(
          "rentcast",
          `${o.baseUrl ?? BASE}/avm/rent/long-term?${qs}`,
          { headers: { "x-api-key": o.apiKey, accept: "application/json" } },
          { fetchImpl: o.fetchImpl, timeoutMs: o.timeoutMs },
        );
        return parseRentAvm(body);
      });
    },
  };
}
