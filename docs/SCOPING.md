# Ratio Radar: Scoping

Version 2, 2026-09-30. Supersedes the first scoping draft. Data source detail lives in [DATA_SOURCE_AUDIT.md](DATA_SOURCE_AUDIT.md).

## 1. What we are building

Ratio Radar is a DSCR-first investment property search for Griffin Funding. It is the next version of Revestor (revestor.com), whose assets Griffin acquired in December 2025. Revestor.com now forwards to Griffin's DSCR page.

An investor searches homes for sale, sees one DSCR ratio per property, changes loan options to reach 1.0, and moves straight into a Griffin pre-qualification. Search, qualify and close in one place.

**Why it matters**
- DSCR lead flow. Bill expects more DSCR volume than bank statement volume going into Q4. DSCR loan amounts average about half a bank statement loan, so Griffin needs roughly twice the file count.
- SEO. A DSCR search experience can win rankings for DSCR terms. The Revestor domain already draws thousands of visits a year with no upkeep.
- Press. A DSCR search tool from a DSCR lender is a story.

**What Revestor did before, and what we drop.** The old Revestor showed cap rate, cash flow and NOI. Ratio Radar does not. No expense modeling. One number: DSCR.

## 2. Locked decisions (2026-09-29 meeting with Bill)

- Inputs per property: list price, HouseCanary rent estimate, 20% down assumed, a BankingBridge DSCR rate.
- Output: a single DSCR ratio.
- Toggles: interest-only, 40-year term, or higher down payment, to reach 1.0.
- Inverse search: show properties that already reach 1.0 and what down payment each one needs (for example 20%, 30% or 40%).
- Listings must be legally sourced. If they cannot be, fall back to a Constellation deal, limited to CA or CA/TX/FL, at about $1K a month. Full 50 states is about $50K a year.
- Known risk: a data-only feed shows no photos, so users may click through to Zillow or Redfin and land with their mortgage arms. Bill accepts the risk for the SEO and lead upside. Measure it once traffic exists.
- Bill's ask of Chris: determine whether listing data can be pulled legally without the $50K contract, and report back.

## 3. Scope

### In the MVP
1. Search by state, ZIP and price range across active listings.
2. DSCR per listing at 20% down, with the three toggles.
3. Inverse mode with required down payment per property.
4. Rent range (low, mid, high) from HouseCanary shown as a DSCR range.
5. Route to a Griffin pre-qualification from every result.
6. Compliant disclosures: estimate only, not a loan offer or credit decision.

### Not in the MVP
- Cap rate, NOI, cash flow, expense modeling.
- Accounts, saved searches, portfolio tracking.
- Nationwide coverage. Start with California, then TX and FL.
- Buyer-agent or brokerage features.

## 4. Status

MVP website built and pushed on branch `claude/focused-albattani-tjpabu`. It runs on fictional sample listings.

Built:
- Search by state (CA, TX, FL), ZIP, price range and down payment (20% to 50%).
- Forward mode: DSCR per listing, with a low-to-high DSCR range from the rent range.
- Inverse mode ("Find 1.0 deals"): listings that reach 1.0 within the buyer's down payment cap, sorted by lowest down payment.
- Interest-only and 40-year toggles (mutually exclusive), required down payment per property.
- Lead capture: "check my loan options" opens a form with consent language, honeypot, and attribution (listing, full search state, UTM, referrer). Leads write to `.data/leads.jsonl` for now.
- Check-an-address tool: type an address, ZIP and price and get the DSCR with live HouseCanary rent. Needs no listing feed (`LOOKUP_RENT_PROVIDER=housecanary`).
- Shareable search URLs, FAQ with structured data, robots.txt, sitemap, disclosures footer.
- Griffin Track A styling. Checked in a browser at desktop and phone width with no console errors.
- 20 automated tests (DSCR engine, search, lead validation).

Before launch:
- Real listings (section 5). Sample data is fictional.
- BankingBridge rate (currently a fixed sample rate with invented adjusters) and HouseCanary rent (currently fixture).
- Tax 1.10% and insurance 0.45% of price are placeholders.
- NMLS number in the footer (`NEXT_PUBLIC_NMLS`). Required on a mortgage lender site, not set.
- Compliance review of the consent text and disclosures. Both are drafts.
- Conta fonts. The font files were not available, so the site uses the fallback stack. Add the font-face block from the Griffin brand build.
- HouseCanary attribution. Their terms require a link to HouseCanary.com wherever its data is shown publicly. The official attribution snippet from the account's API Keys page renders whenever rents come from HouseCanary (`HouseCanaryAttribution.tsx`).
- Lead handoff to the LOS or CRM. Replace `saveLead` in `src/lib/leads.ts`.
- Application URL (`NEXT_PUBLIC_PREQUAL_URL`) shown after a lead is sent.

## 5. The gating question: listing rights

Price is secondary. Listing access is licensed MLS by MLS, and eligibility depends on who Griffin is.

- Zillow, Redfin and Realtor.com cannot be scraped. Their terms prohibit it, and Zillow's API is limited to MLS members and licensed brokers.
- MLS vendor access is generally for member-facing products. Public consumer display normally runs through IDX with a participating broker.
- Griffin's own December 2025 announcement says the Revestor search runs on MLS data feeds. That existing arrangement may already answer the question.
- Constellation's API documents a `Media` (photo) resource. Whether photos are in the quote, and licensed for this use, is unconfirmed.

Three answers unlock the build:

| # | Question | Who |
|---|---|---|
| 1 | What feed and license power the current Revestor search on GriffinFunding.com? | Bill, Revestor tech transfer |
| 2 | Can Griffin, as a lender, display listings publicly in CA, TX and FL, and under what arrangement? | Constellation, counsel |
| 3 | Are photos included, and under which MLS terms? | Constellation |

## 6. Data layers

| Layer | Source | Status |
|---|---|---|
| Active listings | Existing Revestor feed, or Constellation / IDX | Blocked on section 5 |
| Photos | Listing media if licensed, else Street View live render as fallback | Blocked on section 5 |
| Rent | HouseCanary (locked); HUD and Census as cross-check | Adapter built and confirmed with a HouseCanary test key (2026-10-01). Production key and Premium price still to confirm |
| Rate | BankingBridge (locked) | Adapter seam built, contract assumed. Needs BankingBridge docs and a sandbox key |
| Tax and insurance | Census county tax data replaces the 1.10% placeholder | To build |

Free and public data cannot supply "for sale" status, so it cannot carry the MVP alone. It reduces the paid bill and feeds SEO pages. Full source table, costs and confidence labels are in the audit.

### Fallback if listing rights fail

A Chrome extension that overlays DSCR on Zillow and Redfin pages avoids the listing feed and the photo gap, but gives up SEO and inverse search, and carries terms-of-service and Chrome Web Store policy risk. Analysis in [CHROME_EXTENSION_OPTION.md](CHROME_EXTENSION_OPTION.md).

## 7. Cost paths

| Path | Data cost | Active listings | Photos | Risk |
|---|---|---|---|---|
| Reuse existing Revestor feed | Sunk, to verify | Yes | Unknown | Lowest, if scope covers a public DSCR search |
| Constellation pilot, CA or CA/TX/FL | About $1K a month | Yes | Depends on media entitlement | Medium until MLS eligibility is confirmed |
| Constellation, 50 states | About $50K a year | Yes | Depends | Same, at scale |
| Free and public only | About $0 | No | No | Low, but the product loses its purpose |
| Blended: free data for context, licensed feed for listings | Constellation cost plus any IDX fees | Yes | If terms allow | Lowest once an IDX participant is in place |

Constellation figures are Bill's from the meeting. Confirm them in a written quote.

## 8. What makes it better than a calculator

- DSCR computed instantly on every listing, not entered by hand.
- A financing path built in: every result goes to a Griffin pre-qual or loan officer.
- Inverse search answers the investor's real question: show me what already works.
- Photos are a trust signal. A listing with no photo reads as low trust. Solve before public launch.

## 9. Open questions

1. Feed and license behind the live Revestor search (section 5, question 1).
2. Public display rights for a lender in CA, TX and FL.
3. Photo entitlement and terms.
4. Canonical URL: revestor.com (existing traffic, currently forwarding) or a path on griffinfunding.com. Decide before build, because it fixes the SEO home.
5. BankingBridge response: rate by scenario for interest-only, 40-year and down payment tiers.
6. HouseCanary contract: is the rent endpoint included, and at what per-call price? The range bounds are the useful field.
7. Tax and insurance method: does Griffin underwriting use purchase price rates or actual tax bills? This sets the DSCR method.
8. Should the MVP ship as a memo and private prototype first, or as a public pilot? Bill has not said.

## 10. Next steps

1. Send section 5 questions to Bill and Constellation.
2. Build the HouseCanary and BankingBridge adapters behind the existing interfaces.
3. Replace the tax placeholder with county data, and add a rent cross-check.
4. Hold any listing adapter until the license answers land.
