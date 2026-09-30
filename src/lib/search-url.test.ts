import { describe, it, expect } from "vitest";
import { parseSearch, searchUrl, DEFAULTS } from "./search-url";
describe("shareable search state", () => {
  it("round trips all scenario inputs without dropping campaign attribution", () => {
    const input = {
      ...DEFAULTS,
      states: ["TX", "FL"],
      zip: "33",
      minPrice: 200000,
      maxPrice: 600000,
      downPct: 0.35,
      fortyYear: true,
      mode: "inverse" as const,
    };
    const output = searchUrl(input, "utm_source=partner");
    expect(output).toContain("utm_source=partner");
    expect(
      parseSearch(new URLSearchParams(output.slice(1).split("#")[0])),
    ).toEqual(input);
  });
  it("rejects invalid states, percentages and prices", () => {
    expect(
      parseSearch(
        new URLSearchParams("states=XX&down=NaN&min=-1&max=Infinity&zip=bad"),
      ),
    ).toEqual({
      ...DEFAULTS,
      zip: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });
  it("keeps interest only mutually exclusive with forty years", () => {
    const p = parseSearch(new URLSearchParams("io=1&y40=1"));
    expect(p.interestOnly).toBe(true);
    expect(p.fortyYear).toBe(false);
  });
  it("deduplicates states and preserves supported custom down payments", () => {
    const p = parseSearch(new URLSearchParams("states=TX,TX,FL&down=0.325"));
    expect(p.states).toEqual(["TX", "FL"]);
    expect(p.downPct).toBe(0.325);
  });
});
