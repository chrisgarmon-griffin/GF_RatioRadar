export interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: "SFR" | "Condo" | "Townhome" | "2-4 Unit";
  daysOnMarket: number;
  /** Monthly HOA from listing; null/undefined means unknown, never confirmed zero. */
  monthlyHoa?: number | null;
  /** Licensed listing media URL, or null for the accessible no-photo fallback. Fixture images are illustrative only. */
  photoUrl: string | null;
  source: string;
}

export interface ListingQuery {
  states: string[];
  /** ZIP or ZIP prefix, e.g. "93706" or "937". */
  zip?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface RentEstimate {
  monthlyRent: number;
  low?: number;
  high?: number;
  fsd?: number;
  source: string;
}

export interface RateQuote {
  /** Annual note rate as a fraction. */
  rate: number;
  asOf: string;
  source: string;
}

export interface RateRequest {
  /** Representative scenario amount, not a property-specific quote. */
  loanAmount?: number;
  interestOnly: boolean;
  fortyYear: boolean;
  downPct: number;
}

export interface ListingProvider {
  search(q: ListingQuery): Promise<Listing[]>;
}
export interface RentProvider {
  estimate(l: Listing): Promise<RentEstimate>;
}
export interface RateProvider {
  quote(r: RateRequest): Promise<RateQuote>;
}

export class ProviderError extends Error {
  constructor(
    public provider: string,
    message: string,
    public status?: number,
  ) {
    super(`${provider}: ${message}`);
    this.name = "ProviderError";
  }
}
/** Explicit vendor no-data outcome, distinct from auth, quota and transport failures. */
export class RentUnavailableError extends ProviderError {}
