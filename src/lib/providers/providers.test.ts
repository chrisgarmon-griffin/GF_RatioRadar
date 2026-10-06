import { describe, expect, it, vi } from "vitest";
import { parseRentalValue, createHouseCanaryRent } from "./housecanary";
import { buildRequest, createBankingBridgeRate, parseRate } from "./bankingbridge";
import { TtlCache } from "./http";
import { ProviderError, type Listing } from "./types";

const listing: Listing = {
  id: "x", address: "1204 Alder St", city: "Fresno", state: "CA", zip: "93706", price: 349000,
  beds: 3, baths: 2, sqft: 1420, propertyType: "SFR", daysOnMarket: 12, photoUrl: null, source: "t",
};

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const hcBody = (result: object, code = 0) => ({
  "property/rental_value": { api_code: code, api_code_description: code ? "no data" : "ok", result },
});

describe("HouseCanary adapter", () => {
  it("parses mean, range and fsd", () => {
    expect(parseRentalValue(hcBody({ price_mean: 4642.4, price_lwr: 3834, price_upr: 5673, fsd: 0.198 }))).toEqual({
      monthlyRent: 4642, low: 3834, high: 5673, fsd: 0.198, source: "HouseCanary",
    });
  });
  it("parses the live array shape with address_info", () => {
    const body = [{ ...hcBody({ price_mean: 2450, price_lwr: 2254, price_upr: 2646 }), address_info: { zipcode: "93706" } }];
    expect(parseRentalValue(body)).toMatchObject({ monthlyRent: 2450, low: 2254, high: 2646 });
    expect(() => parseRentalValue([])).toThrow(/unexpected response/);
  });
  it("treats an unmatched address as no estimate", () => {
    const body = [{ ...hcBody({ price_mean: 1800 }), address_info: { status: { match: false } } }];
    expect(() => parseRentalValue(body)).toThrow(/no rent estimate/);
  });
  it("rejects a non-zero api_code and odd shapes", () => {
    expect(() => parseRentalValue(hcBody({}, 3))).toThrow(/no rent estimate/);
    expect(() => parseRentalValue({})).toThrow(/unexpected response/);
    expect(() => parseRentalValue(hcBody({ price_mean: 0 }))).toThrow(/price_mean/);
  });
  it("sends basic auth, address and zipcode, and caches by address", async () => {
    const fetchImpl = vi.fn(async () => ok([hcBody({ price_mean: 2450, price_lwr: 2254, price_upr: 2646 })]));
    const p = createHouseCanaryRent({ key: "k", secret: "s", fetchImpl });
    await p.estimate(listing);
    await p.estimate(listing);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("/v2/property/rental_value?");
    expect(url).toContain("address=1204+Alder+St");
    expect(url).toContain("zipcode=93706");
    expect(url).toContain("city=Fresno");
    expect(url).toContain("state=CA");
    expect((init.headers as Record<string, string>).authorization).toBe("Basic " + Buffer.from("k:s").toString("base64"));
  });
  it("omits city and state when they are empty (test addresses)", async () => {
    const fetchImpl = vi.fn(async () => ok([hcBody({ price_mean: 1800 })]));
    const p = createHouseCanaryRent({ key: "k", secret: "s", fetchImpl });
    await p.estimate({ ...listing, address: "123 Main St", zip: "12345", city: "", state: "" });
    const url = (fetchImpl.mock.calls[0] as unknown as [string])[0];
    expect(url).toContain("address=123+Main+St");
    expect(url).not.toContain("city=");
    expect(url).not.toContain("state=");
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
    expect(buildRequest({ interestOnly: true, fortyYear: false, downPct: 0.25, loanAmount: 262500 }, { creditScore: 720 })).toMatchObject({
      product: "DSCR", occupancy: "investment", ltv: 75, termYears: 30, interestOnly: true, creditScore: 720, loanAmount: 262500,
    });
  });
  it("parses percent or fraction and takes the lowest quote", () => {
    expect(parseRate({ rate: 7.25 }).rate).toBeCloseTo(0.0725);
    expect(parseRate({ quotes: [{ rate: 7.5 }, { rate: 7.125 }] }).rate).toBeCloseTo(0.07125);
    expect(parseRate({ rate: 0.07 }).rate).toBeCloseTo(0.07);
  });
  it("rejects empty and implausible responses", () => {
    expect(() => parseRate({})).toThrow(/no rate/);
    expect(() => parseRate({ rate: 750 })).toThrow(/implausible/);
  });
  it("posts the scenario with a bearer key and caches identical scenarios", async () => {
    const fetchImpl = vi.fn(async () => ok({ rate: 7.25 }));
    const p = createBankingBridgeRate({ baseUrl: "https://example.test/quote", apiKey: "abc", fetchImpl });
    const req = { interestOnly: false, fortyYear: false, downPct: 0.2, loanAmount: 280000 };
    await p.quote(req);
    await p.quote(req);
    await p.quote({ ...req, interestOnly: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer abc");
    expect(init.method).toBe("POST");
  });
});

describe("TtlCache", () => {
  it("expires entries", async () => {
    let t = 0;
    const c = new TtlCache<number>(1000, () => t);
    const load = vi.fn(async () => 1);
    await c.get("a", load);
    t = 999; await c.get("a", load);
    t = 1001; await c.get("a", load);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

import { createRentCastRent, parseRentAvm } from "./rentcast";

describe("RentCast adapter", () => {
  const body = { rent: 1620, rentRangeLow: 1550, rentRangeHigh: 1690, subjectProperty: {}, comparables: [] };
  it("parses rent and range, with no fsd", () => {
    expect(parseRentAvm(body)).toEqual({ monthlyRent: 1620, low: 1550, high: 1690, source: "RentCast" });
  });
  it("rejects odd shapes and zero rent", () => {
    expect(() => parseRentAvm({})).toThrow(/unexpected response/);
    expect(() => parseRentAvm(null)).toThrow(/unexpected response/);
    expect(() => parseRentAvm({ rent: 0 })).toThrow(/no rent estimate/);
  });
  it("sends the key header, a full address and the property facts, and caches", async () => {
    const fetchImpl = vi.fn(async () => ok(body));
    const p = createRentCastRent({ apiKey: "k", fetchImpl });
    await p.estimate(listing);
    await p.estimate(listing);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("/v1/avm/rent/long-term?");
    expect(decodeURIComponent(url.replace(/\+/g, " "))).toContain("address=1204 Alder St, Fresno, CA, 93706");
    expect(url).toContain("propertyType=Single+Family");
    expect(url).toContain("bedrooms=3");
    expect(url).toContain("bathrooms=2");
    expect(url).toContain("squareFootage=1420");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("k");
  });
  it("refuses 2-4 unit properties without calling the API", async () => {
    const fetchImpl = vi.fn(async () => ok(body));
    const p = createRentCastRent({ apiKey: "k", fetchImpl });
    await expect(p.estimate({ ...listing, propertyType: "2-4 Unit" })).rejects.toThrow(/per unit/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("maps HTTP errors and does not cache failures", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 403 })).mockResolvedValueOnce(ok(body));
    const p = createRentCastRent({ apiKey: "k", fetchImpl });
    await expect(p.estimate(listing)).rejects.toMatchObject({ status: 403 });
    await expect(p.estimate(listing)).resolves.toMatchObject({ monthlyRent: 1620 });
  });
});
