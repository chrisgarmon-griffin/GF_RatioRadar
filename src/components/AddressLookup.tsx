"use client";

import { useState } from "react";
import type { SearchResponse, SearchRow } from "@/lib/search";
import { pct } from "@/lib/format";
import { ListingCard } from "./ListingCard";
import { LeadDialog } from "./LeadDialog";
import { HouseCanaryAttribution } from "./HouseCanaryAttribution";

const DOWNS = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];

export function AddressLookup() {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SearchRow | null>(null);
  const [opts, setOpts] = useState({ interestOnly: false, fortyYear: false, downPct: 0.2 });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const res = await fetch("/api/lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        address: f.get("address"),
        city: f.get("city"),
        state: f.get("state"),
        zip: f.get("zip"),
        price: Number(String(f.get("price")).replace(/[^\d.]/g, "")),
        ...opts,
      }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) setData(await res.json());
    else {
      setData(null);
      setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Try again.");
    }
  }

  return (
    <section className="search-section" id="lookup" aria-labelledby="lookup-title" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <form className="panel" onSubmit={submit}>
          <h2 id="lookup-title">Check any address</h2>
          <div className="field" style={{ gridColumn: "span 2" }}>
            <label htmlFor="lk-address">Street address</label>
            <input id="lk-address" name="address" type="text" autoComplete="street-address" placeholder="2439 Russell St" required />
          </div>
          <div className="field">
            <label htmlFor="lk-city">City (optional)</label>
            <input id="lk-city" name="city" type="text" />
          </div>
          <div className="field">
            <label htmlFor="lk-state">State (optional)</label>
            <input id="lk-state" name="state" type="text" maxLength={2} placeholder="CA" />
          </div>
          <div className="field">
            <label htmlFor="lk-zip">ZIP code</label>
            <input id="lk-zip" name="zip" type="text" inputMode="numeric" maxLength={5} placeholder="94705" required />
          </div>
          <div className="field">
            <label htmlFor="lk-price">Purchase price</label>
            <input id="lk-price" name="price" type="text" inputMode="numeric" placeholder="450,000" required />
          </div>
          <div className="field">
            <label htmlFor="lk-down">Down payment</label>
            <select id="lk-down" value={opts.downPct} onChange={(e) => setOpts({ ...opts, downPct: Number(e.target.value) })}>
              {DOWNS.map((d) => <option key={d} value={d}>{pct(d)}</option>)}
            </select>
          </div>
          <div className="field">
            <span className="lbl">Loan options</span>
            <label className="check">
              <input type="checkbox" checked={opts.interestOnly} onChange={(e) => setOpts({ ...opts, interestOnly: e.target.checked, fortyYear: e.target.checked ? false : opts.fortyYear })} />
              Interest-only
            </label>
            <label className={`check ${opts.interestOnly ? "off" : ""}`}>
              <input type="checkbox" checked={opts.fortyYear} disabled={opts.interestOnly} onChange={(e) => setOpts({ ...opts, fortyYear: e.target.checked })} />
              40-year amortization
            </label>
          </div>
          <div className="field" style={{ alignSelf: "end" }}>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "checking" : "check this address"}
            </button>
          </div>
        </form>

        {error && <div className="state-box" role="alert" style={{ marginTop: 18 }}>{error}</div>}
        {data && (
          <div style={{ marginTop: 18 }}>
            <p className="meta">
              {data.rate.source === "fixture" ? "Sample rate" : "Rate"} {(data.rate.rate * 100).toFixed(3)}% ({data.rate.asOf}).
            </p>
            <div className="grid">
              <ListingCard row={data.rows[0]} params={data.params} onSelect={setSelected} />
            </div>
            {data.rows[0].rent.source === "HouseCanary" && <HouseCanaryAttribution />}
          </div>
        )}
      </div>
      <LeadDialog row={selected} params={data?.params ?? { states: [], mode: "forward", interestOnly: false, fortyYear: false, downPct: 0.2 }} onClose={() => setSelected(null)} />
    </section>
  );
}
