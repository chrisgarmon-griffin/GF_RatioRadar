# Revestor

DSCR-first property search for Griffin Funding: search inventory, see an instant DSCR, route into a Griffin pre-qual.
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
- `src/lib/providers/`: Listings, Rent, Rate interfaces. Fixture (sample) implementations by default. `RENT_PROVIDER=housecanary` uses the HouseCanary rental AVM (range, 24-hour cache, concurrency-limited). `RENT_PROVIDER=rentcast` uses the RentCast rent AVM (range, 24-hour cache, single-family, condo and townhome only). `RATE_PROVIDER=bankingbridge` uses a BankingBridge adapter whose request and response shapes are assumed until we have their docs. Live providers never fall back to fixtures. No listing adapter yet.
- `src/lib/search.ts` and `POST /api/search`: forward mode (ratio per listing) and inverse mode (listings that reach 1.0 within the down payment the buyer will bring, sorted by lowest down).
- `src/app/page.tsx` and `src/components/`: landing page, search, listing cards, lead dialog.
- `src/lib/leads.ts` and `POST /api/leads`: lead capture with consent and attribution. Writes `.data/leads.jsonl` until a CRM handoff exists.

## Assumptions to confirm

- DSCR = rent / PITIA. Tax 1.10% and insurance 0.45% of price are placeholders, not sourced.
- 20% minimum down, 50% cap before a deal reads "unreachable".
- 40-year and interest-only are mutually exclusive in the UI (IO is priced on interest alone).
- Fixture rate adjusters (+0.25% IO, +0.125% 40-year, -0.125% at 25%+ down) are invented until BankingBridge is wired.

## Product identity

Revestor (revestor.com) is the relaunch of the original Revestor, acquired by Griffin in December 2025. Scope: [docs/SCOPING.md](docs/SCOPING.md).

## Deployment

Vercel project `ratio-radar` (Griffin Funding team), linked to this repo. The current deployment builds the `claude/focused-albattani-tjpabu` branch and is served at https://ratio-radar.vercel.app behind Vercel Authentication (team members only). The `main` branch is still the empty initial commit, so nothing deploys from it yet.

Demo mode is on by default (`NEXT_PUBLIC_DEMO_MODE`): the site is `noindex`, shows a sample-data banner, and validates lead forms without storing them. Before a public launch: set `NEXT_PUBLIC_DEMO_MODE=false`, `LEAD_WEBHOOK_URL`, `NEXT_PUBLIC_NMLS` and `NEXT_PUBLIC_SITE_URL`, wire real listings, and merge to `main`.
