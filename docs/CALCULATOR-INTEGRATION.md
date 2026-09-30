# RatioRadar calculator integration

## Sources and scope

The user-supplied `OG_Updated.zip` contains the editable DSCR engine and its regression suite. `deploy-6a8366d2148c39351ab94cb1.zip` contains the cash-flow UI bundle. The engine at `src/lib/calculators/vendor/nonqm-engine.js` and `source-regression.mjs` are preserved verbatim from OG_Updated. The DSCR and investor cash-flow functions are integrated through typed, validated adapters; bank statement, asset depletion and other unrelated exports are not surfaced.

The source UI was rebuilt as accessible React controls using the site's design. Purchase, cash-out refinance, long-term rent, annual short-term rental revenue, amortizing and interest-only payments are supported. The separate cash-flow page covers vacancy, operating expenses, NOI, annual/monthly cash flow, cap rate and cash-on-cash return.

20% STR income reduction and 80% refinance LTV are explicitly editable modeling defaults from the archive, not lender requirements. No investor qualification rules are asserted. IO estimates describe only the interest-only period. Buying power estimates loan principal and does not enforce investor/LTV limits. Zero denominators return “Not defined”; negative NOI and cash flow remain negative.

## Scenario handoff and privacy

Property details can explicitly hand off to DSCR. Only modeled property/financing values are passed, with HOA and flood left unknown. DSCR can hand off to cash flow, leaving vacancy and operating costs blank for user confirmation. Carried invested cash starts with down payment only and the UI tells users to include closing costs and improvements. Refinance invested cash remains blank.

Numeric inputs are not sent to an API or to the external Griffin quick-quote URL. Handoffs use one-time, versioned, allowlisted session storage expiring after 20 minutes. Page URLs contain no calculator balances or rental income. Existing explorer campaign tracking remains unchanged; this change does not claim LOS or funded-loan attribution. Calculator usage is not a measure of productivity or cycle-time improvement without a separate attribution connection.

## Shared identity and footer

The supplied transparent wings file is used intact in the header, footer, favicon and social metadata. The wordmark uses black GRIFFIN FUNDING and red ratioradar beneath it. The supplied footer skyline is displayed through a CSS viewport; the placeholder text is outside the visible area. All actual footer text and links are HTML. No fabricated service-health claim is shown.

Contact and legal information was checked against these official pages on September 29, 2026:
- https://griffinfunding.com/contact-us/ — Non-QM phone, corporate address, and four listed office locations.
- https://griffinfunding.com/state-licensing/ — company NMLS 1120111.
- https://griffinfunding.com/privacy-policy/
- https://griffinfunding.com/terms-of-use/
- https://griffinfunding.com/cookie-policy/
- https://griffinfunding.com/full-page-form-quick-quote/

## Boundaries

The property explorer remains a clearly labeled demo with fictional listings, sample rents/rates and illustrative photography. Its simplified ratio excludes HOA/flood and operating costs; the detailed calculator requests them. No live listing, rate, underwriting, LOS, CRM or production lead integration was added. Estimates require human review and are not loan offers or credit decisions.

## Verification

Run `npm run check`, `node src/lib/calculators/vendor/source-regression.mjs`, and `npm run test:e2e` against a running production build on port 3123. Browser coverage includes purchase/STR/IO/refinance, percentage display units, negative results, zero denominators, handoffs, navigation, existing property functionality, accessibility and widths 320/390/768/1440.
