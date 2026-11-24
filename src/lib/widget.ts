import { computeDscr, DEFAULT_ASSUMPTIONS, requiredDownPayment, type Assumptions, type DownPaymentNeed } from "./dscr";
import { rates, rents } from "./providers";

/**
 * Quote for the embeddable broker widget (PRIVATE DEMO).
 * The host listing page supplies the property facts. Real annual taxes and HOA dues, when the page has them,
 * replace the purchase-price placeholders, which is the main accuracy gain over the search cards.
 * No MLS data is fetched or stored here: the widget only receives what the embedding page passes in.
 */
export interface WidgetInput {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  /** Annual property tax in dollars, from the listing. Optional. */
  taxAnnual?: number;
  /** Monthly HOA dues in dollars, from the listing. Optional. */
  hoaMonthly?: number;
  downPct: number;
  interestOnly: boolean;
  fortyYear: boolean;
}

export type WidgetValidation = { ok: true; input: WidgetInput } | { ok: false; error: string };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);

export function validateWidget(body: unknown): WidgetValidation {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request" };
  const b = body as Record<string, unknown>;
  const price = num(b.price);
  if (!(price >= 20_000 && price <= 20_000_000)) return { ok: false, error: "Listing price is missing or out of range" };
  const zip = str(b.zip, 10);
  if (!/^\d{5}$/.test(zip)) return { ok: false, error: "ZIP code is missing" };
  const downPct = Number.isNaN(num(b.downPct)) ? DEFAULT_ASSUMPTIONS.minDownPct : num(b.downPct);
  if (!(downPct >= DEFAULT_ASSUMPTIONS.minDownPct && downPct <= DEFAULT_ASSUMPTIONS.maxDownPct)) {
    return { ok: false, error: "Down payment must be between 20% and 50%" };
  }
  const interestOnly = b.interestOnly === true;
  const fortyYear = b.fortyYear === true && !interestOnly;
  const opt = (v: unknown, max: number) => {
    const n = num(v);
    return n > 0 && n <= max ? n : undefined;
  };
  const nonNeg = (v: unknown) => {
    const n = num(v);
    return n > 0 ? n : 0;
  };
  return {
    ok: true,
    input: {
      address: str(b.address, 120),
      city: str(b.city, 80),
      state: str(b.state, 2).toUpperCase(),
      zip,
      price,
      beds: nonNeg(b.beds),
      baths: nonNeg(b.baths),
      sqft: nonNeg(b.sqft),
      taxAnnual: opt(b.taxAnnual, price * 0.1),
      hoaMonthly: opt(b.hoaMonthly, 5_000),
      downPct,
      interestOnly,
      fortyYear,
    },
  };
}

export interface WidgetQuote {
  dscr: number;
  dscrLow?: number;
  dscrHigh?: number;
  monthlyRent: number;
  rentSource: string;
  rate: number;
  rateSource: string;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  pitia: number;
  downPct: number;
  downPayment: number;
  need: DownPaymentNeed;
  /** True when the listing's own tax figure was used instead of the purchase-price placeholder. */
  usedListingTax: boolean;
}

// Uses the search-scope rent provider, which stays on sample data, so the demo cannot run up paid rent calls.
export async function quoteWidget(i: WidgetInput): Promise<WidgetQuote> {
  const [rent, rate] = await Promise.all([
    rents().estimate({
      id: "widget", address: i.address, city: i.city, state: i.state, zip: i.zip, price: i.price,
      beds: i.beds, baths: i.baths, sqft: i.sqft, propertyType: "SFR", daysOnMarket: 0, photoUrl: null, source: "widget",
    }),
    rates().quote({ interestOnly: i.interestOnly, fortyYear: i.fortyYear, downPct: i.downPct, loanAmount: Math.round(i.price * (1 - i.downPct)) }),
  ]);
  const taxAnnual = i.taxAnnual ?? i.price * DEFAULT_ASSUMPTIONS.taxRate;
  const hoa = i.hoaMonthly ?? 0;
  // HOA is a fixed monthly cost like tax, so fold it into the price-based rate the engine already handles.
  const a: Assumptions = { ...DEFAULT_ASSUMPTIONS, taxRate: (taxAnnual + hoa * 12) / i.price };
  const base = { price: i.price, annualRate: rate.rate, interestOnly: i.interestOnly, fortyYear: i.fortyYear };
  const at = (monthlyRent: number) => computeDscr({ ...base, monthlyRent, downPct: i.downPct }, a);
  const mid = at(rent.monthlyRent);
  return {
    dscr: mid.dscr,
    dscrLow: rent.low ? at(rent.low).dscr : undefined,
    dscrHigh: rent.high ? at(rent.high).dscr : undefined,
    monthlyRent: rent.monthlyRent,
    rentSource: rent.source,
    rate: rate.rate,
    rateSource: rate.source,
    monthlyPI: mid.monthlyPI,
    monthlyTax: taxAnnual / 12,
    monthlyInsurance: (i.price * DEFAULT_ASSUMPTIONS.insuranceRate) / 12,
    monthlyHoa: hoa,
    pitia: mid.pitia,
    downPct: i.downPct,
    downPayment: mid.downPayment,
    need: requiredDownPayment({ ...base, monthlyRent: rent.monthlyRent }, undefined, a),
    usedListingTax: i.taxAnnual !== undefined,
  };
}
