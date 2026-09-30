import Link from "next/link";
export const metadata = { title: "DSCR Guide | Griffin Funding RatioRadar" };
export default function Page() {
  return (
    <main className="wrap article-page">
      <span className="eyebrow">UNDERSTAND THE MODEL</span>
      <h1>A ratio is a starting point.</h1>
      <h2>Rental-income DSCR</h2>
      <p>
        This calculator divides modeled monthly rent by principal and interest,
        property taxes, property insurance, HOA dues and flood insurance. A
        ratio of 1.00× means rent equals that modeled housing payment. It does
        not mean the property breaks even after all operating costs, or that a
        loan qualifies.
      </p>
      <h2>Short-term rentals</h2>
      <p>
        The financing calculator converts annual revenue into a monthly average
        and applies the income reduction you enter. Its 20% starting reduction
        comes from the supplied calculator reference and is a modeling
        assumption. Actual investor treatment and rental documentation require
        verification.
      </p>
      <h2>Interest-only and refinance</h2>
      <p>
        Interest-only payments use loan principal multiplied by the annual
        interest rate, divided by 12. The principal balance does not decline
        during that period. Refinance proceeds are limited by the LTV assumption
        you enter, after the current balance and financed closing costs. The 80%
        starting LTV is not a program guideline.
      </p>
      <h2>Cash flow is a different question</h2>
      <p>
        Net operating income is effective rent after vacancy less operating
        expenses, before debt service. Cash flow subtracts the loan payment. Cap
        rate divides annual NOI by property value; cash-on-cash return divides
        annual cash flow by invested cash. Negative results remain negative. A
        ratio with a zero denominator is shown as not defined.
      </p>
      <h2>What the model does not establish</h2>
      <p>
        Program eligibility, current pricing, APR, reserves, lender-specific
        rent methodology, taxes on investment income, appreciation and
        disposition proceeds are outside this model. A human underwriter must
        review the full loan scenario.
      </p>
      <Link href="/calculators/dscr/">Build a financing scenario →</Link>
    </main>
  );
}
