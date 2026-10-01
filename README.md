# Ratio Radar

DSCR-first property exploration and investment calculators for Griffin Funding. Current property inventory is illustrative. Calculator estimates support a human financing review.
Scope and locked decisions: [docs/SCOPING.md](docs/SCOPING.md). Source audit: [docs/DATA_SOURCE_AUDIT.md](docs/DATA_SOURCE_AUDIT.md).

## Run

```
npm install
npm run dev        # http://localhost:3000
npm test           # DSCR engine tests
npm run typecheck
```

## What exists

- `src/lib/dscr.ts`: pure DSCR math. Ratio, interest-only, 40-year, and closed-form required down payment to hit 1.0.
- `src/lib/providers/`: Listings, Rent, Rate interfaces. Fixture implementations plus a HouseCanary adapter with documented response validation, bounded caching and typed errors. Live listings are not implemented; BankingBridge remains a test-only prototype. Demo mode prevents live rent lookup.
- `src/lib/search.ts` and `POST /api/search`: forward mode (ratio per listing) and inverse mode (listings that reach 1.0 within the down payment the buyer will bring, sorted by lowest down).
- `src/app/page.tsx` and `src/components/`: landing page, search, listing cards, lead dialog.
- `src/lib/leads.ts` and `POST /api/leads`: lead capture with consent and attribution. Demo mode stores nothing; live mode uses a configured webhook, or a local development file. Vercel live mode without a webhook fails rather than losing leads.

## Assumptions to confirm

- DSCR = rent / PITIA, including supplied monthly HOA. State investment-property estimates: CA 0.70%, TX 1.90%, FL 1.02%; insurance 0.30% annually. Unknown HOA is flagged and modeled at $0.
- 20% down by default. Reverse solver can report required down above 50%; this is mathematical feasibility, not loan eligibility.
- 40-year and interest-only are mutually exclusive in the UI (IO is priced on interest alone).
- Fixed 7.99% example rate until BankingBridge is verified. Reverse rate is a mathematical target, not available pricing or a buydown-cost quote. See docs/dscr-mvp.md.

## Product identity

Ratio Radar is the next version of Revestor (revestor.com), acquired by Griffin in December 2025. Scope: [docs/SCOPING.md](docs/SCOPING.md).

## Deployment

Vercel project `ratio-radar` in the Griffin Funding team is connected to this repo. Production is deployed from `main` at https://ratio-radar.vercel.app. Feature branches receive preview deployments. Authentication and environment configuration are managed in Vercel and must be verified live before public release.

Demo mode is on by default (`NEXT_PUBLIC_DEMO_MODE`): noindex, explicit sample-data disclosures, and form validation without storage or webhook delivery. A configured webhook cannot override demo mode. Public launch still requires licensed live data, reviewed disclosures, a durable lead destination, NMLS and canonical-domain configuration.

## Redesign and verification

The property explorer combines an image-led bento gallery with Griffin's warm-paper/red editorial UI. It adds property comparison, detailed scenario breakdowns, table view, sorting, shareable filters, resilient loading/error states and mobile/keyboard support. See [design decisions and boundaries](docs/DESIGN-REDESIGN.md).

Use Node 22 (`.nvmrc`):

```sh
npm ci
npm run check
npm run start -- --port 3123
# In another terminal; local Chrome required:
npm run test:e2e
```

Evidence: [verification/README.md](verification/README.md). Live providers and LOS Connector funded-loan attribution remain outside this UI release.

## Separate calculator pages

Next.js remains the application framework. Routes: `/`, `/calculators`, `/calculators/dscr`, `/calculators/cash-flow`, `/how-it-works`, `/dscr-guide`.

The supplied Griffin wings logo and the requested black/red wordmark appear in the shared header and skyline footer. DSCR supports purchase/refinance, long-term/short-term rent, amortizing/interest-only payments and inverse loan buying power. Cash flow covers operating costs, NOI, cap rate and cash-on-cash return. Explicit browser-local handoffs connect properties to financing and financing to operations.

Source provenance, assumptions, privacy and verified footer references: [calculator integration](docs/CALCULATOR-INTEGRATION.md). The original imported regression suite runs with `node src/lib/calculators/vendor/source-regression.mjs`.

## September 30 selective archive merge

The newer provider infrastructure from the Claude project archive is integrated without restoring its old UI or lead behavior. Partial rent coverage is visible in search results; provider failures return a recoverable error. The header now uses the original griffin with live Griffin Funding / REvestor typography. See [merge decisions and integration boundaries](docs/ARCHIVE-MERGE-2026-09-30.md). The [Chrome extension proposal](docs/CHROME_EXTENSION_OPTION.md) is reference material, not a delivered feature.
