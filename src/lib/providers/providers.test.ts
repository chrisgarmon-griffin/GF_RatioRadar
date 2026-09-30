import { describe, expect, it, vi } from "vitest";
import { parseRentalValue, createHouseCanaryRent } from "./housecanary";
import {
  buildRequest,
  createBankingBridgeRate,
  parseRate,
} from "./bankingbridge";
import { TtlCache } from "./http";
import { ProviderError, type Listing } from "./types";

const listing: Listing = {
  id: "x",
  address: "1204 Alder St",
  city: "Fresno",
  state: "CA",
  zip: "93706",
  price: 349000,
  beds: 3,
  baths: 2,
  sqft: 1420,
  propertyType: "SFR",
  daysOnMarket: 12,
  photoUrl: null,
  source: "t",
};

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });
const hcBody = (result: object, code = 0) => ({
  "property/rental_value": {
    api_code: code,
    api_code_description: code ? "no data" : "ok",
    result,
  },
});

describe("HouseCanary adapter", () => {
  it("parses mean, range and fsd", () => {
    expect(
      parseRentalValue(
        hcBody({
          price_mean: 4642.4,
          price_lwr: 3834,
          price_upr: 5673,
          fsd: 0.198,
        }),
      ),
    ).toEqual({
      monthlyRent: 4642,
      low: 3834,
      high: 5673,
      fsd: 0.198,
      source: "HouseCanary",
    });
  });
  it("rejects a non-zero api_code and odd shapes", () => {
    expect(() => parseRentalValue(hcBody({}, 204))).toThrow(/no rent estimate/);
    expect(() => parseRentalValue({})).toThrow(/unexpected response/);
    expect(() => parseRentalValue(hcBody({ price_mean: 0 }))).toThrow(
      /price_mean/,
    );
  });
  it("sends basic auth, address and zipcode, and caches by address", async () => {
    const fetchImpl = vi.fn(async () =>
      ok(hcBody({ price_mean: 2450, price_lwr: 2254, price_upr: 2646 })),
    );
    const p = createHouseCanaryRent({ key: "k", secret: "s", fetchImpl });
    await p.estimate(listing);
    await p.estimate(listing);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toContain("/v2/property/rental_value?");
    expect(url).toContain("address=1204+Alder+St");
    expect(url).toContain("zipcode=93706");
    expect((init.headers as Record<string, string>).authorization).toBe(
      "Basic " + Buffer.from("k:s").toString("base64"),
    );
  });
  it("maps HTTP errors and does not cache failures", async () => {
    const fetchImpl = vi.fn(async () => new Response("no", { status: 401 }));
    const p = createHouseCanaryRent({ key: "k", secret: "bad", fetchImpl });
    await expect(p.estimate(listing)).rejects.toBeInstanceOf(ProviderError);
    await expect(p.estimate(listing)).rejects.toThrow(/HTTP 401/);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe("BankingBridge adapter (assumed contract)", () => {
  it("builds a DSCR investment purchase request from the search", () => {
    expect(
      buildRequest(
        {
          interestOnly: true,
          fortyYear: false,
          downPct: 0.25,
          loanAmount: 262500,
        },
        { creditScore: 720 },
      ),
    ).toMatchObject({
      product: "DSCR",
      occupancy: "investment",
      ltv: 75,
      termYears: 30,
      interestOnly: true,
      creditScore: 720,
      loanAmount: 262500,
    });
  });
  it("parses percent or fraction and takes the lowest quote", () => {
    expect(parseRate({ rate: 7.25 }).rate).toBeCloseTo(0.0725);
    expect(
      parseRate({ quotes: [{ rate: 7.5 }, { rate: 7.125 }] }).rate,
    ).toBeCloseTo(0.07125);
    expect(parseRate({ rate: 0.07 }).rate).toBeCloseTo(0.07);
  });
  it("rejects empty and implausible responses", () => {
    expect(() => parseRate({})).toThrow(/no rate/);
    expect(() => parseRate({ rate: 750 })).toThrow(/implausible/);
  });
  it("posts the scenario with a bearer key and caches identical scenarios", async () => {
    const fetchImpl = vi.fn(async () => ok({ rate: 7.25 }));
    const p = createBankingBridgeRate({
      baseUrl: "https://example.test/quote",
      apiKey: "abc",
      fetchImpl,
    });
    const req = {
      interestOnly: false,
      fortyYear: false,
      downPct: 0.2,
      loanAmount: 280000,
    };
    await p.quote(req);
    await p.quote(req);
    await p.quote({ ...req, interestOnly: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const init = (
      fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    )[1];
    expect((init.headers as Record<string, string>).authorization).toBe(
      "Bearer abc",
    );
    expect(init.method).toBe("POST");
  });
});

describe("TtlCache", () => {
  it("expires entries", async () => {
    let t = 0;
    const c = new TtlCache<number>(1000, () => t);
    const load = vi.fn(async () => 1);
    await c.get("a", load);
    t = 999;
    await c.get("a", load);
    t = 1001;
    await c.get("a", load);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe("provider validation and deployment boundaries", () => {
  it("accepts the documented single-property array response", () => {
    expect(
      parseRentalValue([
        hcBody({
          price_mean: 1800,
          price_lwr: 1750,
          price_upr: 1850,
          fsd: 0.08,
        }),
      ]).monthlyRent,
    ).toBe(1800);
  });
  it("rejects ambiguous batches and invalid numerical values", () => {
    expect(() =>
      parseRentalValue([
        hcBody({ price_mean: 1800 }),
        hcBody({ price_mean: 1900 }),
      ]),
    ).toThrow();
    for (const values of [
      { price_mean: Infinity },
      { price_mean: NaN },
      { price_mean: 2000, price_lwr: 2100 },
      { price_mean: 2000, price_upr: 1800 },
      { price_mean: 2000, fsd: -1 },
    ])
      expect(() => parseRentalValue(hcBody(values))).toThrow();
  });
  it("does not misclassify an unknown vendor error as missing rent", () => {
    expect(() => parseRentalValue(hcBody({}, 401))).toThrow(
      /invalid vendor status/,
    );
  });
  it("blocks unverified BankingBridge network calls", () => {
    expect(() =>
      createBankingBridgeRate({
        baseUrl: "https://api.bankingbridge.com/rateflow",
        apiKey: "test",
      }),
    ).toThrow(/test transport only/);
  });
  it("does not send fictional property addresses to HouseCanary", () => {
    const fetchImpl = vi.fn();
    const p = createHouseCanaryRent({ key: "k", secret: "s", fetchImpl });
    expect(() => p.estimate({ ...listing, source: "fixture" })).toThrow(
      /sample addresses/,
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("maps an HTTP no-content response to missing rent", async () => {
    const p = createHouseCanaryRent({
      key: "k",
      secret: "s",
      fetchImpl: async () => new Response(null, { status: 204 }),
    });
    await expect(p.estimate(listing)).rejects.toMatchObject({ status: 204 });
  });
  it("deduplicates concurrent cache requests and bounds cache size", async () => {
    const c = new TtlCache<number>(1000, () => 0, 2);
    const load = vi.fn(async () => 1);
    await Promise.all([c.get("a", load), c.get("a", load)]);
    expect(load).toHaveBeenCalledTimes(1);
    await c.get("b", load);
    await c.get("c", load);
    await c.get("a", load);
    expect(load).toHaveBeenCalledTimes(4);
  });
});
