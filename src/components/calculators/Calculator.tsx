"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  calculateDscr,
  calculateCashFlow,
  cashFlowHandoff,
  emptyScenario,
  sampleScenario,
  validation,
  type Scenario,
} from "@/lib/calculators/model";
import { storeHandoff, consumeHandoff } from "@/lib/calculators/handoff";
const money = (n: number | null) =>
  n === null
    ? "Not defined"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);
const ratio = (n: number | null) =>
  n === null ? "Not defined" : n.toFixed(2) + "×";
const pct = (n: number | null) =>
  n === null ? "Not defined" : (n * 100).toFixed(2) + "%";
const labels: Record<string, string> = {
  propertyValue: "Property value / purchase price",
  downPct: "Down payment",
  grossRent: "Monthly rental income",
  annualRevenue: "Annual short-term rental revenue",
  strFactor: "STR income reduction",
  ratePct: "Annual interest rate",
  taxes: "Property taxes",
  insurance: "Property insurance",
  hoa: "HOA dues",
  flood: "Flood insurance",
  currentBalance: "Current loan balance",
  desiredCashOut: "Desired cash out",
  closingCosts: "Financed closing costs",
  maxLtv: "Maximum LTV assumption",
  vacancyPct: "Vacancy / revenue loss",
  management: "Property management",
  maintenance: "Maintenance reserve",
  utilities: "Owner-paid utilities",
  otherOperating: "Other operating expenses",
  debtService: "Loan payment (principal + interest only)",
  cashInvested: "Total cash invested",
};
const percentKeys = ["downPct", "strFactor", "ratePct", "maxLtv", "vacancyPct"];
export function Calculator({ kind }: { kind: "dscr" | "cashflow" }) {
  const [s, setS] = useState<Scenario>(emptyScenario);
  const [origin, setOrigin] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  useEffect(() => {
    const h = consumeHandoff(kind);
    if (h) {
      // Session storage is an external source consumed once after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setS(h.scenario);
      setOrigin(h.source);
    }
  }, [kind]);
  const d = kind === "dscr" ? calculateDscr(s) : null;
  const c = kind === "cashflow" ? calculateCashFlow(s) : null;
  const missing = validation(s, kind);
  const hasValues = Object.keys(s.values).length > 4;
  function field(key: string) {
    const unit = percentKeys.includes(key) ? "%" : "$";
    return (
      <label className="calc-field" key={key}>
        <span>{labels[key]}</span>
        <div>
          <span aria-hidden="true">{unit}</span>
          <input
            name={key}
            type="number"
            inputMode="decimal"
            min="0"
            max={unit === "%" ? (key === "ratePct" ? 30 : 100) : 1000000000}
            step="any"
            value={s.values[key] ?? ""}
            onChange={(e) =>
              setS({ ...s, values: { ...s.values, [key]: e.target.value } })
            }
            placeholder="Enter amount"
          />
        </div>
      </label>
    );
  }
  function transfer() {
    const next = cashFlowHandoff(s);
    if (!next) return;
    if (storeHandoff(next, "cashflow", "dscr"))
      router.push("/calculators/cash-flow/");
    else
      setNotice(
        "Your browser could not carry this scenario. Open Cash Flow and enter the values manually.",
      );
  }
  return (
    <main className="wrap">
      <div className="tool-intro">
        <Link className="eyebrow" href="/calculators/">
          CALCULATORS / {kind === "dscr" ? "FINANCING" : "OPERATIONS"}
        </Link>
        <h1>
          {kind === "dscr" ? (
            <>
              Know the rent.
              <br />
              <em>Model the financing.</em>
            </>
          ) : (
            <>
              Beyond the payment.
              <br />
              <em>See the cash flow.</em>
            </>
          )}
        </h1>
        <p>
          {kind === "dscr"
            ? "Compare purchase and refinance scenarios with long-term or short-term rental income. Every assumption stays in view."
            : "See what remains after vacancy, property expenses and the loan payment. Separate the investment economics from the financing ratio."}
        </p>
      </div>
      <div className="calc-toolbar">
        <span>
          {origin
            ? `Carried from ${origin}. Review every input.`
            : "Your inputs stay in this browser. No account required."}
        </span>
        <div>
          <button
            type="button"
            onClick={() => {
              setS(sampleScenario());
              setOrigin("Illustrative example");
              setNotice("");
            }}
          >
            Load example
          </button>
          <button
            type="button"
            onClick={() => {
              setS(emptyScenario());
              setOrigin("");
              setNotice("");
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="calculator-layout">
        <section className="calc-inputs" aria-label="Scenario inputs">
          <div className="calc-section">
            <div className="calc-section-title">
              <span>01</span>
              <h2>Your scenario</h2>
            </div>
            <div className="calc-fields">
              {kind === "dscr" && (
                <label className="calc-field">
                  <span>Transaction</span>
                  <select
                    value={s.transaction}
                    onChange={(e) =>
                      setS({
                        ...s,
                        transaction: e.target.value as Scenario["transaction"],
                      })
                    }
                  >
                    <option value="purchase">Purchase</option>
                    <option value="refinance">Cash-out refinance</option>
                  </select>
                </label>
              )}
              <label className="calc-field">
                <span>Rental strategy</span>
                <select
                  value={s.rental}
                  onChange={(e) =>
                    setS({ ...s, rental: e.target.value as Scenario["rental"] })
                  }
                >
                  <option value="ltr">Long-term rental</option>
                  <option value="str">Short-term rental</option>
                </select>
              </label>
              {field("propertyValue")}
              {field(s.rental === "str" ? "annualRevenue" : "grossRent")}
              {kind === "dscr" && s.rental === "str" && field("strFactor")}
              {kind === "cashflow" && field("vacancyPct")}
            </div>
            {s.rental === "str" && (
              <p className="calc-note">
                {kind === "dscr"
                  ? "Revenue is divided by 12 and reduced by your STR assumption. The 20% starting value is an editable modeling assumption, not an investor guideline."
                  : "Annual revenue is divided by 12, then reduced by the vacancy / revenue-loss assumption. Do not count vacancy twice if revenue already reflects it."}
              </p>
            )}
          </div>
          {kind === "dscr" ? (
            <div className="calc-section">
              <div className="calc-section-title">
                <span>02</span>
                <h2>Financing assumptions</h2>
              </div>
              <div className="calc-fields">
                {s.transaction === "purchase"
                  ? field("downPct")
                  : [
                      "currentBalance",
                      "desiredCashOut",
                      "closingCosts",
                      "maxLtv",
                    ].map(field)}
                {field("ratePct")}
                <label className="calc-field">
                  <span>Amortization term</span>
                  <select
                    value={s.values.termYears}
                    onChange={(e) =>
                      setS({
                        ...s,
                        values: { ...s.values, termYears: e.target.value },
                      })
                    }
                  >
                    {[15, 20, 25, 30, 40].map((n) => (
                      <option key={n} value={n}>
                        {n} years
                      </option>
                    ))}
                  </select>
                </label>
                <label className="calc-field">
                  <span>Payment structure</span>
                  <select
                    value={s.payment}
                    onChange={(e) =>
                      setS({
                        ...s,
                        payment: e.target.value as Scenario["payment"],
                      })
                    }
                  >
                    <option value="amortizing">Principal + interest</option>
                    <option value="interest_only">Interest only</option>
                  </select>
                </label>
              </div>
              <p className="calc-note">
                {s.payment === "interest_only"
                  ? "Interest-only results describe the interest-only period. Principal does not decline. Future amortizing payments and the interest-only period must be confirmed."
                  : "Enter a scenario rate. This is not a current rate quote or APR."}
                {s.transaction === "refinance"
                  ? " The 80% starting LTV cap is editable and does not establish program availability."
                  : ""}
              </p>
            </div>
          ) : (
            <div className="calc-section">
              <div className="calc-section-title">
                <span>02</span>
                <h2>Capital & debt</h2>
              </div>
              <div className="calc-fields">
                {field("debtService")}
                {field("cashInvested")}
              </div>
              <p className="calc-note">
                Use principal and interest only, excluding escrowed taxes and
                insurance. Total cash invested should include down payment,
                closing costs and initial improvements. When carried from DSCR,
                the initial figure includes only the down payment.
              </p>
            </div>
          )}
          <div className="calc-section">
            <div className="calc-section-title">
              <span>03</span>
              <h2>Monthly property costs</h2>
            </div>
            <p className="calc-note">
              Enter monthly amounts. Divide annual bills by 12. Enter 0 where a
              cost does not apply.
            </p>
            <div className="calc-fields">
              {[
                "taxes",
                "insurance",
                "hoa",
                "flood",
                ...(kind === "cashflow"
                  ? ["management", "maintenance", "utilities", "otherOperating"]
                  : []),
              ].map(field)}
            </div>
          </div>
        </section>
        <aside className="calc-results" aria-label="Calculated results">
          <div className="result-heading">
            <span className="eyebrow">SCENARIO ESTIMATE</span>
            <span className="result-live">
              {d || c ? "Calculated" : "Awaiting inputs"}
            </span>
          </div>
          {d ? (
            <>
              <span className="result-label">Rental-income DSCR</span>
              <div className="result-hero">{ratio(d.displayRatio)}</div>
              <p className="calc-note">
                Adjusted monthly rent ÷ total monthly housing payment. This is
                an estimate, not a qualification result.
              </p>
              <dl className="result-rows">
                <div>
                  <dt>Modeled loan amount</dt>
                  <dd>{money(d.modeledLoan)}</dd>
                </div>
                <div>
                  <dt>Rent used in DSCR</dt>
                  <dd>{money(d.qualifyingRent)}</dd>
                </div>
                <div>
                  <dt>
                    {s.payment === "interest_only"
                      ? "Interest-only payment"
                      : "Principal + interest"}
                  </dt>
                  <dd>{money(d.pi)}</dd>
                </div>
                <div>
                  <dt>Taxes, insurance, HOA & flood</dt>
                  <dd>{money(d.pitia - d.pi)}</dd>
                </div>
                <div className="result-total">
                  <dt>Total housing payment</dt>
                  <dd>{money(d.pitia)} / mo</dd>
                </div>
                <div>
                  <dt>Rent needed at 1.00×</dt>
                  <dd>{money(d.rentNeeded100)}</dd>
                </div>
                <div>
                  <dt>Rent needed at 1.25×</dt>
                  <dd>{money(d.rentNeeded125)}</dd>
                </div>
              </dl>
              {d.refinance && (
                <div className="calc-callout">
                  <h3>Refinance proceeds</h3>
                  <p>
                    Estimated cash out:{" "}
                    <strong>{money(d.refinance.estimatedCashOut)}</strong>
                  </p>
                  <p>
                    Cash needed to close:{" "}
                    <strong>{money(d.refinance.cashToClose)}</strong>
                  </p>
                  <p>Modeled LTV: {pct(d.refinance.estimatedLtv)}</p>
                  {d.refinance.cashOutLimited && (
                    <p>The LTV assumption limits the requested cash out.</p>
                  )}
                </div>
              )}
              <details className="calc-details">
                <summary>Loan buying power</summary>
                <dl className="result-rows">
                  <div>
                    <dt>At 1.00× DSCR</dt>
                    <dd>{money(d.buyingPower100)}</dd>
                  </div>
                  <div>
                    <dt>At 1.25× DSCR</dt>
                    <dd>{money(d.buyingPower125)}</dd>
                  </div>
                </dl>
                <p className="calc-note">
                  Maximum modeled loan principal from rent and your payment
                  assumptions. Excludes LTV limits, program limits and lender
                  qualification. These ratios are comparison benchmarks.
                </p>
              </details>
              <button className="calc-primary" onClick={transfer}>
                Continue to cash flow →
              </button>
            </>
          ) : c ? (
            <>
              <span className="result-label">Monthly cash flow</span>
              <div
                className={
                  "result-hero " + (c.monthlyCashFlow < 0 ? "negative" : "")
                }
              >
                {money(c.monthlyCashFlow)}
              </div>
              <p className="calc-note">
                Income after vacancy, operating costs and the loan payment.
              </p>
              <dl className="result-rows">
                <div>
                  <dt>Effective monthly income</dt>
                  <dd>{money(c.investorEffectiveIncome)}</dd>
                </div>
                <div>
                  <dt>Operating expenses</dt>
                  <dd>{money(c.operatingExpenses)}</dd>
                </div>
                <div>
                  <dt>Monthly NOI</dt>
                  <dd>{money(c.monthlyNoi)}</dd>
                </div>
                <div>
                  <dt>Loan payment</dt>
                  <dd>{money(c.pi)}</dd>
                </div>
                <div className="result-total">
                  <dt>Annual cash flow</dt>
                  <dd>{money(c.monthlyCashFlow * 12)}</dd>
                </div>
                <div>
                  <dt>Annual NOI</dt>
                  <dd>{money(c.annualNoi)}</dd>
                </div>
                <div>
                  <dt>Cap rate</dt>
                  <dd>{pct(c.displayCapRate)}</dd>
                </div>
                <div>
                  <dt>Cash-on-cash return</dt>
                  <dd>{pct(c.displayCashOnCash)}</dd>
                </div>
                <div>
                  <dt>NOI / loan payment</dt>
                  <dd>{ratio(c.displayInvestorDscr)}</dd>
                </div>
              </dl>
              <p className="calc-note">
                NOI excludes debt service. Cap rate uses annual NOI ÷ property
                value. Cash-on-cash uses annual cash flow ÷ invested cash.
                Ratios with zero denominators are not defined. Reserves, tax
                treatment and sale proceeds are not modeled.
              </p>
              <Link className="calc-primary" href="/calculators/dscr/">
                Model the financing →
              </Link>
            </>
          ) : (
            <div className="result-empty">
              <span>—</span>
              <h2>Your scenario, made clear.</h2>
              <p>
                Complete the inputs to see your estimate, or load an
                illustrative example.
              </p>
              {hasValues && (
                <p className="calc-note">
                  {missing.length} input{missing.length === 1 ? "" : "s"} need
                  attention: {missing.map((k) => labels[k] ?? k).join(", ")}.
                </p>
              )}
            </div>
          )}
          <p role="status" className="calc-note">
            {notice}
          </p>
          {(d || c) && (
            <button className="calc-print" onClick={() => window.print()}>
              Print scenario & review checklist ↗
            </button>
          )}
          <div className="underwriter-review">
            <h3>For human review</h3>
            <ul>
              <li>Verify value, rental evidence and occupancy strategy.</li>
              <li>Confirm taxes, insurance, HOA and flood costs.</li>
              <li>Review credit, reserves, title and existing liens.</li>
              <li>
                Confirm investor methodology, eligible terms and final pricing.
              </li>
            </ul>
            <a href="https://griffinfunding.com/full-page-form-quick-quote/">
              Discuss your scenario with Griffin ↗
            </a>
            <p className="calc-note">
              Your calculator inputs are not sent through this link.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
