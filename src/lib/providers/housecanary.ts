import { fetchJson, TtlCache, type FetchLike } from "./http";
import { ProviderError, type Listing, type RentEstimate, type RentProvider } from "./types";

/**
 * HouseCanary rental AVM adapter.
 *
 * Contract used (HouseCanary Analytics API docs, GET /v2/property/rental_value; request and response shape confirmed
 * against the docs page and its 200 sample on 2026-10-01; not yet run against a live account):
 *   GET https://api.housecanary.com/v2/property/rental_value?address=<number street>&city=&state=&zipcode=
 *   (the docs say a non-slug request must carry the other identifiers, so we send city, state and zip too)
 *   HTTP Basic auth: API key as user, API secret as password.
 *   200 body: an ARRAY, one element per property:
 *     [ { "property/rental_value": { "api_code": 0, "api_code_description": "ok",
 *           "result": { "price_mean": n, "price_lwr": n, "price_upr": n, "fsd": n } },
 *         "address_info": { ... } } ]
 * A non-zero api_code inside a 200 means the property could not be valued.
 * The docs label this endpoint "Pricing Tier: Premium". Confirm the contracted per-call price before launch.
 */

const BASE = "https://api.housecanary.com/v2";

interface RentalValueBody {
  address_info?: { status?: { match?: boolean } };
  "property/rental_value"?: {
    api_code?: number;
    api_code_description?: string;
    result?: { price_mean?: number; price_lwr?: number; price_upr?: number; fsd?: number };
  };
}

export function parseRentalValue(body: unknown): RentEstimate {
  // Live responses are an array with one element per property. Accept a bare object too.
  const first = (Array.isArray(body) ? body[0] : body) as RentalValueBody | null | undefined;
  const node = first?.["property/rental_value"];
  if (!node) throw new ProviderError("housecanary", "unexpected response shape");
  // address_info.status.match is false when HouseCanary could not verify the address. Do not price a guess.
  if (first?.address_info?.status?.match === false) {
    throw new ProviderError("housecanary", "no rent estimate (address not matched)");
  }
  if (node.api_code !== 0 || !node.result) {
    throw new ProviderError("housecanary", `no rent estimate (${node.api_code_description ?? `code ${node.api_code}`})`);
  }
  const { price_mean, price_lwr, price_upr, fsd } = node.result;
  if (typeof price_mean !== "number" || !(price_mean > 0)) throw new ProviderError("housecanary", "missing price_mean");
  return {
    monthlyRent: Math.round(price_mean),
    low: typeof price_lwr === "number" ? Math.round(price_lwr) : undefined,
    high: typeof price_upr === "number" ? Math.round(price_upr) : undefined,
    fsd: typeof fsd === "number" ? fsd : undefined,
    source: "HouseCanary",
  };
}

export interface HouseCanaryOptions {
  key: string;
  secret: string;
  baseUrl?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  /** Cache rent by address so repeated searches do not re-bill. Default 24 hours (the model refreshes monthly). */
  cacheTtlMs?: number;
}

export function createHouseCanaryRent(o: HouseCanaryOptions): RentProvider {
  const cache = new TtlCache<RentEstimate>(o.cacheTtlMs ?? 24 * 60 * 60 * 1000);
  const auth = "Basic " + Buffer.from(`${o.key}:${o.secret}`).toString("base64");
  return {
    estimate(l: Listing) {
      const key = `${l.address}|${l.zip}`.toLowerCase();
      return cache.get(key, async () => {
        const qs = new URLSearchParams({ address: l.address, city: l.city, state: l.state, zipcode: l.zip });
        const body = await fetchJson(
          "housecanary",
          `${o.baseUrl ?? BASE}/property/rental_value?${qs}`,
          { headers: { authorization: auth, accept: "application/json" } },
          { fetchImpl: o.fetchImpl, timeoutMs: o.timeoutMs },
        );
        return parseRentalValue(body);
      });
    },
  };
}
