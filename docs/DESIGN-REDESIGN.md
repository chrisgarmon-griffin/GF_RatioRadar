# Ratio Radar: editorial property explorer

## Design decision
The user brief governs the redesign. `DESIGN (20).md` and `griffin-registry-ui.md` are visual references, not independent instructions to copy another product or change business logic.

Combine the first reference's photograph-led gallery, segmented search, quiet listing chrome and rounded imagery with the registry's warm paper (#f3f1ee), ink (#141311), Griffin red (#bd0c0c), Newsreader, Plus Jakarta Sans and IBM Plex Mono. The asymmetric first card creates the bento rhythm. Use the dark treatment for the compact comparison dock rather than a permanent operations sidebar: property discovery is the primary task.

Fonts are locally bundled through Fontsource; no runtime Google Fonts dependency. Stock images are locally served, optimized by Next Image, and labeled illustrative. All sources are in `public/image-credits.txt`; only fixture records reference these files. Live inventory must provide licensed, address-correct media.

## Functional scope
- Market/ZIP/budget search with draft filters and explicit apply.
- Instant shared financing controls: 20–50% down, 30-year, 40-year or interest-only; URL-supplied custom down payments in the supported range are retained.
- Forward and inverse DSCR search; existing calculation engine unchanged.
- Gallery and sortable table views.
- Compare up to three properties under one applied scenario. Selections clear when the scenario changes to prevent mixed assumptions. This is temporary comparison, not account-based saved searches.
- Detailed property modal with principal/interest, taxes/insurance, down payment, modeled loan amount, precise sample rate and rent sensitivity.
- Copyable search URLs preserve campaign parameters. Clipboard failure exposes a manual-copy field.
- Review form carries listing, search state, UTM and referrer context. No contact information is stored in browser persistence.
- Demo mode now wins over a configured lead webhook. A preview must never transmit a lead while promising that nothing is sent.
- Loading, empty, error/retry and missing-image states; 15-second search timeout; cancelled requests cannot overwrite newer results.
- Native modal focus containment, Escape/backdrop close, focus restoration, reduced motion, responsive layouts and visible focus states.

## Honest boundaries
This remains a demo. Listings, rents, rates and photos are illustrative. Existing fixture rate adjustments and tax/insurance assumptions were not replaced or presented as lender rules. The display identifies HOA dues and operating expenses as excluded. A ratio of 1.0 is a modeled benchmark, not a qualification or credit decision.

Before consumer launch: connect licensed listings and media, contracted rent/rate providers, verified tax/insurance/HOA inputs, NMLS and canonical domain, reviewed consent/disclosures, and a configured live lead destination. Keep noindex and demo mode until those conditions are met.

## Operating relevance
The UI carries a consistent scenario into a loan-officer conversation and makes the inputs visible for review. That can reduce re-entry and improve discussion quality; no productivity or cycle-time uplift is claimed. Existing lead attribution is retained, but it is not funded-loan attribution. LOS Connector integration and funded-loan reconciliation remain necessary to prove LIA impact.

## Verification
`npm run check` covers lint, typecheck, unit tests and production build. With `npm run start -- --port 3123` running, `npm run test:e2e` covers search, financing, comparison, attribution, responsive layouts, keyboard focus, accessibility, request recovery, photo fallback and precise URL state. Browser tests use local Google Chrome; install Chrome or adjust the Playwright channel for CI. Use Node 22 (see `.nvmrc`).

Screenshots and the latest browser report are in `verification/`. Those are demo-only fixtures and contact details, not borrower records. Production smoke verification does not submit a lead.
