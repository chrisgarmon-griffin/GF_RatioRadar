import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Revestor widget demo (private)",
  robots: { index: false, follow: false },
};

/**
 * PRIVATE DEMO. A mock broker listing page showing how the Revestor widget would sit on a broker's own site.
 * The brokerage, agent and listings are fictional. No MLS data is used.
 */
const LISTINGS = {
  fresno: {
    label: "Covers at 20% down",
    address: "1204 Alder St", city: "Fresno", state: "CA", zip: "93706",
    price: 349000, beds: 3, baths: 2, sqft: 1420, taxAnnual: 3640, hoaMonthly: 0,
    blurb: "Single-story home near schools and transit. Updated kitchen, fenced yard and a two-car garage.",
  },
  sandiego: {
    label: "Needs more down, has HOA",
    address: "88 Marina Way #4", city: "San Diego", state: "CA", zip: "92109",
    price: 685000, beds: 3, baths: 2.5, sqft: 1610, taxAnnual: 8220, hoaMonthly: 310,
    blurb: "End-unit townhome a few blocks from the bay. Attached garage, private patio and community pool.",
  },
} as const;
type Key = keyof typeof LISTINGS;

const ink = "#10213a", muted = "#516175", line = "#dce4ed", blue = "#061b57", lime = "#a5cf00";
const sans = "'Revestor Sans', system-ui, sans-serif";
const serif = "'Revestor Serif', Georgia, serif";
const mono = "'Revestor Mono', ui-monospace, monospace";

export default async function WidgetDemo({ searchParams }: { searchParams: Promise<{ listing?: string }> }) {
  const { listing: param } = await searchParams;
  const key: Key = param === "sandiego" ? "sandiego" : "fresno";
  const l = LISTINGS[key];
  const snippet = `<div data-revestor-widget
     data-address="${l.address}" data-city="${l.city}"
     data-state="${l.state}" data-zip="${l.zip}"
     data-price="${l.price}" data-beds="${l.beds}"
     data-baths="${l.baths}" data-sqft="${l.sqft}"
     data-tax-annual="${l.taxAnnual}" data-hoa-monthly="${l.hoaMonthly}"></div>
<script src="https://YOUR-REVESTOR-HOST/revestor-widget.js" defer></script>`;

  return (
    <div style={{ background: "#f5f8fc", minHeight: "100vh", color: ink, font: `14px/1.6 ${sans}` }}>
      <div style={{ background: blue, color: "#fff", padding: "10px 20px", fontSize: 12.5, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ background: lime, color: blue, borderRadius: 99, padding: "2px 10px", font: `500 10px/1.6 ${mono}`, letterSpacing: ".08em", textTransform: "uppercase" }}>
          Private demo
        </span>
        <span>
          The brokerage, agent and listings are fictional. Rent and rate are sample values. Not reviewed for RESPA or MLS display rules.
        </span>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px 64px" }}>
        <p style={{ font: `500 11px/1 ${mono}`, letterSpacing: ".1em", textTransform: "uppercase", color: muted, margin: "0 0 12px" }}>
          Revestor for brokers
        </p>
        <h1 style={{ font: `500 clamp(30px, 4vw, 46px)/1.1 ${serif}`, letterSpacing: "-.035em", margin: 0, maxWidth: 760 }}>
          The DSCR answer, on the listing page your buyers are already on.
        </h1>
        <p style={{ color: muted, fontSize: 16, maxWidth: 640, margin: "14px 0 24px" }}>
          One snippet on a broker&apos;s listing page. The listings never leave their site.
        </p>

        <nav aria-label="Sample listing" style={{ display: "inline-flex", gap: 4, padding: 4, background: "#fff", border: `1px solid ${line}`, borderRadius: 16, marginBottom: 20 }}>
          {(Object.keys(LISTINGS) as Key[]).map((k) => (
            <a
              key={k}
              href={`/widget-demo?listing=${k}`}
              aria-current={k === key ? "page" : undefined}
              style={{ padding: "8px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: "none", background: k === key ? blue : "transparent", color: k === key ? "#fff" : muted }}
            >
              {LISTINGS[k].label}
            </a>
          ))}
        </nav>

        {/* Mock broker site inside a browser frame */}
        <div style={{ background: "#fff", border: `1px solid ${line}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 1px 2px #10213a0a, 0 24px 64px #10213a14" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderBottom: `1px solid ${line}`, background: "#f9fbfd" }}>
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: line, flex: "none" }} />)}
            <span style={{ marginLeft: 12, font: `500 11px/1 ${mono}`, color: muted, background: "#fff", border: `1px solid ${line}`, borderRadius: 99, padding: "6px 14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
              samplecoastrealty.example/listings/{l.address.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            </span>
          </div>
          <div style={{ padding: "14px 24px", borderBottom: `1px solid ${line}`, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "Georgia, serif" }}>
            <span style={{ fontSize: 19, color: "#27364a" }}>Sample Coast Realty</span>
            <span style={{ fontSize: 12, color: muted, fontFamily: sans }}>fictional brokerage</span>
          </div>
          <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 32, alignItems: "start" }}>
            <section style={{ fontFamily: "Georgia, serif", minWidth: 0 }}>
              <div style={{ aspectRatio: "16 / 10", background: "linear-gradient(135deg,#d5dfea,#eff3f8)", borderRadius: 12, display: "grid", placeItems: "center", color: muted, font: `13px ${sans}` }}>
                Listing photo placeholder
              </div>
              <h2 style={{ fontSize: 28, margin: "16px 0 4px", fontWeight: 400 }}>${l.price.toLocaleString("en-US")}</h2>
              <p style={{ margin: 0, fontSize: 17 }}>{l.address}, {l.city}, {l.state} {l.zip}</p>
              <p style={{ font: `13px ${sans}`, color: muted, margin: "6px 0 12px" }}>
                {l.beds} bed · {l.baths} bath · {l.sqft.toLocaleString("en-US")} sq ft · Taxes ${l.taxAnnual.toLocaleString("en-US")}/yr
                {l.hoaMonthly ? ` · HOA $${l.hoaMonthly}/mo` : ""}
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" }}>{l.blurb} Sample description for the demo.</p>
              <p style={{ font: `12px ${sans}`, color: muted, margin: 0 }}>
                Listed by Jordan Sample, Sample Coast Realty. Listing attribution and MLS disclaimers would appear here on a real broker site.
              </p>
            </section>
            <aside style={{ minWidth: 0 }}>
              <div
                key={key}
                data-revestor-widget=""
                data-address={l.address} data-city={l.city} data-state={l.state} data-zip={l.zip}
                data-price={l.price} data-beds={l.beds} data-baths={l.baths} data-sqft={l.sqft}
                data-tax-annual={l.taxAnnual} data-hoa-monthly={l.hoaMonthly}
              />
            </aside>
          </div>
        </div>

        <h2 style={{ font: `500 24px/1.15 ${serif}`, letterSpacing: "-.03em", margin: "40px 0 12px" }}>What a broker pastes in</h2>
        <pre style={{ background: blue, color: "#e6ecf7", padding: 20, borderRadius: 16, overflowX: "auto", font: `500 12px/1.7 ${mono}`, margin: 0 }}>{snippet}</pre>
        <p style={{ fontSize: 13, color: muted, maxWidth: 720, margin: "12px 0 0" }}>
          The widget only receives the values in the snippet and does not read the rest of the page. In this demo the
          quote endpoint is same-origin only, so the snippet will not work on another site yet.
        </p>
      </div>
      <Script src="/revestor-widget.js" strategy="afterInteractive" />
    </div>
  );
}
