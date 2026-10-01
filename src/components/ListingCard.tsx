import Image from "next/image";
import { useState } from "react";
import type { SearchParams, SearchRow } from "@/lib/search";
import { money, pct, ratio } from "@/lib/format";
import { Icon } from "./Icon";
export function PropertyPhoto({
  row,
  priority = false,
  sizes = "(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 45vw",
}: {
  row: SearchRow;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  return row.listing.photoUrl && !failed ? (
    <Image
      src={row.listing.photoUrl}
      alt={
        row.listing.source === "fixture"
          ? "Illustrative property photograph; not the listed address"
          : `${row.listing.address}, ${row.listing.city}`
      }
      fill
      sizes={sizes}
      preload={priority}
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="photo-fallback">
      <Icon name="home" />
      <span>Property photo unavailable</span>
    </div>
  );
}
export function ListingCard({
  row,
  params,
  onSelect,
  compared,
  onCompare,
  featured,
  compareDisabled,
}: {
  row: SearchRow;
  params: SearchParams;
  onSelect: (r: SearchRow) => void;
  compared: boolean;
  onCompare: () => void;
  featured?: boolean;
  compareDisabled: boolean;
}) {
  const { listing: l, dscr, rent, need } = row;
  return (
    <article className={`property-card ${featured ? "featured" : ""}`}>
      <div className="property-photo">
        <button
          className="photo-open"
          onClick={() => onSelect(row)}
          aria-label={`View scenario for ${l.address}`}
        >
          <PropertyPhoto row={row} priority={featured} />
        </button>
        <span className="photo-badge">
          {l.propertyType === "SFR" ? "Single-family" : l.propertyType}
        </span>
        <button
          className={`compare-toggle ${compared ? "selected" : ""}`}
          aria-label={`${compared ? "Remove" : "Compare"} ${l.address}`}
          aria-pressed={compared}
          disabled={compareDisabled && !compared}
          onClick={onCompare}
        >
          <Icon name={compared ? "check" : "plus"} />
        </button>
        {l.source === "fixture" && (
          <span className="photo-caption">ILLUSTRATIVE PHOTO</span>
        )}
        {featured && (
          <span className="feature-caption">
            A closer look at your next move.
          </span>
        )}
      </div>
      <div className="property-body">
        <div className="property-title">
          <div>
            <span className="property-location">
              {l.city}, {l.state}
            </span>
            <h3>
              <button onClick={() => onSelect(row)}>{l.address}</button>
            </h3>
          </div>
          <span className="property-price">{money(l.price)}</span>
        </div>
        <p className="property-facts">
          {l.beds} beds <span>·</span> {l.baths} baths <span>·</span>{" "}
          {l.sqft.toLocaleString()} sq ft{" "}
          <span className="days-listed">· {l.daysOnMarket} days listed</span>
        </p>
        <div className="property-metrics">
          <div className="ratio-metric">
            <span className="micro">
              EST. DSCR <Icon name="info" />
            </span>
            <strong className={dscr >= 1 ? "positive" : ""}>
              {ratio(dscr)}
              <small>×</small>
            </strong>
          </div>
          <div>
            <span className="micro">EST. RENT / MO</span>
            <strong>{money(rent.monthlyRent)}</strong>
          </div>
          <div>
            <span className="micro">DOWN PAYMENT</span>
            <strong>{pct(params.downPct)}</strong>
          </div>
        </div>
        <div className="dscr-paths" aria-label="Paths to 1.0 DSCR">
          <div><span>Down to reach 1.0</span><strong>{need.reachable ? `${pct(need.downPct)} · ${money(need.downPayment)}` : "Not reachable"}</strong></div>
          <div><span>Rate at {pct(params.downPct)} down</span><strong>{row.rateNeed.reachable ? row.rateNeed.alreadyMeets ? "Already meets 1.0" : `${(row.rateNeed.annualRate * 100).toFixed(3)}% or lower` : "Not reachable at 0%"}</strong></div>
          <small>{row.hoaKnown ? "Supplied HOA included." : "HOA unknown · $0 assumed; verify."} Target rate is not a quote.</small>
        </div>
        <div className="property-bottom">
          <span className={`coverage ${dscr >= 1 ? "good" : "neutral"}`}>
            <span className="status-dot" />
            {dscr >= 1
              ? "At or above 1.0"
              : need.reachable
                ? `1.0 at ${pct(need.downPct)} down`
                : "Fixed costs exceed rent"}
          </span>
          <button className="text-button" onClick={() => onSelect(row)}>
            View scenario <Icon name="arrow" />
          </button>
        </div>
      </div>
    </article>
  );
}
