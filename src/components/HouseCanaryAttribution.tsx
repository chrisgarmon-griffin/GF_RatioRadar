/**
 * Official HouseCanary attribution, copied from the account's API Keys page (Data Attribution).
 * Required wherever HouseCanary data is displayed publicly. The beacon URL carries account identifiers
 * HouseCanary uses to credit usage; it is not a credential. Regenerate from the dashboard if the account changes.
 */
const BEACON =
  "https://beacon.housecanary.com/v1/attribution.svg?d=eyJhdXRoT3JnYW5pemF0aW9uU2x1ZyI6ImdyaWZmaW4tZnVuZGluZ2QyNHJwZXpqIiwiYXV0aE9yZ2FuaXphdGlvbklkIjozMDMwNTAsImNyZWF0ZWRCeVVzZXJJZCI6NDQ4OTU4LCJhcHBOYW1lIjoiUGxhdGZvcm0ifQ==";

export function HouseCanaryAttribution() {
  return (
    <p className="meta" style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span>Rent estimates</span>
      <a
        href="https://www.housecanary.com"
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", lineHeight: 1 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BEACON} alt="HouseCanary" title="HouseCanary" style={{ display: "inline-block", width: 181, height: 19 }} />
      </a>
    </p>
  );
}
