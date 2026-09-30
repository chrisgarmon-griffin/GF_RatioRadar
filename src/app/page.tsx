"use client";

import { useEffect, useState } from "react";
import type { SearchMode, SearchResponse } from "@/lib/search";

const STATES = ["CA", "TX", "FL"];
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
const tone = (d: number) => (d >= 1 ? "good" : d >= 0.85 ? "warn" : "bad");

export default function Home() {
  const [mode, setMode] = useState<SearchMode>("forward");
  const [states, setStates] = useState<string[]>(["CA"]);
  const [interestOnly, setInterestOnly] = useState(false);
  const [fortyYear, setFortyYear] = useState(false);
  const [downPct, setDownPct] = useState(0.2);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setError(null);
    fetch("/api/search", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode, states, interestOnly, fortyYear, downPct }),
    })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(new Error((await r.json()).error ?? "Search failed"))))
      .then(setData)
      .catch((e) => e.name !== "AbortError" && setError(e.message));
    return () => ctrl.abort();
  }, [mode, states, interestOnly, fortyYear, downPct]);

  const toggleState = (s: string) =>
    setStates((cur) => (cur.includes(s) ? (cur.length > 1 ? cur.filter((x) => x !== s) : cur) : [...cur, s]));

  return (
    <main>
      <h1>Ratio Radar</h1>
      <p className="sub">Find properties by DSCR. Sample data only until live feeds are connected.</p>

      <section className="panel">
        <div>
          <label>Search mode</label>
          <div className="seg">
            <button className={mode === "forward" ? "on" : ""} onClick={() => setMode("forward")}>Show my ratio</button>
            <button className={mode === "inverse" ? "on" : ""} onClick={() => setMode("inverse")}>Find 1.0+ deals</button>
          </div>
        </div>
        <div>
          <label>States</label>
          <div className="seg">
            {STATES.map((s) => (
              <button key={s} className={states.includes(s) ? "on" : ""} onClick={() => toggleState(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label>{mode === "forward" ? "Down payment" : "Most I will put down"}</label>
          <select value={downPct} onChange={(e) => setDownPct(Number(e.target.value))}>
            {[0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5].map((d) => (
              <option key={d} value={d}>{pct(d)}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Loan options</label>
          <label className="check">
            <input type="checkbox" checked={interestOnly} onChange={(e) => { setInterestOnly(e.target.checked); if (e.target.checked) setFortyYear(false); }} />
            Interest-only
          </label>
          <label className="check">
            <input type="checkbox" checked={fortyYear} disabled={interestOnly} onChange={(e) => setFortyYear(e.target.checked)} />
            40-year amortization
          </label>
        </div>
      </section>

      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <p className="meta">
            {data.rows.length} properties · rate {(data.rate.rate * 100).toFixed(3)}% ({data.rate.source}, {data.rate.asOf})
            {mode === "inverse" && ` · sorted by lowest down payment to reach 1.0`}
          </p>
          <div className="grid">
            {data.rows.map(({ listing: l, rent, dscr, need }) => (
              <article className="card" key={l.id}>
                <div className="photo">{l.photoUrl ? <img src={l.photoUrl} alt="" /> : "No photo available"}</div>
                <div className="body">
                  <div className="price">{money(l.price)}</div>
                  <div className="addr">{l.address}, {l.city}, {l.state} {l.zip}</div>
                  <div className={`ratio ${tone(dscr)}`}>
                    <b>{dscr.toFixed(2)}</b>
                    <span>DSCR at {pct(downPct)} down</span>
                  </div>
                  <div className="facts">
                    <span>Rent est. {money(rent.monthlyRent)}/mo</span>
                    <span>{l.beds} bd</span>
                    <span>{l.baths} ba</span>
                    <span>{l.sqft.toLocaleString()} sqft</span>
                    <span>{l.daysOnMarket} DOM</span>
                  </div>
                  <div className="need">
                    {need.reachable
                      ? `Reaches 1.0 with ${pct(need.downPct)} down (${money(need.downPayment)})`
                      : need.reason === "exceeds-max-down"
                        ? "Needs more than 50% down to reach 1.0"
                        : "Rent does not cover taxes and insurance"}
                  </div>
                  <a className="cta" href="#prequal">Get pre-qualified</a>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <p className="notice">
        DSCR is estimated as rent divided by principal, interest, taxes, and insurance, using assumed tax and insurance
        rates. Rates and rents are illustrative. This is not a loan offer or credit decision; all loans are subject to
        underwriting review.
      </p>
    </main>
  );
}
