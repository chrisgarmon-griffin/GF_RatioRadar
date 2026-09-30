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

export const listings = (): ListingProvider => {
  const p = process.env.LISTINGS_PROVIDER;
  if (!p || p === "fixture") return fixtureListings;
  throw new Error(`listings provider "${p}" is not implemented yet`);
};

export const rents = (): RentProvider => {
  const p = process.env.RENT_PROVIDER;
  if (!p || p === "fixture") return fixtureRent;
  if (p === "housecanary") {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false")
      throw new Error("Live rent lookups are disabled in demo mode");
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
    throw new Error(
      "BankingBridge prototype is not a live pricing integration. Account-specific DSCR mapping and rate-card selection must be verified first.",
    );
  }
  throw new Error(`rate provider "${p}" is not implemented`);
};

export * from "./types";
