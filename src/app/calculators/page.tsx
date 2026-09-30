import Link from "next/link";
import { PageHero } from "@/components/resources/PageHero";
export const metadata = {
  title: "Investment Property Calculators | Griffin Funding RatioRadar",
};
export default function Page() {
  return (
    <main className="wrap resource-page">
      <PageHero
        eyebrow="the investor workbench"
        title="Work the numbers."
        accent="Find your perspective."
        description="Two connected tools. Start with financing, then look at the investment economics. See the assumptions behind every estimate."
        actions={[
          { label: "Model the financing", href: "/calculators/dscr/" },
          { label: "Explore cash flow", href: "/calculators/cash-flow/" },
        ]}
      />
      <section className="workbench-tools" aria-label="Choose a calculator">
        <Link href="/calculators/dscr/" className="workbench-card">
          <div className="workbench-graphic graphic-finance" aria-hidden="true">
            <div className="finance-equation">
              <div className="finance-fraction">
                <span>Monthly rent</span>
                <span className="graphic-fraction" />
                <span>Housing payment</span>
              </div>
              <span className="finance-equals">=</span>
              <strong>DSCR</strong>
            </div>
          </div>
          <div className="workbench-card-copy">
            <span className="resource-label">01 / FINANCING</span>
            <h2>DSCR calculator</h2>
            <p>
              Model purchase or refinance financing. Compare rental strategies,
              payment structures and loan buying power.
            </p>
            <ul className="resource-tags">
              <li>Purchase & refinance</li>
              <li>LTR & STR</li>
              <li>Interest only</li>
            </ul>
            <span className="workbench-card-action">
              Build a scenario <span aria-hidden="true">↗</span>
            </span>
          </div>
        </Link>
        <Link href="/calculators/cash-flow/" className="workbench-card">
          <div
            className="workbench-graphic graphic-cashflow"
            aria-hidden="true"
          >
            <div>
              <i />
              <span>Income</span>
            </div>
            <div>
              <i />
              <span>Costs</span>
            </div>
            <div>
              <i />
              <span>Cash flow</span>
            </div>
          </div>
          <div className="workbench-card-copy">
            <span className="resource-label">02 / OPERATIONS</span>
            <h2>Cash-flow calculator</h2>
            <p>
              Account for vacancy and operating costs. See net operating income,
              cash flow and the return on invested cash.
            </p>
            <ul className="resource-tags">
              <li>Operating expenses</li>
              <li>Cap rate</li>
              <li>Cash-on-cash</li>
            </ul>
            <span className="workbench-card-action">
              Explore the economics <span aria-hidden="true">↗</span>
            </span>
          </div>
        </Link>
      </section>
      <section className="workbench-bridge">
        <div className="workbench-bridge-copy">
        <span className="resource-label">ONE CONNECTED WORKFLOW</span>
        <h2>
          Keep the context.
          <br />
          Change the perspective.
        </h2>
        <p>
          Send your modeled financing payment directly to cash flow. Add the
          operating costs you know, then print the scenario for a human review.
        </p>
        </div>
        <div className="resource-feature-rows">
          <Link href="/calculators/dscr/">
            <span>01 /</span> Model financing <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/calculators/cash-flow/">
            <span>02 /</span> Check cash flow <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/how-it-works/">
            <span>03 /</span> Prepare for review{" "}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <p className="resource-fine bridge-disclosure">
          Estimates only. Not a loan offer or credit decision. Your calculator
          inputs stay in your browser.
        </p>
      </section>
    </main>
  );
}
