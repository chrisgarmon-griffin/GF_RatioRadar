import { fixtureListings, fixtureRate, fixtureRent } from "./fixtures";
import type { ListingProvider, RateProvider, RentProvider } from "./types";

/**
 * Provider registry. "live" implementations (Constellation, HouseCanary, BankingBridge)
 * are not built yet; selecting them fails loudly instead of silently serving fixtures.
 */
function pick<T>(name: string, env: string | undefined, fixture: T): T {
  if (!env || env === "fixture") return fixture;
  throw new Error(`${name} provider "${env}" is not implemented yet`);
}

export const listings = (): ListingProvider => pick("listings", process.env.LISTINGS_PROVIDER, fixtureListings);
export const rents = (): RentProvider => pick("rent", process.env.RENT_PROVIDER, fixtureRent);
export const rates = (): RateProvider => pick("rate", process.env.RATE_PROVIDER, fixtureRate);
export * from "./types";
