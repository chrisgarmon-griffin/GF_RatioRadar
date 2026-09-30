"use client";
import { useEffect, useRef, useState } from "react";
import type { SearchParams, SearchResponse, SearchRow } from "@/lib/search";
import { DEFAULTS, parseSearch, searchUrl, STATES } from "@/lib/search-url";
import { money, pct, ratio } from "@/lib/format";
import { ListingCard } from "./ListingCard";
import { LeadDialog } from "./LeadDialog";
import { ScenarioDialog } from "./ScenarioDialog";
import { CompareDialog } from "./CompareDialog";
import { Icon } from "./Icon";
const marketNames: Record<string, string> = {
  CA: "California",
  TX: "Texas",
  FL: "Florida",
};
export function Search({ initialParams }: { initialParams: SearchParams }) {
  const [p, setP] = useState(initialParams);
  const [draft, setDraft] = useState(initialParams);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [mobileScenarioOpen, setMobileScenarioOpen] = useState(false);
  const [selected, setSelected] = useState<SearchRow | null>(null);
  const [lead, setLead] = useState<SearchRow | null>(null);
  const [compared, setCompared] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [view, setView] = useState<"gallery" | "table">("gallery");
  const [sort, setSort] = useState("default");
  const [share, setShare] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [validation, setValidation] = useState("");
  const requestId = useRef(0);
  useEffect(() => {
    const ctrl = new AbortController();
    const id = ++requestId.current;
    const url = searchUrl(p, window.location.search);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${url.replace("#search", window.location.hash)}`,
    );
    fetch("/api/search", {
      method: "POST",
      signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(15000)]),
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok)
          throw new Error(
            body.error ?? "Search could not load. Please try again.",
          );
        return body as SearchResponse;
      })
      .then((d) => {
        if (id === requestId.current) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError" && id === requestId.current) {
          setError("We could not load these properties. Please try again.");
          setLoading(false);
        }
      });
    return () => ctrl.abort();
  }, [p]);
  useEffect(() => {
    const back = () => {
      const restored = parseSearch(new URLSearchParams(window.location.search));
      setP(restored);
      setDraft(restored);
      setLoading(true);
      setError(null);
      setCompared([]);
      setSelected(null);
      setLead(null);
      setCompareOpen(false);
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  const apply = (next: SearchParams) => {
    setP({ ...next });
    setDraft({ ...next });
    setLoading(true);
    setError(null);
    setCompared([]);
    setCompareOpen(false);
    setShare("");
    setShareUrl("");
    setValidation("");
  };
  const financing = (patch: Partial<SearchParams>) => {
    const nextDraft = { ...draft, ...patch };
    apply({ ...p, ...patch });
    setDraft(nextDraft);
  };
  const toggleCompare = (id: string) =>
    setCompared((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : cur.length < 3
          ? [...cur, id]
          : cur,
    );
  const rows = [...(data?.rows ?? [])];
  if (sort === "price-low")
    rows.sort((a, b) => a.listing.price - b.listing.price);
  if (sort === "price-high")
    rows.sort((a, b) => b.listing.price - a.listing.price);
  if (sort === "newest")
    rows.sort((a, b) => a.listing.daysOnMarket - b.listing.daysOnMarket);
  const comparison = rows.filter((r) => compared.includes(r.listing.id));
  async function copySearch() {
    const url = `${window.location.origin}${window.location.pathname}${searchUrl(p, window.location.search)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShare("Search link copied");
    } catch {
      setShareUrl(url);
      setShare("Copy the search link below");
    }
  }
  return (
    <section
      className="search-section wrap"
      id="search"
      tabIndex={-1}
      aria-label="Property explorer"
    >
      <form
        className="search-capsule"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.states.length) {
            setValidation("Choose at least one market.");
            return;
          }
          if (
            draft.minPrice &&
            draft.maxPrice &&
            draft.minPrice > draft.maxPrice
          ) {
            setValidation("Minimum price must be below maximum price.");
            return;
          }
          apply(draft);
        }}
      >
        <div className="search-field market-field">
          <Icon name="pin" />
          <div>
            <label htmlFor="market">Where are you looking?</label>
            <select
              id="market"
              value={
                draft.states.length === 1
                  ? draft.states[0]
                  : draft.states.length === 3
                    ? "all"
                    : "custom"
              }
              onChange={(e) =>
                setDraft({
                  ...draft,
                  states:
                    e.target.value === "all" ? [...STATES] : [e.target.value],
                })
              }
            >
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="all">All three markets</option>
              {draft.states.length !== 1 && draft.states.length !== 3 && (
                <option value="custom">
                  {draft.states.length
                    ? draft.states.map((s) => marketNames[s]).join(" + ")
                    : "Select a market"}
                </option>
              )}
            </select>
          </div>
        </div>
        <div className="search-field">
          <div>
            <label htmlFor="zip">Narrow your search</label>
            <input
              id="zip"
              inputMode="numeric"
              maxLength={5}
              placeholder="ZIP code (optional)"
              value={draft.zip ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  zip:
                    e.target.value.replace(/\D/g, "").slice(0, 5) || undefined,
                })
              }
            />
          </div>
        </div>
        <div className="search-field">
          <div>
            <label htmlFor="maxp">Purchase budget</label>
            <select
              id="maxp"
              value={draft.maxPrice ?? 0}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  maxPrice: Number(e.target.value) || undefined,
                })
              }
            >
              <option value="0">Any price</option>
              {[200000, 300000, 400000, 500000, 750000, 1000000].map((n) => (
                <option key={n} value={n}>
                  Up to {money(n)}
                </option>
              ))}
              {draft.maxPrice &&
                ![200000, 300000, 400000, 500000, 750000, 1000000].includes(
                  draft.maxPrice,
                ) && (
                  <option value={draft.maxPrice}>
                    Up to {money(draft.maxPrice)}
                  </option>
                )}
            </select>
          </div>
        </div>
        <button type="submit" className="search-submit" aria-label="Explore">
          <Icon name="search" />
          <span>Explore</span>
        </button>
      </form>
      {validation && (
        <p className="form-error" role="alert">
          {validation}
        </p>
      )}
      <button
        className="mobile-scenario-toggle"
        aria-expanded={mobileScenarioOpen}
        aria-controls="financing-controls"
        onClick={() => setMobileScenarioOpen(!mobileScenarioOpen)}
      >
        <Icon name="sliders" />
        <span>
          Your scenario{" "}
          <small>
            {pct(p.downPct)} down ·{" "}
            {p.interestOnly
              ? "Interest-only"
              : p.fortyYear
                ? "40-year"
                : "30-year"}
          </small>
        </span>
        <b>{mobileScenarioOpen ? "Close" : "Adjust"}</b>
      </button>
      <div
        id="financing-controls"
        className={`financing-controls ${mobileScenarioOpen ? "mobile-open" : ""}`}
      >
        <div className="scenario-toolbar">
          <div className="scenario-label">
            <Icon name="sliders" />
            <span>
              YOUR SCENARIO<small>Applied to every property</small>
            </span>
          </div>
          <div className="toolbar-control">
            <label htmlFor="down">Down payment</label>
            <select
              id="down"
              value={p.downPct}
              onChange={(e) => financing({ downPct: Number(e.target.value) })}
            >
              {[0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5].map((d) => (
                <option key={d} value={d}>
                  {pct(d)}
                </option>
              ))}
              {![0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5].includes(p.downPct) && (
                <option value={p.downPct}>{pct(p.downPct)}</option>
              )}
            </select>
          </div>
          <div className="term-switch" role="group" aria-label="Loan structure">
            <button
              aria-pressed={!p.interestOnly && !p.fortyYear}
              onClick={() =>
                financing({ interestOnly: false, fortyYear: false })
              }
            >
              30-year
            </button>
            <button
              aria-pressed={p.fortyYear}
              onClick={() =>
                financing({ interestOnly: false, fortyYear: true })
              }
            >
              40-year
            </button>
            <button
              aria-pressed={p.interestOnly}
              onClick={() =>
                financing({ interestOnly: true, fortyYear: false })
              }
            >
              Interest-only
            </button>
          </div>
          <button
            className={`coverage-switch ${p.mode === "inverse" ? "on" : ""}`}
            role="switch"
            aria-checked={p.mode === "inverse"}
            onClick={() =>
              financing({ mode: p.mode === "forward" ? "inverse" : "forward" })
            }
          >
            <span className="switch-track">
              <span />
            </span>
            Find 1.0+ scenarios
          </button>
          <button
            className="filter-button"
            aria-expanded={advanced}
            aria-controls="advanced-filters"
            onClick={() => setAdvanced(!advanced)}
          >
            <Icon name="sliders" />
            Filters
          </button>
        </div>
        {advanced && (
          <div className="advanced-filters" id="advanced-filters">
            <div>
              <label htmlFor="minp">Minimum purchase price</label>
              <input
                id="minp"
                type="number"
                min="0"
                step="1000"
                placeholder="No minimum"
                value={draft.minPrice ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    minPrice: Number(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <fieldset>
              <legend>Markets to include</legend>
              {STATES.map((s) => (
                <label className="check" key={s}>
                  <input
                    type="checkbox"
                    checked={draft.states.includes(s)}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        states: draft.states.includes(s)
                          ? draft.states.filter((x) => x !== s)
                          : [...draft.states, s],
                      })
                    }
                  />
                  {marketNames[s]}
                </label>
              ))}
            </fieldset>
            <button
              className="btn btn-ink"
              disabled={!draft.states.length}
              onClick={() => {
                if (
                  draft.minPrice &&
                  draft.maxPrice &&
                  draft.minPrice > draft.maxPrice
                ) {
                  setValidation("Minimum price must be below maximum price.");
                  return;
                }
                apply(draft);
              }}
            >
              Apply filters <Icon name="arrow" />
            </button>
            <button className="text-button" onClick={() => apply(DEFAULTS)}>
              Reset all
            </button>
          </div>
        )}
        <div className="scenario-footnote">
          <span>
            <Icon name="info" />
            {p.mode === "inverse"
              ? "Shows properties that reach 1.0 within your down payment cap."
              : "DSCR = monthly rent ÷ modeled housing payment."}{" "}
            Estimates only.
          </span>
          <span>
            {data && !loading
              ? `${data.rate.source === "fixture" ? "Sample rate" : "Scenario rate"} ${(data.rate.rate * 100).toFixed(3)}% · ${data.rate.asOf}`
              : "Sample pricing"}{" "}
            · HOA excluded
          </span>
        </div>
      </div>
      {data && !loading && !error && data.skipped > 0 && (
        <p className="partial-results" role="status">
          {data.skipped} {data.skipped === 1 ? "property is" : "properties are"}{" "}
          omitted because a rent estimate is unavailable. Results are
          incomplete; no rent values were substituted.
        </p>
      )}
      <div className="results-heading">
        <div>
          <div className="eyebrow">
            {p.states.map((s) => marketNames[s]).join(" / ")}{" "}
            <span className="heading-divider">/</span> PROPERTY COLLECTION
          </div>
          <h2>
            {p.mode === "inverse"
              ? "Find your way to 1.0."
              : "The next move is yours."}
            <span className="result-count" role="status">
              {loading
                ? "Loading…"
                : error
                  ? "Unavailable"
                  : `${rows.length} ${rows.length === 1 ? "property" : "properties"}`}
            </span>
          </h2>
        </div>
        <div className="result-controls">
          <button
            className="icon-button share-button"
            onClick={copySearch}
            aria-label="Share this search"
          >
            <Icon name="share" />
          </button>
          <label className="sort-label">
            <span className="sr-only">Sort properties</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">
                {p.mode === "inverse" ? "Lowest required down" : "Highest DSCR"}
              </option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="newest">Newest listed</option>
            </select>
          </label>
          <div className="view-toggle" role="group" aria-label="Results view">
            <button
              aria-label="Gallery view"
              aria-pressed={view === "gallery"}
              onClick={() => setView("gallery")}
            >
              <Icon name="grid" />
            </button>
            <button
              aria-label="Table view"
              aria-pressed={view === "table"}
              onClick={() => setView("table")}
            >
              <Icon name="list" />
            </button>
          </div>
        </div>
      </div>
      {share && (
        <div className="share-feedback" role="status">
          {share}
          {shareUrl && (
            <input
              readOnly
              aria-label="Shareable search URL"
              value={shareUrl}
              onFocus={(e) => e.target.select()}
            />
          )}
        </div>
      )}
      <div aria-busy={loading} className="results-region">
        {loading ? (
          <div
            className="property-grid skeleton-grid"
            aria-label="Loading properties"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div className={`skeleton ${i === 0 ? "featured" : ""}`} key={i}>
                <div />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="state-box" role="alert">
            <Icon name="info" />
            <h3>Let’s try that again.</h3>
            <p>{error}</p>
            <button className="btn btn-ink" onClick={() => apply(p)}>
              Retry search
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="state-box">
            <Icon name="search" />
            <h3>
              {data && data.skipped > 0
                ? "No priced properties in this view."
                : "No properties in this view."}
            </h3>
            <p>
              {data && data.skipped > 0
                ? "Some properties could not be assessed because rent estimates were unavailable. Try again later or broaden your search."
                : p.mode === "inverse"
                  ? "Try a larger down payment or a different loan structure to explore more 1.0 scenarios."
                  : "Try a broader budget, a different market, or clear the ZIP code."}
            </p>
            <button className="btn btn-ink" onClick={() => apply(DEFAULTS)}>
              Reset search <Icon name="arrow" />
            </button>
          </div>
        ) : data && view === "gallery" ? (
          <div className="property-grid">
            {rows.map((r, i) => (
              <ListingCard
                key={r.listing.id}
                row={r}
                params={data.params}
                featured={i === 0}
                onSelect={setSelected}
                compared={compared.includes(r.listing.id)}
                onCompare={() => toggleCompare(r.listing.id)}
                compareDisabled={compared.length >= 3}
              />
            ))}
          </div>
        ) : (
          data && (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Property results table"
            >
              <table className="results-table">
                <thead>
                  <tr>
                    <th scope="col">Compare</th>
                    <th scope="col">Property</th>
                    <th scope="col">Price</th>
                    <th scope="col">Est. DSCR</th>
                    <th scope="col">Sample rent / mo</th>
                    <th scope="col">Down to 1.0</th>
                    <th scope="col">Scenario</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.listing.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Compare ${r.listing.address}`}
                          checked={compared.includes(r.listing.id)}
                          disabled={
                            compared.length >= 3 &&
                            !compared.includes(r.listing.id)
                          }
                          onChange={() => toggleCompare(r.listing.id)}
                        />
                      </td>
                      <th scope="row">
                        {r.listing.address}
                        <small>
                          {r.listing.city}, {r.listing.state}
                        </small>
                      </th>
                      <td>{money(r.listing.price)}</td>
                      <td className={r.dscr >= 1 ? "positive" : ""}>
                        {ratio(r.dscr)}×
                      </td>
                      <td>{money(r.rent.monthlyRent)}</td>
                      <td>
                        {r.need.reachable ? pct(r.need.downPct) : "Above 50%"}
                      </td>
                      <td>
                        <button
                          className="text-button"
                          onClick={() => setSelected(r)}
                        >
                          View <Icon name="arrow" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
      {!loading && !error && data && rows.length > 0 && (
        <div className="collection-end">
          <span>
            {String(rows.length).padStart(2, "0")} PROPERTIES IN THIS COLLECTION
          </span>
          <span>Thoughtfully compared. Never pre-approved.</span>
          <button
            className="text-button"
            onClick={() => {
              setAdvanced(true);
              document.getElementById("market")?.focus();
              window.scrollTo({ top: 200, behavior: "smooth" });
            }}
          >
            Refine your search <Icon name="arrow" />
          </button>
        </div>
      )}
      {compared.length > 0 && !loading && (
        <div className="compare-dock">
          <span className="compare-dock-icon">
            <Icon name="compare" />
          </span>
          <div>
            <strong>{compared.length} of 3 properties</strong>
            <small>
              {compared.length < 2
                ? "Choose one more to compare"
                : "Ready for a closer look"}
            </small>
          </div>
          <button className="text-button" onClick={() => setCompared([])}>
            Clear
          </button>
          <button
            className="btn btn-primary"
            disabled={compared.length < 2}
            onClick={() => setCompareOpen(true)}
          >
            Compare <Icon name="arrow" />
          </button>
        </div>
      )}
      {selected && data && (
        <ScenarioDialog
          row={selected}
          data={data}
          onClose={() => setSelected(null)}
          onReview={() => {
            setLead(selected);
            setSelected(null);
          }}
        />
      )}
      {compareOpen && data && (
        <CompareDialog
          rows={comparison}
          data={data}
          onClose={() => setCompareOpen(false)}
          onSelect={(r) => {
            setCompareOpen(false);
            setSelected(r);
          }}
        />
      )}
      {lead && data && (
        <LeadDialog
          key={lead.listing.id}
          row={lead}
          params={data.params}
          onClose={() => setLead(null)}
        />
      )}
    </section>
  );
}
