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
  /** Constellation supplies no photos. Null means show the placeholder and outbound-link risk applies. */
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
  /** Model confidence where the source reports one (HouseCanary forecast standard deviation). Lower is tighter. */
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
  interestOnly: boolean;
  fortyYear: boolean;
  downPct: number;
  /** Representative loan amount for pricing. Rate sheets adjust by loan size. */
  loanAmount?: number;
}

/** Thrown by live providers when a vendor call fails. The message is safe to log, not to show users. */
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

export interface ListingProvider {
  search(q: ListingQuery): Promise<Listing[]>;
}
export interface RentProvider {
  estimate(l: Listing): Promise<RentEstimate>;
}
export interface RateProvider {
  quote(r: RateRequest): Promise<RateQuote>;
}
