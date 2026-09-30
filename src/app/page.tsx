import { Search } from "@/components/Search";
import { Icon } from "@/components/Icon";
import { FAQ } from "@/lib/faq";
import { parseSearch } from "@/lib/search-url";
import { DEMO } from "@/lib/config";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const parsed = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (typeof v === "string") parsed.set(k, v);
  });
  return (
    <>
      {DEMO && (
        <div className="demo-bar" role="note">
          <span className="status-dot" /> INTERACTIVE PREVIEW{" "}
          <span className="demo-divider">/</span> Fictional properties.
          Illustrative photos. Sample rents & rates. Requests are not sent.
        </div>
      )}
      <main>
        <section className="intro wrap" aria-labelledby="page-title">
          <div>
            <div className="eyebrow">
              <span className="red">01</span> THE INVESTMENT PROPERTY EXPLORER
            </div>
            <h1 id="page-title">
              Find the property.
              <br className="mobile-break" /> <em>Know the ratio.</em>
            </h1>
          </div>
          <p>
            Good investing starts with clear numbers. <br />
            Explore properties through the lens of their rent
            <br className="desktop-break" /> and financing, before you make your
            next move.
          </p>
        </section>
        <Search initialParams={parseSearch(parsed)} />
        <section
          className="how-section wrap"
          id="how"
          aria-labelledby="how-title"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="red">02</span> A CLEARER PATH FORWARD
              </div>
              <h2 id="how-title">From a possibility to a plan.</h2>
            </div>
            <p>
              One property. A few assumptions.
              <br />A much more informed conversation.
            </p>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Find your market",
                "Browse by state, ZIP and budget. See the same financing scenario applied to every property.",
              ],
              [
                "02",
                "Work the numbers",
                "Adjust your down payment or loan structure. Compare the estimated ratio and the rent range side by side.",
              ],
              [
                "03",
                "Bring it to Griffin",
                "Carry your property and scenario into a conversation with a loan officer, who can review the actual terms.",
              ],
            ].map(([n, title, copy]) => (
              <article key={n}>
                <span className="step-index">{n}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="guide-section wrap"
          id="faq"
          aria-labelledby="faq-title"
        >
          <div className="guide-intro">
            <div className="eyebrow">
              <span className="red">03</span> THE DSCR FIELD GUIDE
            </div>
            <h2 id="faq-title">
              A little context.
              <br />
              <em>A better decision.</em>
            </h2>
            <p>
              Understand what the ratio tells you, and what still needs a human
              review.
            </p>
            <div className="formula">
              <span>Monthly rent</span>
              <span className="formula-line" />
              <span>Estimated housing payment</span>
              <b>= DSCR</b>
            </div>
          </div>
          <div className="faq-list">
            {FAQ.map((f, i) => (
              <details key={f.q}>
                <summary>
                  <span className="faq-index">0{i + 1}</span>
                  {f.q}
                  <Icon name="plus" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
