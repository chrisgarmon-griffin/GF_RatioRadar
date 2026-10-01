import type { SearchResponse, SearchRow } from "@/lib/search";
import { money, pct, ratio } from "@/lib/format";
import { Modal } from "./Modal";
import { PropertyPhoto } from "./ListingCard";
export function CompareDialog({
  rows,
  data,
  onClose,
  onSelect,
}: {
  rows: SearchRow[];
  data: SearchResponse;
  onClose: () => void;
  onSelect: (r: SearchRow) => void;
}) {
  const fields: [string, (r: SearchRow) => string][] = [
    ["Purchase price", (r) => money(r.listing.price)],
    ["Estimated DSCR", (r) => `${ratio(r.dscr)}×`],
    ["Rent sensitivity", (r) => `${ratio(r.dscrLow)}–${ratio(r.dscrHigh)}×`],
    ["Sample rent / month", (r) => money(r.rent.monthlyRent)],
    ["Modeled payment / month", (r) => money(r.rent.monthlyRent / r.dscr)],
    ["Down payment", (r) => money(r.listing.price * data.params.downPct)],
    [
      "Down to reach 1.0",
      (r) => (r.need.reachable ? pct(r.need.downPct) : "Fixed costs exceed rent"),
    ],
    ["Rate to reach 1.0", (r) => r.rateNeed.reachable ? r.rateNeed.alreadyMeets ? "Already meets" : `${(r.rateNeed.annualRate * 100).toFixed(3)}%` : "Not reachable"],
    ["HOA / month", (r) => r.hoaKnown ? money(r.listing.monthlyHoa ?? 0) : "Unknown · $0 assumed"],
    ["Beds / baths", (r) => `${r.listing.beds} / ${r.listing.baths}`],
    ["Interior area", (r) => `${r.listing.sqft.toLocaleString()} sq ft`],
  ];
  return (
    <Modal title="SIDE-BY-SIDE / PROPERTY COMPARISON" onClose={onClose} wide>
      <div className="compare-content">
        <h2>Same assumptions. Clearer choices.</h2>
        <p>
          {pct(data.params.downPct)} down ·{" "}
          {data.params.interestOnly
            ? "Interest-only"
            : data.params.fortyYear
              ? "40-year amortization"
              : "30-year amortization"}{" "}
          · Sample rate {(data.rate.rate * 100).toFixed(3)}%
        </p>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Property comparison table"
        >
          <table className="comparison-table">
            <thead>
              <tr>
                <th scope="col">The details</th>
                {rows.map((r) => (
                  <th scope="col" key={r.listing.id}>
                    <div className="compare-photo">
                      <PropertyPhoto row={r} sizes="240px" />
                    </div>
                    <b>{r.listing.address}</b>
                    <small>
                      {r.listing.city}, {r.listing.state}
                    </small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {rows.map((r) => (
                    <td key={r.listing.id}>{value(r)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">Explore scenario</th>
                {rows.map((r) => (
                  <td key={r.listing.id}>
                    <button className="text-button" onClick={() => onSelect(r)}>
                      View details →
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="hint">
          Sample data and illustrative photos. Supplied HOA is included; unknown HOA is modeled at $0. Operating expenses are excluded. A 1.0 ratio is not an eligibility
          determination.
        </p>
      </div>
    </Modal>
  );
}
