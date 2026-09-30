import { fetchJson, TtlCache, type FetchLike } from "./http";
import {
  ProviderError,
  RentUnavailableError,
  type Listing,
  type RentEstimate,
  type RentProvider,
} from "./types";

/** HouseCanary rental AVM. Contract checked against https://api-docs.housecanary.com/
 * on 2026-09-30. No authenticated account call has been made.
 * Per-instance caching reduces repeated calls; it is not a billing guarantee.
 */

const BASE = "https://api.housecanary.com/v2";

interface RentalValueBody {
  "property/rental_value"?: {
    api_code?: number;
    api_code_description?: string;
    result?: {
      price_mean?: number;
      price_lwr?: number;
      price_upr?: number;
      fsd?: number;
    };
  };
}

export function parseRentalValue(body: unknown): RentEstimate {
  const envelope = Array.isArray(body)
    ? body.length === 1
      ? body[0]
      : null
    : body;
  const node = (envelope as RentalValueBody | null)?.["property/rental_value"];
  if (!node)
    throw new ProviderError("housecanary", "unexpected response shape");
  if (node.api_code === 204)
    throw new RentUnavailableError("housecanary", "no rent estimate", 204);
  if (node.api_code !== 0 || !node.result)
    throw new ProviderError("housecanary", "invalid vendor status");
  const { price_mean, price_lwr, price_upr, fsd } = node.result;
  const positive = (v: unknown): v is number =>
    typeof v === "number" && Number.isFinite(v) && v > 0;
  if (!positive(price_mean) || Math.round(price_mean) <= 0)
    throw new ProviderError("housecanary", "missing or invalid price_mean");
  if (
    (price_lwr !== undefined &&
      (!positive(price_lwr) || price_lwr > price_mean)) ||
    (price_upr !== undefined &&
      (!positive(price_upr) || price_upr < price_mean)) ||
    (fsd !== undefined &&
      (typeof fsd !== "number" || !Number.isFinite(fsd) || fsd < 0))
  ) {
    throw new ProviderError(
      "housecanary",
      "invalid rent range or forecast standard deviation",
    );
  }
  return {
    monthlyRent: Math.round(price_mean),
    low: price_lwr === undefined ? undefined : Math.round(price_lwr),
    high: price_upr === undefined ? undefined : Math.round(price_upr),
    fsd,
    source: "HouseCanary",
  };
}

export interface HouseCanaryOptions {
  key: string;
  secret: string;
  baseUrl?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  /** Per-instance cache by address. Default 24 hours; cold starts can repeat vendor calls. */
  cacheTtlMs?: number;
}

export function createHouseCanaryRent(o: HouseCanaryOptions): RentProvider {
  const cache = new TtlCache<RentEstimate>(o.cacheTtlMs ?? 24 * 60 * 60 * 1000);
  const auth =
    "Basic " + Buffer.from(`${o.key}:${o.secret}`).toString("base64");
  return {
    estimate(l: Listing) {
      if (l.source === "fixture")
        throw new ProviderError(
          "housecanary",
          "sample addresses cannot use paid lookups",
        );
      const key = `${l.address}|${l.zip}`.toLowerCase();
      return cache.get(key, async () => {
        const qs = new URLSearchParams({ address: l.address, zipcode: l.zip });
        let body: unknown;
        try {
          body = await fetchJson(
            "housecanary",
            `${o.baseUrl ?? BASE}/property/rental_value?${qs}`,
            { headers: { authorization: auth, accept: "application/json" } },
            { fetchImpl: o.fetchImpl, timeoutMs: o.timeoutMs },
          );
        } catch (error) {
          if (error instanceof ProviderError && error.status === 204)
            throw new RentUnavailableError(
              "housecanary",
              "no rent estimate",
              204,
            );
          throw error;
        }
        return parseRentalValue(body);
      });
    },
  };
}
