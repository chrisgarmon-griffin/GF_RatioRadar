import Link from "next/link";
export const metadata = {
  title: "Investment Property Calculators | Griffin Funding RatioRadar",
};
export default function Page() {
  return (
    <main className="wrap">
      <section className="tool-intro">
        <span className="eyebrow">THE INVESTOR WORKBENCH</span>
        <h1>
          Two perspectives.
          <br />
          <em>One clearer picture.</em>
        </h1>
        <p>
          Start with the financing, then look at the investment. Separate pages,
          connected scenarios and visible assumptions.
        </p>
      </section>
      <div className="tool-cards">
        <Link href="/calculators/dscr/" className="tool-card">
          <span className="eyebrow">01 / FINANCING</span>
          <h2>DSCR calculator</h2>
          <p>
            Model purchase or refinance financing. Compare rental strategies,
            payment structures and the loan principal supported by rent.
          </p>
          <strong>Model your scenario →</strong>
        </Link>
        <Link href="/calculators/cash-flow/" className="tool-card">
          <span className="eyebrow">02 / OPERATIONS</span>
          <h2>Cash-flow calculator</h2>
          <p>
            Account for vacancy and operating expenses. See monthly cash flow,
            net operating income, cap rate and cash-on-cash return.
          </p>
          <strong>Explore the economics →</strong>
        </Link>
      </div>
    </main>
  );
}
