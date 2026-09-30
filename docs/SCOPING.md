# Revestor Rebuild — Scoping Doc (Free/Public Data Research + Beat Revavest)

Context: assigned to Chris at the 2026-09-29 meeting with Bill. Two goals in one project: (1) find free/public real estate data sources to avoid or shrink the ~$50K/year Constellation spend, and (2) come out the other side with a Revestor that's genuinely better than [revavest.com](https://revavest.com/), not just a DSCR calculator. See [[project_mbs-highway-webinar-revestor]] for the decisions already locked with Bill.

## 1. What Revavest actually is (checked 2026-09-29)

Revavest is not a data/search competitor in the way "beat Revavest" implies — it's an investment marketplace: vetted deals, a property marketplace, an education hub (books/courses/webinars), an affiliate/associate referral program, and a portfolio dashboard. No disclosed data sources, no disclosed pricing, no visible search/filter depth. It's optimized for guiding a novice investor into a curated deal, not for open self-serve property search.

**Implication for scope:** "beating" Revavest isn't a data-completeness fight — Griffin's edge is the DSCR-first search-to-finance path (search a real inventory of properties, get an instant DSCR, get financed by Griffin), something Revavest doesn't appear to do at all. Don't over-invest in matching Revavest's education/affiliate layer; win on the thing Revavest is weakest at: real, searchable inventory tied directly to a financeable ratio.

## 2. Locked constraints from the 2026-09-29 meeting (don't relitigate)

- Simplified DSCR-only search, not the old cap rate/NOI/cash-flow version.
- Inputs: home price, HouseCanary rent estimate, 20% down assumption, BankingBridge DSCR rate.
- Single DSCR ratio output, with toggles for interest-only, 40-year term, or higher down payment to hit 1.0, plus an inverse search mode (show properties already at 1.0, with required down payment shown per property).
- Constellation quoted at ~$50K/year for all 50 states; Bill's fallback is a CA-only or CA/TX/FL pilot at roughly $1K/month.
- Constellation has no photos — known leakage risk (users bounce to Zillow/Redfin/Rocket, which have in-house mortgage arms). Bill accepts this risk for the SEO/lead-flow upside, but it's a real number to quantify once there's traffic.
- Chris's assignment: dig back into free/public real estate data sources from a pre-Griffin side project to cut or avoid the Constellation spend before Bill signs anything.
- Completion is tied to a one-time quarterly bonus Bill will discuss with Chloe.

## 3. Data requirements — what the product actually needs, broken into layers

Scope each layer separately because free/public sources cover some far better than others. Evaluate every candidate source against: coverage (which states/counties), refresh cadence, licensing terms (can this be shown to consumers / used commercially, or research-only), and format (bulk file, API, scrape-only).

**a. Active listing inventory (address, price, beds/baths, sqft, status, days on market)**
This is the layer Constellation is priced for. Free/public alternatives to evaluate:
- County assessor / property tax roll data (public record in most states, but not listing status — gives ownership, last sale price, assessed value, not "for sale" status)
- IDX/MLS feeds via a local MLS or a broker-of-record relationship (requires a licensed brokerage relationship in each state, not free but far cheaper than Constellation and includes photos, which Constellation lacks)
- Realtor.com / Redfin / Zillow public APIs or data feeds (mostly deprecated or heavily restricted for commercial redistribution — check current ToS before any coverage assumption; this is the fastest thing to be wrong about since these platforms tighten access frequently)
- State/county open-data portals (varies wildly by state; some counties publish parcel-level data with regular updates, others don't)
**Action:** Pull whatever the pre-Griffin side project already sourced first, then re-verify each source is still live and its license terms haven't changed since that project.

**b. Rent estimates**
Locked as HouseCanary per the meeting — not being replaced, but worth checking whether a free/cheaper rent-estimate source (Rentometer's public tier, HUD Fair Market Rent data, Census ACS gross rent data) could serve as a fallback or a cross-check for confidence scoring, especially in a CA/TX/FL pilot.

**c. Financing rate**
Locked as BankingBridge DSCR rate — no change needed here.

**d. Photos**
Not currently sourced anywhere (the Constellation gap). Evaluate: does a broker-of-record IDX relationship solve this by default (IDX feeds typically include photos with usage restrictions), or does photo licensing need to be solved separately (e.g., a Street View/parcel-photo fallback for listings without agent photos)? This is the single highest-leverage question, since photo absence is the named leakage risk to Zillow/Redfin.

**e. Property tax / ownership / sale history**
Broadly available free via county assessor records; useful for the inverse-search mode (properties not currently "for sale" but where an investor could still calculate a hypothetical DSCR) and for portfolio/comps context. Lower priority than active listings.

## 4. Cost model to build for Bill

Bill needs a real number, not a directional one, before signing anything. Build a simple comparison table across at least three paths:
1. Constellation CA-only or CA/TX/FL pilot (~$1K/month per Bill's fallback ask) — baseline.
2. Free/public sources only, no listing photos, county-record-based (near-zero direct data cost, but likely misses "active for sale" status entirely — clarify whether the product can work with sale-history/ownership data alone or whether active listing status is non-negotiable for the MVP).
3. Blended: free/public data for tax/ownership/comps + a broker-of-record IDX relationship for active listings + photos in the pilot states.

For each path, name: monthly/annual cost, state coverage, refresh cadence, whether photos are included, and licensing risk (redistribution restrictions, consumer-facing display restrictions).

## 5. What "beats Revavest" actually requires, beyond data

- **Instant, correct DSCR math** on every listing, not a manual calculator — this is the core differentiator and the thing Revavest doesn't do.
- **A working financing path**, not just search: results should route directly into a Griffin pre-qual or LO conversation, closing the loop Revavest can't (Revavest is an investment marketplace, not a lender).
- **Inverse search** (properties already at 1.0 DSCR) is a real differentiator worth prioritizing early, since it answers the investor's actual question ("show me what already works") instead of making them guess-and-check.
- **Photos are a trust signal, not a nice-to-have** — a listing with no photo reads as low-trust/spam to a consumer used to Zillow-grade presentation. Solve this before public launch, not after.
- Do **not** copy Revavest's education hub, affiliate/associate program, or vetted-deals marketplace framing unless Bill separately decides Griffin wants to be in that business — it's a different product thesis (curated investment marketplace vs. open self-serve search-to-finance tool) and bolting it on dilutes the DSCR-first positioning that's the actual edge here.

## 6. Open questions to resolve before this goes back to Bill

- Does the MVP need active "for sale" status, or can a first pilot ship on ownership/tax-roll data plus the inverse-search mode (which doesn't strictly require "for sale" status to be useful for the DSCR-math demonstration)?
- Is a broker-of-record / IDX relationship worth pursuing in the CA/TX/FL pilot states specifically to solve the photo gap, and what does that cost/require (state licensing, MLS fees) versus Constellation?
- What's the actual redistribution/display license risk on each free/public source being considered — this needs a real answer, not an assumption, before anything ships to consumers.
- Does Bill want a cost-comparison memo only, or a working pilot-scope prototype using free sources for CA before the Constellation conversation with the vendor happens?

## 7. Next step

Turn section 3 and 4 into an actual side-by-side source audit (one row per candidate source: coverage, cost, license, photo availability, refresh cadence) before presenting anything to Bill — this doc is the scope, not the audit itself.
