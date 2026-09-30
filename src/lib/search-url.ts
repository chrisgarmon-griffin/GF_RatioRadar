import type { SearchParams } from "./search";
export const STATES = ["CA", "TX", "FL"];
export const DEFAULTS: SearchParams = {
  mode: "forward",
  states: ["CA"],
  interestOnly: false,
  fortyYear: false,
  downPct: 0.2,
};
export function parseSearch(q: URLSearchParams): SearchParams {
  const states = (q.get("states") ?? "CA")
    .split(",")
    .filter((s) => STATES.includes(s));
  const price = (key: string) => {
    const n = Number(q.get(key));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const down = Number(q.get("down") ?? 0.2);
  const io = q.get("io") === "1";
  return {
    states: states.length ? [...new Set(states)] : ["CA"],
    mode: q.get("mode") === "inverse" ? "inverse" : "forward",
    zip: /^\d{1,5}$/.test(q.get("zip") ?? "") ? q.get("zip")! : undefined,
    minPrice: price("min"),
    maxPrice: price("max"),
    downPct: down >= 0.2 && down <= 0.5 ? down : 0.2,
    interestOnly: io,
    fortyYear: !io && q.get("y40") === "1",
  };
}
export function searchUrl(p: SearchParams, current: string): string {
  const q = new URLSearchParams(current);
  for (const k of ["mode", "states", "zip", "min", "max", "io", "y40", "down"])
    q.delete(k);
  q.set("states", p.states.join(","));
  q.set("down", String(p.downPct));
  if (p.mode === "inverse") q.set("mode", p.mode);
  if (p.zip) q.set("zip", p.zip);
  if (p.minPrice) q.set("min", String(p.minPrice));
  if (p.maxPrice) q.set("max", String(p.maxPrice));
  if (p.interestOnly) q.set("io", "1");
  if (p.fortyYear) q.set("y40", "1");
  return `?${q.toString()}#search`;
}
