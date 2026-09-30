# Redesign verification

## Acceptance result
- `npm run lint`: passed, no warnings.
- `npm run typecheck`: passed.
- `npm test`: 26 tests passed, including URL state and demo-webhook suppression.
- `npm run build`: passed with Node 22, Next.js 16.3.7.
- `npm run test:e2e`: 14 tests passed against the production build in Chrome.
- axe WCAG 2 A/AA and 2.1 AA checks: no violations in tested desktop gallery, mobile gallery and dialog flows. This is automated coverage, not a complete accessibility certification.
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
Live listing/media rights and adapters, live rent/rate feeds, sourced tax/insurance/HOA data, reviewed mortgage disclosures/consent, launch NMLS/domain configuration and funded-loan LOS attribution are not delivered by this UI change. Current data and photo labels remain demo-only. Tests use synthetic contact details against the local demo; no production lead was submitted.

Vercel build/alias verification and production read-only smoke results are reported separately in the task delivery.
