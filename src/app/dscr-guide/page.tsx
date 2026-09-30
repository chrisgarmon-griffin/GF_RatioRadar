import Link from "next/link";
import { PageHero } from "@/components/resources/PageHero";
import { RatioLab } from "@/components/resources/RatioLab";
export const metadata = { title: "DSCR Guide | Griffin Funding RatioRadar" };
const topics = [
  [
    "Rental-income DSCR",
    "Start with rent and housing costs.",
    "The financing calculator divides modeled monthly rent by principal and interest, taxes, property insurance, HOA dues and flood insurance. A ratio of 1.00× means rent equals that payment. It does not establish profitability or loan eligibility.",
  ],
  [
    "Short-term rentals",
    "Separate revenue from the rent used in the model.",
    "Annual revenue is divided by 12 and reduced by the assumption you enter. The 20% starting reduction comes from the supplied calculator reference. It is editable and is not an investor guideline. Actual rent treatment and documentation need verification.",
  ],
  [
    "Interest-only financing",
    "A lower modeled payment has a time boundary.",
    "Interest-only payments equal principal multiplied by the annual rate, divided by 12. Principal does not decline during the interest-only period. Future amortizing payments, the interest-only period and product availability must be confirmed.",
  ],
  [
    "Cash-out refinance",
    "Start with equity. Account for the costs.",
    "The calculator limits the modeled loan by your LTV assumption, then subtracts the existing balance and financed closing costs to estimate proceeds. The 80% starting LTV is a modeling default, not a program requirement. A cash-to-close shortfall is shown when applicable.",
  ],
  [
    "Investment returns",
    "Look past the financing ratio.",
    "Net operating income is effective rent after vacancy less operating expenses, before debt service. Cash flow subtracts the loan payment. Cap rate uses annual NOI divided by property value; cash-on-cash uses annual cash flow divided by invested cash. Negative values remain negative and zero-denominator ratios are not defined.",
  ],
];
export default function Page() {
  return (
    <main className="wrap resource-page">
      <PageHero
        eyebrow="the dscr field guide"
        title="Understand the ratio."
        accent="See the bigger picture."
        description="A ratio is a starting point. Explore what it measures, change a few inputs and learn what still needs a human review."
        actions={[
          { label: "Try the ratio lab", href: "#ratio-lab" },
          { label: "Open DSCR calculator", href: "/calculators/dscr/" },
        ]}
      />
      <RatioLab />
      <section className="guide-topics" aria-labelledby="topics-title">
        <div className="resource-section-heading">
          <div>
            <span className="resource-label">THE DETAILS THAT MATTER</span>
            <h2 id="topics-title">Read between the numbers.</h2>
          </div>
          <p>Open a topic for the assumptions behind the model.</p>
        </div>
        {topics.map(([title, sub, copy], i) => (
          <details key={title} className="resource-topic">
            <summary>
              <span className="topic-number">0{i + 1}</span>
              <span>
                <strong>{title}</strong>
                <small>{sub}</small>
              </span>
              <span className="topic-plus" aria-hidden="true">
                +
              </span>
            </summary>
            <p>{copy}</p>
          </details>
        ))}
      </section>
      <section className="resource-review-strip">
        <div>
          <span className="resource-label">THE HUMAN PART</span>
          <h2>
            A model informs.
            <br />
            An underwriter reviews.
          </h2>
        </div>
        <div>
          <p>
            Program eligibility, current pricing, APR, reserves and
            lender-specific rental methodology are outside these estimates. A
            human underwriter must review the full loan scenario.
          </p>
          <Link href="/calculators/dscr/" className="resource-pill">
            Build your scenario <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
