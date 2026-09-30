import { Specialists } from "./Specialists";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { storeHandoff } from "@/lib/calculators/handoff";
import { emptyScenario } from "@/lib/calculators/model";
import type { SearchResponse, SearchRow } from "@/lib/search";
import { computeDscr, DEFAULT_ASSUMPTIONS } from "@/lib/dscr";
import { money, pct, ratio } from "@/lib/format";
import { Modal } from "./Modal";
import { PropertyPhoto } from "./ListingCard";
import { Icon } from "./Icon";
export function ScenarioDialog({
  row,
  data,
  onClose,
  onReview,
}: {
  row: SearchRow;
  data: SearchResponse;
  onClose: () => void;
  onReview: () => void;
}) {
  const router = useRouter();
  const [handoffError, setHandoffError] = useState(false);
  const { listing: l, rent, need } = row;
  const p = data.params;
  const result = computeDscr({
    price: l.price,
    monthlyRent: rent.monthlyRent,
    annualRate: data.rate.rate,
    downPct: p.downPct,
    interestOnly: p.interestOnly,
    fortyYear: p.fortyYear,
  });
  return (
    <Modal title="PROPERTY / FINANCING SCENARIO" onClose={onClose} wide>
      <div className="scenario-grid">
        <div className="scenario-left">
          <div className="scenario-photo">
            <PropertyPhoto row={row} />
            {l.source === "fixture" && (
              <span className="photo-caption">
                ILLUSTRATIVE PHOTO · FICTIONAL ADDRESS
              </span>
            )}
          </div>
          <div className="scenario-address">
            <span className="eyebrow">
              {l.city}, {l.state} {l.zip}
            </span>
            <h2>{l.address}</h2>
            <p>
              {l.beds} beds · {l.baths} baths · {l.sqft.toLocaleString()} sq ft
            </p>
            <strong>{money(l.price)}</strong>
          </div>
          <div className="assumptions">
            <Icon name="info" />
            <p>
              Sample inputs, not a quote. Annual tax:{" "}
              {(DEFAULT_ASSUMPTIONS.taxRate * 100).toFixed(2)}% of price. Annual
              insurance: {(DEFAULT_ASSUMPTIONS.insuranceRate * 100).toFixed(2)}
              %. HOA dues and operating expenses are excluded.
            </p>
          </div>
        </div>
        <div className="scenario-right">
          <span className="eyebrow">YOUR PROPERTY, IN PERSPECTIVE</span>
          <div className="scenario-ratio">
            <strong>
              {ratio(row.dscr)}
              <small>×</small>
            </strong>
            <span>
              Estimated DSCR
              <br />
              at {pct(p.downPct)} down
            </span>
          </div>
          <p className="ratio-explainer">
            {row.dscr >= 1
              ? "Estimated rent covers the modeled housing payment."
              : "Estimated rent falls short of the modeled housing payment."}{" "}
            This is not a credit decision.
          </p>
          <dl className="breakdown">
            <div>
              <dt>Sample monthly rent</dt>
              <dd>{money(rent.monthlyRent)}</dd>
            </div>
            <div>
              <dt>
                {p.interestOnly
                  ? "Interest-only payment"
                  : "Principal & interest"}
              </dt>
              <dd>{money(result.monthlyPI)}</dd>
            </div>
            <div>
              <dt>Assumed taxes & insurance</dt>
              <dd>{money(result.monthlyTaxIns)}</dd>
            </div>
            <div className="total">
              <dt>Modeled housing payment</dt>
              <dd>{money(result.pitia)}/mo</dd>
            </div>
            <div>
              <dt>Down payment · {pct(p.downPct)}</dt>
              <dd>{money(result.downPayment)}</dd>
            </div>
            <div>
              <dt>Modeled loan amount</dt>
              <dd>{money(result.loanAmount)}</dd>
            </div>
            <div>
              <dt>
                Sample rate ·{" "}
                {p.interestOnly
                  ? "interest-only"
                  : p.fortyYear
                    ? "40-year"
                    : "30-year"}
              </dt>
              <dd>{(data.rate.rate * 100).toFixed(3)}%</dd>
            </div>
          </dl>
          <div className="rent-range">
            <span className="micro">RENT SENSITIVITY</span>
            <div>
              <span>
                Low estimate<b>{ratio(row.dscrLow)}×</b>
                <small>{money(rent.low ?? rent.monthlyRent)}/mo</small>
              </span>
              <span>
                Mid estimate<b>{ratio(row.dscr)}×</b>
                <small>{money(rent.monthlyRent)}/mo</small>
              </span>
              <span>
                High estimate<b>{ratio(row.dscrHigh)}×</b>
                <small>{money(rent.high ?? rent.monthlyRent)}/mo</small>
              </span>
            </div>
          </div>
          {rent.fsd !== undefined && (
            <p className="hint">
              Rent source: {rent.source}. Forecast standard deviation:{" "}
              {(rent.fsd * 100).toFixed(1)}%. This measures model uncertainty,
              not a guarantee of achievable rent.
            </p>
          )}
          <p className="need-note">
            {need.reachable
              ? `Modeled path to 1.0: ${pct(need.downPct)} down (${money(need.downPayment)}) at this scenario’s rate. A different down payment may change actual pricing.`
              : "This sample scenario does not reach 1.0 within the 50% down payment limit."}
          </p>
          <button className="btn btn-primary full" onClick={onReview}>
            Request a scenario review <Icon name="arrow" />
          </button>
          <button
            className="calc-print full"
            onClick={() => {
              const scenario = emptyScenario();
              scenario.payment = p.interestOnly
                ? "interest_only"
                : "amortizing";
              scenario.values = {
                ...scenario.values,
                propertyValue: String(l.price),
                grossRent: String(rent.monthlyRent),
                downPct: String(p.downPct * 100),
                ratePct: String(data.rate.rate * 100),
                termYears: p.fortyYear ? "40" : "30",
                taxes: ((l.price * DEFAULT_ASSUMPTIONS.taxRate) / 12).toFixed(
                  2,
                ),
                insurance: (
                  (l.price * DEFAULT_ASSUMPTIONS.insuranceRate) /
                  12
                ).toFixed(2),
              };
              if (storeHandoff(scenario, "dscr", "property")) {
                onClose();
                router.push("/calculators/dscr/");
              } else setHandoffError(true);
            }}
          >
            Refine in DSCR calculator →
          </button>
          {handoffError && (
            <p role="alert">
              Could not carry this scenario. Open Calculators and enter the
              values manually.
            </p>
          )}
          <p className="hint">
            A human loan officer reviews actual rent, terms and program
            requirements.
          </p>
        </div>
      </div>
      <Specialists compact />
    </Modal>
  );
}
