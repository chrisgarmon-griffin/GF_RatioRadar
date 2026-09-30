"use client";
import { useState } from "react";
const usd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
export function RatioLab() {
  const [rent, setRent] = useState(3000);
  const [cost, setCost] = useState(2500);
  const result = rent / cost;
  return (
    <section className="ratio-lab" id="ratio-lab" aria-labelledby="lab-title">
      <div className="ratio-lab-inputs">
        <span className="resource-label">THE INTERACTIVE EXPLAINER</span>
        <h2 id="lab-title">
          Move the inputs.
          <br />
          See the relationship.
        </h2>
        <p>
          This simplified example isolates the ratio. These are illustrative
          amounts, not market rents or a financing quote.
        </p>
        <label htmlFor="lab-rent">
          Monthly rent <output htmlFor="lab-rent">{usd(rent)}</output>
        </label>
        <input
          id="lab-rent"
          type="range"
          min="500"
          max="6000"
          step="50"
          value={rent}
          onChange={(e) => setRent(Number(e.target.value))}
        />
        <div className="range-caps">
          <span>$500</span>
          <span>$6,000</span>
        </div>
        <label htmlFor="lab-cost">
          Monthly housing payment{" "}
          <output htmlFor="lab-cost">{usd(cost)}</output>
        </label>
        <input
          id="lab-cost"
          type="range"
          min="500"
          max="6000"
          step="50"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
        />
        <div className="range-caps">
          <span>$500</span>
          <span>$6,000</span>
        </div>
        <p className="resource-fine">
          Payment includes principal, interest, taxes, property insurance, HOA
          and flood costs. Operating expenses are a separate cash-flow question.
        </p>
        <button
          className="lab-reset"
          onClick={() => {
            setRent(3000);
            setCost(2500);
          }}
        >
          Reset example ↺
        </button>
      </div>
      <div className="ratio-lab-result">
        <span className="resource-label">RENT ÷ HOUSING PAYMENT</span>
        <div className="ratio-orbit">
          <span className="ratio-orbit-ring" />
          <div>
            <output aria-label="Illustrative DSCR">
              {result.toFixed(2)}
              <small>×</small>
            </output>
            <span>MODELED DSCR</span>
          </div>
        </div>
        <div className="lab-equation">
          {usd(rent)} <span>÷</span> {usd(cost)} <span>=</span>{" "}
          {result.toFixed(2)}×
        </div>
        <p>
          {result >= 1
            ? "Rent covers the modeled housing payment."
            : "Rent falls short of the modeled housing payment."}
        </p>
        <p className="resource-fine">
          1.00× is a mathematical comparison point, not a lender requirement or
          a promise of positive cash flow.
        </p>
      </div>
    </section>
  );
}
