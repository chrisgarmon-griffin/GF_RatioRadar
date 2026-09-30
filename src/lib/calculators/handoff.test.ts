import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { storeHandoff, consumeHandoff } from "./handoff";
import { sampleScenario } from "./model";
const KEY = "ratioradar.calculator-handoff.v1";
let memory: Map<string, string>;
beforeEach(() => {
  memory = new Map();
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => memory.set(k, v),
    removeItem: (k: string) => memory.delete(k),
  });
});
afterEach(() => vi.unstubAllGlobals());
it("allowlists values and consumes exactly once for the correct destination", () => {
  const s = sampleScenario();
  s.values.email = "someone@example.com";
  expect(storeHandoff(s, "cashflow", "dscr")).toBe(true);
  expect(consumeHandoff("dscr")).toBeNull();
  const h = consumeHandoff("cashflow")!;
  expect(h.scenario.values.email).toBeUndefined();
  expect(h.scenario.values.grossRent).toBe("3000");
  expect(consumeHandoff("cashflow")).toBeNull();
});
it("rejects expired or malformed stored scenarios", () => {
  storeHandoff(sampleScenario(), "dscr", "property");
  const p = JSON.parse(memory.get(KEY)!);
  p.createdAt = Date.now() - 21 * 60 * 1000;
  memory.set(KEY, JSON.stringify(p));
  expect(consumeHandoff("dscr")).toBeNull();
  memory.set(KEY, "broken");
  expect(consumeHandoff("dscr")).toBeNull();
  expect(memory.has(KEY)).toBe(false);
});
it("returns false when storage is unavailable", () => {
  vi.stubGlobal("sessionStorage", {
    setItem: () => {
      throw Error("blocked");
    },
  });
  expect(storeHandoff(sampleScenario(), "dscr", "property")).toBe(false);
});
