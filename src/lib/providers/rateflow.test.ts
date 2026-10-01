import { describe, expect, it, vi } from "vitest";
import { buildRateflowRequest, createRateflowClient, parseRateflowCards } from "./rateflow";
const scenario = { propertyPrice: 500000, loanAmount: 400000, creditScore: 740, zip: "02101", lockDays: 30 as const };
const card = { rate: 7.125, apr: 7.13, price: 99.953, pts: .047, principalAndInterest: 2695, monthlyMI: 0, productName: "DSCR", amortizationType: "Fixed", loanTerm: 30, lockPeriod: 30, quote_id: 123, lastUpdate: 1790866527, priceStatus: "Available", bbLoanType: "nonqm", nonqm_program: "dscr", nonqm_program_match: true };
describe("verified Rateflow contract", () => {
  it("uses flat DSCR inputs and preserves ZIP leading zeros", () => {
    expect(buildRateflowRequest(scenario, 13882)).toMatchObject({ loid: 13882, zipcode: "02101", nonqm_program: "dscr", loan_type: "nonqm", residency_type: "rental_home" });
  });
  it.each([{loanAmount: 600000}, {creditScore: NaN}, {zip: "bad"}, {propertyPrice: 0}])("rejects invalid scenarios %j", change => {
    expect(() => buildRateflowRequest({...scenario, ...change}, 13882)).toThrow();
  });
  it("retains vendor order and distinguishes points from interest", () => {
    const cards = parseRateflowCards([card, {...card, rate: 6.99, pts: 1.466}]);
    expect(cards.map(c => c.ratePercent)).toEqual([7.125, 6.99]);
    expect(cards[1].points).toBe(1.466);
    expect(cards[0].asOf).toBe(new Date(card.lastUpdate * 1000).toISOString());
  });
  it.each([[], {status: "error"}, [{...card, rate: "7.125"}], [{...card, nonqm_program: "bank_statement"}], [{...card, lastUpdate: 1e100}]])("fails closed on unusable responses", body => {
    expect(() => parseRateflowCards(body)).toThrow();
  });
  it("uses x-api-key and does not return credentials", async () => {
    const transport = vi.fn(async () => new Response(JSON.stringify([card])));
    const result = await createRateflowClient({apiKey: "test-private-key", loid: 13882, fetchImpl: transport}).quote(scenario);
    expect(transport.mock.calls[0]).toBeDefined();
    expect(JSON.stringify(result)).not.toContain("test-private-key");
    const init = (transport.mock.calls as unknown as [string, RequestInit][])[0][1];
    expect(init.headers).toHaveProperty("x-api-key", "test-private-key");
    expect(init.headers).not.toHaveProperty("authorization");
  });
});
