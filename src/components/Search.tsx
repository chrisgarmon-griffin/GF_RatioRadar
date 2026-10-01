"use client";

import { useEffect, useState } from "react";
import type { SearchMode, SearchParams, SearchResponse, SearchRow } from "@/lib/search";
import { pct } from "@/lib/format";
import { ListingCard } from "./ListingCard";
import { LeadDialog } from "./LeadDialog";

const STATES = ["CA", "TX", "FL"];
const DOWNS = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
const PRICES = [0, 200000, 300000, 400000, 500000, 750000, 1000000];
const priceLabel = (n: number) => (n === 0 ? "No limit" : `$${(n / 1000).toLocaleString()}K`);

function fromUrl(): SearchParams {
  const q = new URLSearchParams(window.location.search);
  const num = (k: string) => (q.get(k) ? Number(q.get(k)) : undefined);
  const states = (q.get("states") ?? "CA").split(",").filter((s) => STATES.includes(s));
  const down = Number(q.get("down") ?? 0.2);
  const io = q.get("io") === "1";
  return {
    mode: q.get("mode") === "inverse" ? "inverse" : "forward",
    states: states.length ? states : ["CA"],
    zip: /^\d{1,5}$/.test(q.get("zip") ?? "") ? q.get("zip")! : undefined,
    minPrice: num("min") || undefined,
    maxPrice: num("max") || undefined,
    interestOnly: io,
    fortyYear: !io && q.get("y40") === "1",
    downPct: DOWNS.includes(down) ? down : 0.2,
  };
}

function toUrl(p: SearchParams) {
  const q = new URLSearchParams(window.location.search);
  for (const k of ["mode", "states", "zip", "min", "max", "io", "y40", "down"]) q.delete(k);
  q.set("mode", p.mode);
  q.set("states", p.states.join(","));
  if (p.zip) q.set("zip", p.zip);
  if (p.minPrice) q.set("min", String(p.minPrice));
  if (p.maxPrice) q.set("max", String(p.maxPrice));
  if (p.interestOnly) q.set("io", "1");
  if (p.fortyYear) q.set("y40", "1");
  q.set("down", String(p.downPct));
  return `${window.location.pathname}?${q.toString()}${window.location.hash}`;
}

const DEFAULTS: SearchParams = { mode: "forward", states: ["CA"], interestOnly: false, fortyYear: false, downPct: 0.2 };

export function Search() {
  const [p, setP] = useState<SearchParams>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SearchRow | null>(null);

  useEffect(() => {
    setP(fromUrl());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.history.replaceState(null, "", toUrl(p));
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetch("/api/search", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(new Error((await r.json()).error ?? "Search failed"))))
      .then((d: SearchResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.message);
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [p, ready]);

  const set = (patch: Partial<SearchParams>) => setP((cur) => ({ ...cur, ...patch }));
  const toggleState = (s: string) =>
    set({ states: p.states.includes(s) ? (p.states.length > 1 ? p.states.filter((x) => x !== s) : p.states) : [...p.states, s] });
  const mode = (m: SearchMode) => set({ mode: m });

  return (
    <section className="search-section" id="search" aria-labelledby="search-title">
      <div className="wrap">
        <form className="panel" onSubmit={(e) => e.preventDefault()}>
          <h2 id="search-title">Search properties by DSCR</h2>
          <div className="field">
            <span className="lbl">Search mode</span>
            <div className="seg" role="group" aria-label="Search mode">
              <button type="button" aria-pressed={p.mode === "forward"} onClick={() => mode("forward")}>Show my ratio</button>
              <button type="button" aria-pressed={p.mode === "inverse"} onClick={() => mode("inverse")}>Find 1.0 deals</button>
            </div>
            <p className="hint">{p.mode === "forward" ? "Every listing with its DSCR." : "Only listings that reach 1.0 within your down payment."}</p>
          </div>
          <div className="field">
            <span className="lbl">States</span>
            <div className="seg" role="group" aria-label="States">
              {STATES.map((s) => (
                <button key={s} type="button" aria-pressed={p.states.includes(s)} onClick={() => toggleState(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="zip">ZIP code (optional)</label>
            <input id="zip" type="text" inputMode="numeric" maxLength={5} placeholder="93706" value={p.zip ?? ""}
              onChange={(e) => set({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) || undefined })} />
          </div>
          <div className="field">
            <label htmlFor="minp">Min price</label>
            <select id="minp" value={p.minPrice ?? 0} onChange={(e) => set({ minPrice: Number(e.target.value) || undefined })}>
              {PRICES.slice(0, -1).map((n) => <option key={n} value={n}>{n === 0 ? "No minimum" : priceLabel(n)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="maxp">Max price</label>
            <select id="maxp" value={p.maxPrice ?? 0} onChange={(e) => set({ maxPrice: Number(e.target.value) || undefined })}>
              {PRICES.slice(1).concat(0).map((n) => <option key={n} value={n}>{n === 0 ? "No maximum" : priceLabel(n)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="down">{p.mode === "forward" ? "Down payment" : "Most I will put down"}</label>
            <select id="down" value={p.downPct} onChange={(e) => set({ downPct: Number(e.target.value) })}>
              {DOWNS.map((d) => <option key={d} value={d}>{pct(d)}</option>)}
            </select>
          </div>
          <div className="field">
            <span className="lbl">Loan options</span>
            <label className="check">
              <input type="checkbox" checked={p.interestOnly} onChange={(e) => set({ interestOnly: e.target.checked, fortyYear: e.target.checked ? false : p.fortyYear })} />
              Interest-only
            </label>
            <label className={`check ${p.interestOnly ? "off" : ""}`}>
              <input type="checkbox" checked={p.fortyYear} disabled={p.interestOnly} onChange={(e) => set({ fortyYear: e.target.checked })} />
              40-year amortization
            </label>
          </div>
        </form>

        <div className="results-head">
          <h2 aria-live="polite">{loading ? "Searching" : `${data?.rows.length ?? 0} ${data?.rows.length === 1 ? "property" : "properties"}`}</h2>
          {data && !loading && (
            <p className="meta">
              {data.rate.source === "fixture" ? "Sample rate" : "Rate"} {(data.rate.rate * 100).toFixed(3)}% ({data.rate.asOf}).{" "}
              {p.mode === "inverse" ? "Sorted by lowest down payment to reach 1.0." : "Sorted by highest DSCR."}
              {data.skipped > 0 && ` ${data.skipped} ${data.skipped === 1 ? "listing was" : "listings were"} left out because no rent estimate was available.`}
            </p>
          )}
        </div>

        {data && !error && data.rows.some((r) => r.rent.source === "HouseCanary") && (
          // HouseCanary requires a visible link wherever its data is shown publicly. Swap in the official
          // attribution snippet from the account's API Keys page (it carries an account-specific beacon).
          <p className="meta">
            Rent estimates from{" "}
            <a href="https://www.housecanary.com" target="_blank" rel="noreferrer noopener">HouseCanary</a>.
          </p>
        )}
        {error && <div className="state-box" role="alert">{error}</div>}
        {loading && !data && <div className="grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div>}
        {data && !error && (
          data.rows.length === 0 ? (
            <div className="state-box">
              <p>{p.mode === "inverse" ? "No listings reach 1.0 within that down payment." : "No listings match these filters."}</p>
              <p className="hint">{p.mode === "inverse" ? "Try a higher down payment, interest-only, or a wider price range." : "Widen the price range or clear the ZIP code."}</p>
            </div>
          ) : (
            <div className="grid" style={{ opacity: loading ? 0.55 : 1 }}>
              {data.rows.map((r) => <ListingCard key={r.listing.id} row={r} params={data.params} onSelect={setSelected} />)}
            </div>
          )
        )}
      </div>
      <LeadDialog row={selected} params={p} onClose={() => setSelected(null)} />
    </section>
  );
}
