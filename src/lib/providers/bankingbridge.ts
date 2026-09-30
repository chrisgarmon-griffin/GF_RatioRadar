import { fetchJson, TtlCache, type FetchLike } from "./http";
import { ProviderError, type RateProvider, type RateQuote, type RateRequest } from "./types";

/**
 * BankingBridge rate adapter.  ASSUMED CONTRACT, NOT VERIFIED.
 *
 * BankingBridge sells a rate-display API (RateFlow) that fronts pricing engines such as Optimal Blue and Mortech.
 * Its integration docs are customer-only, so the request and response shapes below are placeholders that keep the
 * seam tested. Before this runs against a real account:
 *   1. Get the API docs and a sandbox key from BankingBridge (or Griffin's account owner).
 *   2. Replace buildRequest() and parseRate() with the documented shapes.
 *   3. Confirm the DSCR product and investor-occupancy pricing are exposed, and which inputs drive the price
 *      (credit score, DSCR tier, LTV, loan amount, lock period, prepay).
 * Everything else (timeouts, caching, error handling, wiring) is final.
 */

export interface BankingBridgeOptions {
  baseUrl: string;
  apiKey: string;
  /** Credit score assumed for a public search. A placeholder until Griffin sets the marketing scenario. */
  creditScore?: number;
  lockDays?: number;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  cacheTtlMs?: number;
}

export function buildRequest(r: RateRequest, o: Pick<BankingBridgeOptions, "creditScore" | "lockDays">) {
  const loanAmount = r.loanAmount ?? 300000;
  return {
    product: "DSCR",
    purpose: "purchase",
    occupancy: "investment",
    loanAmount,
    ltv: Math.round((1 - r.downPct) * 1000) / 10,
    termYears: r.fortyYear ? 40 : 30,
    interestOnly: r.interestOnly,
    creditScore: o.creditScore ?? 740,
    lockDays: o.lockDays ?? 30,
  };
}

/** Accepts { rate } or { quotes: [{ rate }] } and returns the lowest rate as a fraction (0.075 = 7.5%). */
export function parseRate(body: unknown): RateQuote {
  const b = body as { rate?: unknown; quotes?: { rate?: unknown }[]; asOf?: unknown } | null;
  const candidates = [b?.rate, ...(b?.quotes ?? []).map((q) => q.rate)].filter(
    (n): n is number => typeof n === "number" && n > 0,
  );
  if (!candidates.length) throw new ProviderError("bankingbridge", "no rate in response");
  const pctValue = Math.min(...candidates);
  // Rate sheets quote percent (7.5). Treat anything above 1 as percent.
  const rate = pctValue > 1 ? pctValue / 100 : pctValue;
  if (rate > 0.25) throw new ProviderError("bankingbridge", `implausible rate ${pctValue}`);
  return {
    rate,
    asOf: typeof b?.asOf === "string" ? b.asOf : new Date().toISOString().slice(0, 10),
    source: "BankingBridge",
  };
}

export function createBankingBridgeRate(o: BankingBridgeOptions): RateProvider {
  const cache = new TtlCache<RateQuote>(o.cacheTtlMs ?? 15 * 60 * 1000);
  return {
    quote(r) {
      const req = buildRequest(r, o);
      return cache.get(JSON.stringify(req), async () => {
        const body = await fetchJson(
          "bankingbridge",
          o.baseUrl,
          {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `Bearer ${o.apiKey}` },
            body: JSON.stringify(req),
          },
          { fetchImpl: o.fetchImpl, timeoutMs: o.timeoutMs },
        );
        return parseRate(body);
      });
    },
  };
}
