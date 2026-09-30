# RatioRadar redesign and calculator verification

## Acceptance result
- `npm run lint`: passed, no warnings.
- `npm run typecheck`: passed.
- `npm test`: 64 tests passed, including URL state and demo-webhook suppression.
- `npm run build`: passed with Node 22, Next.js 16.3.7.
- `npm run test:e2e`: 30 tests passed against the production build in Chrome.
- axe WCAG 2 A/AA and 2.1 AA checks: no violations in tested desktop/mobile galleries, dialogs and calculator layouts. This is automated coverage, not a complete accessibility certification.
- 320, 390, 768 and 1440px layouts checked. No page horizontal overflow; wide comparison tables scroll within their region.
- No browser page errors in the gallery test. Images decode correctly and failure fallback works.
- Visual review completed for desktop, gallery, comparison, scenario and mobile screenshots.
- Final source review: scenario/lead use the applied response parameters; new requests hide stale actions and abort older requests; sample rate precision is retained; tax/insurance display matches engine constants; demo mode bypasses webhook delivery; URL campaign fields survive; no user contact data enters client storage.
- `git diff --check`: passed.

## Evidence
- `checks.log`: full lint, TypeScript, unit and build output.
- `browser-results.json`: complete Playwright run.
- `desktop-viewport.png`, `desktop-1440.png`: desktop overview/full page.
- `gallery-detail.png`: property gallery.
- `scenario-desktop.png`, `comparison-desktop.png`: core decision-support interactions.
- `responsive-320.png`, `responsive-390.png`, `responsive-768.png`: full responsive pages.
- `mobile-viewport-320.png`, `mobile-viewport-390.png`, `mobile-viewport-768.png`: top-of-page captures.
- `baseline-desktop.png`: original production interface before redesign.

## Known gaps
Live listing/media rights and adapters, live rent/rate feeds, sourced tax/insurance/HOA data, reviewed mortgage disclosures/consent, canonical-domain configuration and funded-loan LOS attribution are not delivered by this UI change. Current data and photo labels remain demo-only. Tests use synthetic contact details against the local demo; no production lead was submitted.

Vercel build/alias verification and production read-only smoke results are reported separately in the task delivery.

## Calculator release

- Original archive engine regression suite passed; imported engine and source logo SHA-256 match their supplied originals.
- Financing verified against an independent amortization result: $300,000 at 7% over 30 years = $1,995.9074855 P&I. Full modeled housing cost including $367 tax, $167 insurance and $120 HOA = $2,649.9074855.
- Purchase, STR adjustment including 0%, IO, zero-rate behavior, refinance cap and closing shortfall, negative NOI/returns, undefined ratios and required input validation covered.
- Percentage display conversion tested in-browser (80.00% LTV; 5.99% cap rate; -1.87% cash-on-cash for sample).
- One-time handoff, expiration, field allowlist and blocked storage covered. No raw calculator inputs are sent to the external contact link.
- Source review completed across adapter, handoff, calculator, shared shell and property handoff. No new backend writes, external calculator scripts or guideline assumptions disguised as requirements.
- `calculator-{320,390,768,1440}.png` and `footer-{320,390,768,1440}.png` capture the added interfaces. Full-page captures may omit offscreen lazy images; footer-specific captures show the loaded skyline. Desktop and mobile footer images visually reviewed.
- Two initial contrast failures were corrected; the final suite reports zero violations in tested states.

## Selective archive merge verification

- Imported archive reviewed against deployed baseline `57852ae`; merge decisions in `docs/ARCHIVE-MERGE-2026-09-30.md`.
- `archive-merge-checks.log`: lint, TypeScript, 64 unit tests and production build passed.
- Browser suite: 25 passed, including incomplete results, missing-rent empty state and live-text REvestor header at 320/390/768/1440 widths.
- Original griffin and two-line lettering visually reviewed on desktop/mobile. `revestor-brand-*.png` contains exact captures.
- Independent source review confirmed existing calculator math, fixture photos, demo-first lead suppression and attribution paths were unchanged. Live provider configuration was not changed. Tests use injected transports; no paid vendor calls were made.
- Known gaps: HouseCanary needs licensed listing inputs and authenticated account acceptance. BankingBridge prototype cannot make live requests and is rejected by the production registry. Chrome extension document is reference only.

## Interactive resource UI

- Scoped visual redesign across the calculator hub, DSCR, cash flow, How It Works and DSCR Guide.
- Walkthrough controls, slider arithmetic/reset, native topic expansion, keyboard operation and reduced-motion behavior tested.
- No page overflow at 320px; desktop/mobile resource and calculator layouts visually reviewed.
- Calculator model and backend behavior unchanged; 64 unit tests retained.
- Wordmark labels now derive from visible text, with a hidden home suffix, after Lighthouse's detailed label-content audit. The responsive branding test was rerun after this final adjustment.
- See `docs/RESOURCE-UI.md` and `resource-accessibility.json` for adaptations and audit evidence.
