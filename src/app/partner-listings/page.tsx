import type { Metadata } from "next";
import { PARTNER_LISTINGS, type PartnerListing } from "@/lib/partner-listings";
import { quoteWidget, type WidgetQuote, type WidgetTerm } from "@/lib/widget";

export const metadata: Metadata = {
  title: "Revestor partner listings demo (private)",
  robots: { index: false, follow: false },
};

/**
 * PRIVATE DEMO. Listings that partner brokers would send to Revestor themselves: only the listings their own
 * brokerage represents, by written opt-in, each credited and linked back to the broker's page.
 * Every brokerage, agent and listing here is fictional. No MLS data is used.
 */
const DOWNS = [20, 25, 30, 40];
const TERMS: { id: WidgetTerm; label: string }[] = [
  { id: "30", label: "30-year" },
  { id: "40", label: "40-year" },
  { id: "io", label: "Interest-only" },
];
const STATES = ["All", "CA", "TX", "FL"];

const CSS = `
@font-face{font-family:'Revestor Serif';src:url(/widget-fonts/newsreader.woff2) format('woff2');font-weight:200 800;font-display:swap}
@font-face{font-family:'Revestor Sans';src:url(/widget-fonts/jakarta.woff2) format('woff2');font-weight:200 800;font-display:swap}
@font-face{font-family:'Revestor Mono';src:url(/widget-fonts/plex-mono-500.woff2) format('woff2');font-weight:500;font-display:swap}
.pl{--ink:#10213a;--muted:#516175;--line:#dce4ed;--paper:#f5f8fc;--blue:#061b57;--lime:#a5cf00;--green:#356b24;--amber:#8a5a00;--red:#ba0b0b;
  --serif:'Revestor Serif',Georgia,serif;--mono:'Revestor Mono',ui-monospace,monospace;
  background:var(--paper);min-height:100vh;color:var(--ink);font:14px/1.6 'Revestor Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.pl *{box-sizing:border-box}.pl a{color:inherit;text-decoration:none}
.pl .bar{background:var(--blue);color:#fff;padding:10px 20px;font-size:12.5px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.pl .pill{background:var(--lime);color:var(--blue);border-radius:99px;padding:2px 10px;font:500 10px/1.6 var(--mono);letter-spacing:.08em;text-transform:uppercase}
.pl .wrap{max-width:1180px;margin:0 auto;padding:40px 20px 72px}
.pl .eyebrow{font:500 11px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
.pl h1{font:500 clamp(30px,4vw,46px)/1.1 var(--serif);letter-spacing:-.035em;margin:0;max-width:780px}
.pl .lede{color:var(--muted);font-size:16px;max-width:660px;margin:14px 0 28px}
.pl .controls{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:end;margin-bottom:20px}
.pl .group>span{display:block;font-size:11px;font-weight:600;color:var(--muted);margin-bottom:6px}
.pl .seg{display:inline-flex;gap:4px;padding:4px;background:#fff;border:1px solid var(--line);border-radius:16px}
.pl .seg a{padding:7px 13px;border-radius:12px;font-size:13px;font-weight:600;color:var(--muted);white-space:nowrap;transition:background .2s,color .2s}
.pl .seg a:hover{color:var(--ink)}.pl .seg a[aria-current=true]{background:var(--blue);color:#fff}
.pl .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:24px}
.pl .summary div{background:#fff;padding:14px 18px}.pl .summary dt{font-size:12px;color:var(--muted)}
.pl .summary dd{margin:2px 0 0;font:500 26px/1.1 var(--serif);letter-spacing:-.03em}
.pl .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));gap:24px}
.pl .card{background:#fff;border:1px solid var(--line);border-radius:24px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 1px 2px #10213a0a;transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s}
.pl .card:hover{transform:translateY(-3px);box-shadow:0 1px 2px #10213a0a,0 18px 40px #10213a14}
.pl .photo{aspect-ratio:16/9;position:relative;display:grid;place-items:center;color:#ffffffcc;font-size:12px}
.pl .badge{position:absolute;left:14px;top:14px;background:#fff;color:var(--ink);border-radius:14px;padding:8px 12px;display:flex;align-items:baseline;gap:6px;box-shadow:0 4px 14px #10213a26}
.pl .badge b{font:500 24px/1 var(--serif);letter-spacing:-.03em}.pl .badge span{font:500 9.5px/1 var(--mono);letter-spacing:.1em;color:var(--muted)}
.pl .badge i{width:8px;height:8px;border-radius:50%;background:var(--amber);align-self:center}.pl .badge i.good{background:var(--green)}
.pl .tag{position:absolute;right:14px;top:14px;background:#061b57d9;color:#fff;border-radius:99px;padding:4px 10px;font:500 9.5px/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase}
.pl .info{padding:18px 20px 20px;display:flex;flex-direction:column;gap:10px;flex:1}
.pl .price{font:500 26px/1.1 var(--serif);letter-spacing:-.03em;margin:0}
.pl .addr{margin:0;font-weight:600}.pl .facts{margin:0;color:var(--muted);font-size:12.5px}
.pl .verdict{margin:0;padding:10px 12px;border-radius:12px;background:var(--paper);font-size:13px;font-weight:600}
.pl .verdict small{display:block;font-weight:400;color:var(--muted);font-size:11.5px}
.pl .nums{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0}.pl .nums dt{font-size:11px;color:var(--muted)}
.pl .nums dd{margin:0;font:500 14px/1.3 var(--mono)}.pl .pos{color:var(--green)}.pl .neg{color:var(--red)}
.pl .credit{margin:auto 0 0;padding-top:12px;border-top:1px solid var(--line);font-size:11.5px;color:var(--muted)}
.pl .credit b{color:var(--ink);font-weight:600}
.pl .cta{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:14px;background:var(--blue);color:#fff!important;font-weight:600;transition:background .2s}
.pl .cta:hover{background:#03113b}.pl .cta em{font-style:normal;color:var(--lime)}
.pl .empty{background:#fff;border:1px dashed var(--line);border-radius:24px;padding:40px;text-align:center;color:var(--muted)}
.pl .how{margin-top:48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px}
.pl .how div{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px}
.pl .how b{font:500 11px/1 var(--mono);color:var(--blue);letter-spacing:.08em}.pl .how h3{font:500 20px/1.2 var(--serif);letter-spacing:-.03em;margin:8px 0 6px}
.pl .how p{margin:0;color:var(--muted);font-size:13px}
.pl .fine{font-size:11px;color:var(--muted);max-width:820px;margin:28px 0 0}
.pl :focus-visible{outline:2px solid var(--blue);outline-offset:2px}
@media (max-width:560px){.pl .summary dd{font-size:21px}.pl .summary div{padding:12px}}
@media (prefers-reduced-motion:reduce){.pl *{transition:none!important}}
`;

const money = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
// Round down below 1.0 so a ratio that misses the mark never displays as 1.00.
const fx = (d: number) => (d < 1 ? Math.floor(d * 100 + 1e-9) / 100 : d).toFixed(2);
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;

type Params = { down?: string; term?: string; state?: string; fit?: string };

export default async function PartnerListings({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const down = DOWNS.includes(Number(sp.down)) ? Number(sp.down) : 20;
  const term: WidgetTerm = sp.term === "40" || sp.term === "io" ? sp.term : "30";
  const state = STATES.includes(sp.state ?? "") ? sp.state! : "All";
  const fitOnly = sp.fit === "1";

  const quoted: { l: PartnerListing; q: WidgetQuote }[] = await Promise.all(
    PARTNER_LISTINGS.filter((l) => state === "All" || l.state === state).map(async (l) => ({
      l,
      q: await quoteWidget({ ...l, downPct: down / 100, interestOnly: term === "io", fortyYear: term === "40" }),
    })),
  );
  const reach = quoted.filter((x) => x.q.dscr >= 1).length;
  const shown = quoted.filter((x) => !fitOnly || x.q.dscr >= 1).sort((a, b) => b.q.dscr - a.q.dscr);
  const brokers = new Set(quoted.map((x) => x.l.brokerage)).size;

  const href = (patch: Params) => {
    const next = { down: String(down), term, state, fit: fitOnly ? "1" : "", ...patch };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v && v !== "All") as [string, string][]);
    return `/partner-listings?${qs}`;
  };

  return (
    <div className="pl">
      <style>{CSS}</style>
      <div className="bar">
        <span className="pill">Private demo</span>
        <span>Every brokerage, agent and listing is fictional. Rent and rate are sample values. Not reviewed for RESPA or MLS rules.</span>
      </div>
      <div className="wrap">
        <p className="eyebrow">
          Revestor · Partner listings ·{" "}
          <a href="/widget-demo" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>See the broker-site widget</a>
        </p>
        <h1>Investment listings from partner brokers, ranked by DSCR.</h1>
        <p className="lede">
          Each broker sends only the listings their own brokerage represents. Every one is credited to the listing agent and links back to the broker&apos;s page.
        </p>

        <div className="controls">
          <div className="group">
            <span>Down payment</span>
            <nav className="seg" aria-label="Down payment">
              {DOWNS.map((d) => <a key={d} href={href({ down: String(d) })} aria-current={d === down}>{d}%</a>)}
            </nav>
          </div>
          <div className="group">
            <span>Loan type</span>
            <nav className="seg" aria-label="Loan type">
              {TERMS.map((t) => <a key={t.id} href={href({ term: t.id })} aria-current={t.id === term}>{t.label}</a>)}
            </nav>
          </div>
          <div className="group">
            <span>State</span>
            <nav className="seg" aria-label="State">
              {STATES.map((s) => <a key={s} href={href({ state: s })} aria-current={s === state}>{s}</a>)}
            </nav>
          </div>
          <div className="group">
            <span>Show</span>
            <nav className="seg" aria-label="Show">
              <a href={href({ fit: "" })} aria-current={!fitOnly}>All</a>
              <a href={href({ fit: "1" })} aria-current={fitOnly}>Reaches 1.0</a>
            </nav>
          </div>
        </div>

        <dl className="summary">
          <div><dt>Partner listings</dt><dd>{quoted.length}</dd></div>
          <div><dt>Reach 1.0 at {down}% down</dt><dd>{reach}</dd></div>
          <div><dt>Partner brokers</dt><dd>{brokers}</dd></div>
        </dl>

        {shown.length === 0 ? (
          <div className="empty">
            No listings reach 1.0 on these terms. <a href={href({ fit: "" })} style={{ textDecoration: "underline" }}>Show all listings</a>, or try a larger down payment.
          </div>
        ) : (
          <div className="grid">
            {shown.map(({ l, q }) => {
              const good = q.dscr >= 1;
              return (
                <article className="card" key={l.id}>
                  <div className="photo" style={{ background: `linear-gradient(135deg, hsl(${l.hue} 38% 46%), hsl(${l.hue + 24} 44% 68%))` }}>
                    <div className="badge"><i className={good ? "good" : ""} /><b>{fx(q.dscr)}</b><span>DSCR</span></div>
                    <div className="tag">Partner listing</div>
                    Photo placeholder
                  </div>
                  <div className="info">
                    <p className="price">{money(l.price)}</p>
                    <p className="addr">{l.address}, {l.city}, {l.state} {l.zip}</p>
                    <p className="facts">
                      {l.beds} bed · {l.baths} bath · {l.sqft.toLocaleString("en-US")} sq ft · Taxes {money(l.taxAnnual)}/yr{l.hoaMonthly ? ` · HOA ${money(l.hoaMonthly)}/mo` : ""}
                    </p>
                    <p className="verdict">
                      {good
                        ? `Rent covers the payment at ${down}% down.`
                        : q.need.reachable
                          ? `Reaches 1.0 at about ${pct(q.need.downPct)} down.`
                          : "Does not reach 1.0 within 50% down."}
                      <small>Likely range {q.dscrLow ? fx(q.dscrLow) : ""} to {q.dscrHigh ? fx(q.dscrHigh) : ""}</small>
                    </p>
                    <dl className="nums">
                      <div><dt>Est. rent</dt><dd>{money(q.monthlyRent)}</dd></div>
                      <div><dt>Payment</dt><dd>{money(q.pitia)}</dd></div>
                      <div><dt>Cash flow</dt><dd className={q.monthlyCashFlow >= 0 ? "pos" : "neg"}>{q.monthlyCashFlow >= 0 ? "+" : ""}{money(q.monthlyCashFlow)}</dd></div>
                    </dl>
                    <p className="credit">Listing courtesy of <b>{l.agent}</b>, <b>{l.brokerage}</b></p>
                    <a className="cta" href={`/widget-demo?listing=${l.id}`}>View on broker site <em>→</em></a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="how">
          <div><b>01</b><h3>Broker opts in</h3><p>A partner broker agrees in writing to show the listings their own brokerage represents.</p></div>
          <div><b>02</b><h3>They send the listings</h3><p>Through a feed or upload. Nothing is copied from their site, and other brokers&apos; listings are never included.</p></div>
          <div><b>03</b><h3>Revestor adds the DSCR</h3><p>Each listing shows the ratio, credits the listing agent and links back to the broker&apos;s page.</p></div>
        </div>
        <p className="fine">
          Estimates only, provided by Griffin Funding. Not a loan offer, approval or commitment to lend. Rent, rate, taxes and insurance are estimates and will differ.
          On a real launch each MLS&apos;s rules, the seller&apos;s listing agreement and RESPA would govern this arrangement.
        </p>
      </div>
    </div>
  );
}
