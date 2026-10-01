/** Server-side Rateflow contract. Not the sample-listing RateProvider adapter. */
import { fetchJson, type FetchLike } from "./http";
import { ProviderError } from "./types";

export interface RateflowScenario {
  propertyPrice: number;
  loanAmount: number;
  creditScore: number;
  zip: string;
  lockDays: 15 | 30 | 45 | 60 | 90;
}
export interface RateflowCard {
  ratePercent: number;
  aprPercent: number;
  price: number;
  points: number;
  principalAndInterest: number;
  monthlyMortgageInsurance: number;
  productName: string;
  amortizationType: string;
  termYears: number;
  lockDays: number;
  quoteId: number;
  asOf: string;
}
const fail = () => new ProviderError("rateflow", "Invalid or unavailable pricing response");

export function buildRateflowRequest(s: RateflowScenario, loid: number) {
  if (!Number.isSafeInteger(loid) || loid <= 0 ||
      !Number.isFinite(s.propertyPrice) || s.propertyPrice <= 0 ||
      !Number.isFinite(s.loanAmount) || s.loanAmount <= 0 || s.loanAmount > s.propertyPrice ||
      !Number.isInteger(s.creditScore) || s.creditScore < 300 || s.creditScore > 850 ||
      !/^\d{5}$/.test(s.zip) || ![15, 30, 45, 60, 90].includes(s.lockDays)) {
    throw new ProviderError("rateflow", "Invalid pricing scenario");
  }
  return {
    loid, list_price: s.propertyPrice, loan_amount: s.loanAmount,
    credit_score: s.creditScore, zipcode: s.zip, lock_period: s.lockDays,
    loan_type: "nonqm", nonqm_program: "dscr", residency_type: "rental_home",
    loan_purpose: "purchase", property_type: "single_family_home", loan_term: 30,
    ignore_cache: true,
  };
}

export function parseRateflowCards(body: unknown): RateflowCard[] {
  if (!Array.isArray(body) || !body.length) throw fail();
  return body.map((value: unknown) => {
    if (!value || typeof value !== "object") throw fail();
    const c = value as Record<string, unknown>;
    const number = (key: string, minimum = 0) => {
      const n = c[key];
      if (typeof n !== "number" || !Number.isFinite(n) || n < minimum) throw fail();
      return n;
    };
    const string = (key: string) => {
      if (typeof c[key] !== "string" || !c[key]) throw fail();
      return c[key] as string;
    };
    if (c.priceStatus !== "Available" || c.bbLoanType !== "nonqm" ||
        c.nonqm_program !== "dscr" || c.nonqm_program_match !== true) throw fail();
    const timestamp = number("lastUpdate", 1) * 1000;
    if (!Number.isFinite(new Date(timestamp).getTime())) throw fail();
    return {
      ratePercent: number("rate"), aprPercent: number("apr"), price: number("price"),
      points: number("pts", -100), principalAndInterest: number("principalAndInterest"),
      monthlyMortgageInsurance: number("monthlyMI"), productName: string("productName"),
      amortizationType: string("amortizationType"), termYears: number("loanTerm", 1),
      lockDays: number("lockPeriod", 1), quoteId: number("quote_id", 1),
      asOf: new Date(timestamp).toISOString(),
    };
  });
}

/** All returned cards retain vendor order; never select the lowest nominal rate. */
export function createRateflowClient(options: {
  apiKey: string; loid: number; fetchImpl?: FetchLike;
}) {
  if (typeof window !== "undefined") throw new Error("Rateflow is server-only");
  if (!options.apiKey.trim()) throw new ProviderError("rateflow", "Missing credentials");
  return {
    async quote(scenario: RateflowScenario) {
      const body = buildRateflowRequest(scenario, options.loid);
      const response = await fetchJson("rateflow", "https://api.bankingbridge.com/rateflow", {
        method: "POST", headers: { "content-type": "application/json", "x-api-key": options.apiKey },
        body: JSON.stringify(body),
      }, { fetchImpl: options.fetchImpl, timeoutMs: 20000 });
      return {
        scenario, cards: parseRateflowCards(response),
        assumptions: "Purchase, investment single-family home, 30-year term. Vendor DSCR and prepayment defaults require review before customer display.",
      };
    },
  };
}
