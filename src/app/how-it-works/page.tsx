import Link from "next/link";
export const metadata = { title: "How It Works | Griffin Funding RatioRadar" };
export default function Page() {
  return (
    <main className="wrap article-page">
      <span className="eyebrow">FROM A PROPERTY TO A CONVERSATION</span>
      <h1>
        Work the numbers.
        <br />
        <em>Bring the context.</em>
      </h1>
      <h2>01. Explore a market</h2>
      <p>
        The <Link href="/">property explorer</Link> applies one financing
        scenario across a set of illustrative listings. Compare properties and
        see how price, rent and financing affect the estimated ratio. This
        preview uses fictional properties and sample rents, not an active
        listing feed.
      </p>
      <h2>02. Refine the financing</h2>
      <p>
        Use the <Link href="/calculators/dscr/">DSCR calculator</Link> to enter
        your own property value, rental evidence and monthly costs. Model
        purchase or refinance, long-term or short-term rent, and
        principal-and-interest or interest-only payments. Explorer estimates
        omit HOA and flood insurance; the detailed calculator asks for both.
      </p>
      <h2>03. Check the investment economics</h2>
      <p>
        Continue to <Link href="/calculators/cash-flow/">cash flow</Link> with
        your financing payment. Add vacancy, management, maintenance and other
        operating expenses. Review the total invested cash, including closing
        costs and improvements. A financing ratio alone does not establish
        profitability.
      </p>
      <h2>04. Prepare for human review</h2>
      <p>
        Print your scenario and the review checklist. A Griffin loan officer and
        human underwriter must confirm rental documentation, value, costs,
        credit, reserves and applicable investor requirements. Calculators do
        not issue approvals or denials.
      </p>
      <p>
        Inputs remain in the browser. Explicit calculator handoffs use temporary
        session storage, expire after 20 minutes and are consumed once. The
        external Griffin contact link does not transmit your calculator inputs.
      </p>
      <Link href="/calculators/">Open the calculators →</Link>
    </main>
  );
}
