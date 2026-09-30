# Ratio Radar

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
- `src/lib/providers/`: Listings, Rent, Rate interfaces. Fixture (sample) implementations only. Live Constellation, HouseCanary, and BankingBridge adapters plug in here; selecting one today throws rather than serving fake data silently.
- `src/lib/search.ts` and `POST /api/search`: forward mode (ratio per listing) and inverse mode (listings that reach 1.0 within the down payment the buyer will bring, sorted by lowest down).
- `src/app/page.tsx`: search UI with the toggles.

## Assumptions to confirm

- DSCR = rent / PITIA. Tax 1.10% and insurance 0.45% of price are placeholders, not sourced.
- 20% minimum down, 50% cap before a deal reads "unreachable".
- 40-year and interest-only are mutually exclusive in the UI (IO is priced on interest alone).
- Fixture rate adjusters (+0.25% IO, +0.125% 40-year, -0.125% at 25%+ down) are invented until BankingBridge is wired.

## Product identity

Ratio Radar is the next version of Revestor (revestor.com), acquired by Griffin in December 2025. Scope: [docs/SCOPING.md](docs/SCOPING.md).
