import { Mark } from "@/components/Mark";
import { Search } from "@/components/Search";
import { AddressLookup } from "@/components/AddressLookup";
import { FAQ } from "@/lib/faq";
import { DEMO } from "@/lib/config";

const NMLS = process.env.NEXT_PUBLIC_NMLS;

export default function Home() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <a className="skip" href="#search">Skip to search</a>
      {DEMO && (
        <div className="demo-bar" role="note">
          Preview build. Listings, rents and rates are sample data, and requests are not sent.
        </div>
      )}
      <header className="nav">
        <div className="wrap">
          <a className="brand" href="/" aria-label="Ratio Radar home">
            <Mark />
            <span>Ratio Radar</span>
          </a>
          <nav className="navlinks sc" aria-label="Primary">
            <a className="hide-sm" href="#lookup">check an address</a>
            <a className="hide-sm" href="#how">how it works</a>
            <a className="hide-sm" href="#faq">faq</a>
            <a href="#search">search</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <Mark className="wash" />
          <div className="wrap">
            <span className="eyebrow"><svg className="glyph" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="7" cy="7" r="2" fill="currentColor" /></svg>dscr property search</span>
            <h1>Find the deals that <em>already work.</em></h1>
            <p className="lede">
              Every listing shows its DSCR. See which properties reach 1.0 at 20% down, and what interest-only, a
              40-year term or more money down does to the rest.
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href="#search">search properties</a>
              <a className="btn btn-outline" href="?mode=inverse#search">show me 1.0 deals</a>
            </div>
            <div className="stat-block">
              <span className="num">rent ÷ PITIA</span>
              <span className="lab">DSCR of 1.0 means the rent covers the payment.</span>
            </div>
          </div>
        </section>

        <Search />
        <AddressLookup />

        <section className="section" id="how">
          <div className="wrap">
            <span className="eyebrow sc">how it works</span>
            <h2>From search to loan officer in three steps</h2>
            <div className="steps">
              <div className="step"><span className="n">01</span><h3>Search</h3><p>Pick a state or ZIP and a price range. Each home for sale shows its DSCR at your down payment.</p></div>
              <div className="step"><span className="n">02</span><h3>Reach 1.0</h3><p>Turn on interest-only or a 40-year term, or raise the down payment. Or flip to 1.0 deals and see the down payment each property needs.</p></div>
              <div className="step"><span className="n">03</span><h3>Talk to a loan officer</h3><p>Send the property you like. A Griffin loan officer confirms the real rent, rate and terms.</p></div>
            </div>
          </div>
        </section>

        <section className="section faq" id="faq" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <span className="eyebrow sc">faq</span>
            <h2>DSCR loans, answered</h2>
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap legal">
          <p>
            Ratio Radar is provided by Griffin Funding.{NMLS ? ` NMLS #${NMLS}.` : ""} Equal Housing Opportunity.
          </p>
          <p>
            DSCR figures are estimates: monthly rent divided by principal, interest, taxes and insurance, using
            automated rent estimates, sample rates and assumed tax and insurance rates. They are not a loan offer, rate
            quote or credit decision. All loans are subject to underwriting review and approval. Listings shown may be
            sample data during the pilot.
          </p>
        </div>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
