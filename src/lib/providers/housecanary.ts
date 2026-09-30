import { fetchJson, TtlCache, type FetchLike } from "./http";
import { ProviderError, type Listing, type RentEstimate, type RentProvider } from "./types";

/**
 * HouseCanary rental AVM adapter.
 *
 * Contract used (HouseCanary v2 API reference, checked 2026-09-30 via search snippets, not against a live account):
 *   GET https://api.housecanary.com/v2/property/rental_value?address=<street>&zipcode=<zip>
 *   HTTP Basic auth: API key as user, API secret as password.
 *   200 body: { "property/rental_value": { "api_code": 0, "api_code_description": "ok",
 *               "result": { "price_mean": n, "price_lwr": n, "price_upr": n, "fsd": n } } }
 * A non-zero api_code inside a 200 means the property could not be valued.
 * Confirm against the account's current Data Explorer docs and the contracted price per call before launch.
 */

const BASE = "https://api.housecanary.com/v2";

interface RentalValueBody {
  "property/rental_value"?: {
    api_code?: number;
    api_code_description?: string;
    result?: { price_mean?: number; price_lwr?: number; price_upr?: number; fsd?: number };
  };
}

export function parseRentalValue(body: unknown): RentEstimate {
  const node = (body as RentalValueBody | null)?.["property/rental_value"];
  if (!node) throw new ProviderError("housecanary", "unexpected response shape");
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
        const qs = new URLSearchParams({ address: l.address, zipcode: l.zip });
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
