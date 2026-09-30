import type { Scenario } from "./model";
const KEY = "ratioradar.calculator-handoff.v1";
const allowed = [
  "propertyValue",
  "downPct",
  "grossRent",
  "annualRevenue",
  "ratePct",
  "termYears",
  "taxes",
  "insurance",
  "hoa",
  "flood",
  "strFactor",
  "maxLtv",
  "currentBalance",
  "desiredCashOut",
  "closingCosts",
  "vacancyPct",
  "management",
  "maintenance",
  "utilities",
  "otherOperating",
  "debtService",
  "cashInvested",
];
export function storeHandoff(
  scenario: Scenario,
  target: "dscr" | "cashflow",
  source: string,
): boolean {
  try {
    const values = Object.fromEntries(
      Object.entries(scenario.values).filter(
        ([k, v]) =>
          allowed.includes(k) && typeof v === "string" && v.length < 32,
      ),
    );
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        version: 1,
        createdAt: Date.now(),
        target,
        source,
        scenario: { ...scenario, values },
      }),
    );
    return true;
  } catch {
    return false;
  }
}
export function consumeHandoff(
  target: "dscr" | "cashflow",
): { scenario: Scenario; source: string } | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p.target !== target) return null;
    sessionStorage.removeItem(KEY);
    if (
      p.version !== 1 ||
      !Number.isFinite(p.createdAt) ||
      Date.now() - p.createdAt > 20 * 60 * 1000 ||
      Date.now() < p.createdAt ||
      !p.scenario ||
      !["purchase", "refinance"].includes(p.scenario.transaction) ||
      !["ltr", "str"].includes(p.scenario.rental) ||
      !["amortizing", "interest_only"].includes(p.scenario.payment) ||
      typeof p.scenario.values !== "object" ||
      p.scenario.values === null
    )
      return null;
    const values = Object.fromEntries(
      Object.entries(p.scenario.values).filter(
        ([k, v]) =>
          allowed.includes(k) && typeof v === "string" && v.length < 32,
      ),
    );
    return {
      scenario: { ...p.scenario, values },
      source:
        p.source === "property"
          ? "Sample property"
          : p.source === "dscr"
            ? "DSCR calculator"
            : "Cash-flow calculator",
    };
  } catch {
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
    return null;
  }
}
