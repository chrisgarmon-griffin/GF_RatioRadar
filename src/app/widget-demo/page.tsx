import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Revestor widget demo (private)",
  robots: { index: false, follow: false },
};

/**
 * PRIVATE DEMO. A mock broker listing page showing how the Revestor widget would sit on a broker's own site.
 * The brokerage, agent and listing are fictional. No MLS data is used.
 */
const listing = {
  address: "1204 Alder St", city: "Fresno", state: "CA", zip: "93706",
  price: 349000, beds: 3, baths: 2, sqft: 1420, taxAnnual: 3640, hoaMonthly: 0,
};

const snippet = `<div data-revestor-widget
     data-address="${listing.address}" data-city="${listing.city}"
     data-state="${listing.state}" data-zip="${listing.zip}"
     data-price="${listing.price}" data-beds="${listing.beds}"
     data-baths="${listing.baths}" data-sqft="${listing.sqft}"
     data-tax-annual="${listing.taxAnnual}" data-hoa-monthly="${listing.hoaMonthly}"></div>
<script src="https://YOUR-REVESTOR-HOST/revestor-widget.js" defer></script>`;

export default function WidgetDemo() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "Georgia, serif", color: "#1d2733" }}>
      <div style={{ background: "#fff7d6", borderBottom: "1px solid #e6d58a", padding: "8px 16px", fontSize: 13, fontFamily: "system-ui, sans-serif" }}>
        Private demo. The brokerage, agent and listing below are fictional. This page shows how the Revestor widget
        would appear on a broker&apos;s own listing page. Not reviewed for RESPA or MLS display rules.
      </div>
      <header style={{ background: "#1d3a5f", color: "#fff", padding: "14px 24px", fontSize: 20 }}>
        Sample Coast Realty <span style={{ fontSize: 13, opacity: 0.75, marginLeft: 8 }}>fictional brokerage</span>
      </header>
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
        <section>
          <div style={{ aspectRatio: "16 / 10", background: "linear-gradient(135deg,#cfd9e4,#eef2f6)", borderRadius: 8, display: "grid", placeItems: "center", color: "#5b6b7c", fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
            Listing photo placeholder
          </div>
          <h1 style={{ fontSize: 28, margin: "16px 0 4px" }}>${listing.price.toLocaleString("en-US")}</h1>
          <p style={{ margin: 0, fontSize: 17 }}>{listing.address}, {listing.city}, {listing.state} {listing.zip}</p>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#5b6b7c" }}>
            {listing.beds} bed · {listing.baths} bath · {listing.sqft.toLocaleString("en-US")} sq ft · Annual taxes ${listing.taxAnnual.toLocaleString("en-US")}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6 }}>
            Single-story home near schools and transit. Updated kitchen, fenced yard and a two-car garage. Sample
            description for the demo.
          </p>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, color: "#5b6b7c" }}>
            Listed by Jordan Sample, Sample Coast Realty. Listing attribution and MLS disclaimers would appear here on
            a real broker site.
          </p>
        </section>
        <aside>
          <div
            data-revestor-widget=""
            data-address={listing.address} data-city={listing.city} data-state={listing.state} data-zip={listing.zip}
            data-price={listing.price} data-beds={listing.beds} data-baths={listing.baths} data-sqft={listing.sqft}
            data-tax-annual={listing.taxAnnual} data-hoa-monthly={listing.hoaMonthly}
          />
          <Script src="/revestor-widget.js" strategy="afterInteractive" />
        </aside>
      </main>
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 48px", fontFamily: "system-ui, sans-serif" }}>
        <h2 style={{ fontSize: 16 }}>What a broker would paste into their listing page</h2>
        <pre style={{ background: "#f4f6f8", padding: 16, borderRadius: 8, overflowX: "auto", fontSize: 12.5 }}>{snippet}</pre>
        <p style={{ fontSize: 13, color: "#5b6b7c" }}>
          The widget only receives the values in the snippet. It does not read the rest of the page. In this demo the
          quote endpoint is same-origin only, so the snippet will not work on another site yet.
        </p>
      </section>
    </div>
  );
}
