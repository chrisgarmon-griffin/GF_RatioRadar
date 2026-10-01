import type { SearchParams, SearchRow } from "@/lib/search";
import { money, pct, ratio } from "@/lib/format";
import { HouseIcon } from "./Mark";

const tone = (d: number) => (d >= 1 ? "good" : d >= 0.85 ? "warn" : "bad");
const label = (d: number) => (d >= 1 ? "1.0 or better" : d >= 0.85 ? "close to 1.0" : "below 1.0");

export function ListingCard({
  row,
  params,
  onSelect,
}: {
  row: SearchRow;
  params: SearchParams;
  onSelect: (r: SearchRow) => void;
}) {
  const { listing: l, rent, dscr, dscrLow, dscrHigh, need } = row;
  const t = tone(dscr);
  return (
    <article className="card">
      <div className="photo">
        {l.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={l.photoUrl} alt={`${l.address}, ${l.city}`} />
        ) : (
          <>
            <HouseIcon />
            <span>Photo not available</span>
          </>
        )}
      </div>
      <div className="body">
        <div className="price">{money(l.price)}</div>
        <div className="addr">
          {l.address}, {l.city}, {l.state} {l.zip}
        </div>
        <div className="ratio-row">
          <span className={`ratio ${t}`} aria-label={`DSCR ${ratio(dscr)}`}>
            {ratio(dscr)}
          </span>
          <span className={`badge ${t}`}>{label(dscr)}</span>
        </div>
        <div className="range">
          DSCR at {pct(params.downPct)} down. Rent range {money(rent.low ?? rent.monthlyRent)} to{" "}
          {money(rent.high ?? rent.monthlyRent)} a month gives {ratio(dscrLow)} to {ratio(dscrHigh)}.
        </div>
        {rent.fsd !== undefined && (
          // HouseCanary's own reports show confidence as 1 minus the forecast standard deviation
          // (FSD 0.23 reads as 77%, FSD 0.17 as 83%). Inferred from sample reports, not from their docs.
          <div className="range">Rent estimate confidence {Math.round((1 - rent.fsd) * 100)}%.</div>
        )}
        {l.propertyType === "2-4 Unit" && (
          <div className="range">
            Multi-unit property: this rent estimate may cover only one unit. A loan officer will confirm total rent.
          </div>
        )}
        <div className="facts">
          <span>Est. rent {money(rent.monthlyRent)}/mo</span>
          <span>{l.beds} bd</span>
          <span>{l.baths} ba</span>
          <span>{l.sqft.toLocaleString()} sqft</span>
          <span>{l.propertyType}</span>
          <span>{l.daysOnMarket} days listed</span>
        </div>
        <div className="need">
          {need.reachable
            ? `Reaches 1.0 with ${pct(need.downPct)} down (${money(need.downPayment)}).`
            : need.reason === "exceeds-max-down"
              ? "Needs more than 50% down to reach 1.0."
              : "Rent does not cover taxes and insurance."}
        </div>
        <button className="btn btn-primary" type="button" onClick={() => onSelect(row)}>
          check my loan options
        </button>
      </div>
    </article>
  );
}
