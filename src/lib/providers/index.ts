import { createBankingBridgeRate } from "./bankingbridge";
import { fixtureListings, fixtureRate, fixtureRent } from "./fixtures";
import { createHouseCanaryRent } from "./housecanary";
import type { ListingProvider, RateProvider, RentProvider } from "./types";

/**
 * Provider registry. Live providers are chosen by env and never fall back to fixtures: a misconfigured
 * live provider throws so the API returns an error instead of showing sample numbers as real ones.
 */
function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required for this provider`);
  return v;
}

let rentSingleton: RentProvider | undefined;
let rateSingleton: RateProvider | undefined;

export const listings = (): ListingProvider => {
  const p = process.env.LISTINGS_PROVIDER;
  if (!p || p === "fixture") return fixtureListings;
  throw new Error(`listings provider "${p}" is not implemented yet`);
};

export const rents = (): RentProvider => {
  const p = process.env.RENT_PROVIDER;
  if (!p || p === "fixture") return fixtureRent;
  if (p === "housecanary") {
    return (rentSingleton ??= createHouseCanaryRent({
      key: need("HOUSECANARY_API_KEY"),
      secret: need("HOUSECANARY_API_SECRET"),
    }));
  }
  throw new Error(`rent provider "${p}" is not implemented`);
};

export const rates = (): RateProvider => {
  const p = process.env.RATE_PROVIDER;
  if (!p || p === "fixture") return fixtureRate;
  if (p === "bankingbridge") {
    return (rateSingleton ??= createBankingBridgeRate({
      baseUrl: need("BANKINGBRIDGE_API_URL"),
      apiKey: need("BANKINGBRIDGE_API_KEY"),
      creditScore: process.env.PRICING_CREDIT_SCORE ? Number(process.env.PRICING_CREDIT_SCORE) : undefined,
    }));
  }
  throw new Error(`rate provider "${p}" is not implemented`);
};

export * from "./types";
