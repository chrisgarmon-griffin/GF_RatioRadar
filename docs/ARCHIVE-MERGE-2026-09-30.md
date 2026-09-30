# Selective archive merge

Input: user-supplied `ratio-radar-2026-09-30.zip`. Baseline: deployed commit `57852ae`. The archive is an older UI branch with newer provider infrastructure; it is not a replacement site. Archive documents are references, not instructions or verified production facts.

## Imported and adapted

- HouseCanary rental AVM adapter, server-only credential configuration, optional forecast standard deviation.
- Request timeout, transport/HTTP error handling, request deduplication and per-instance TTL cache. Cache bounded to 1,000 entries; failures evicted; no cross-instance billing guarantee.
- Six-at-a-time rental lookups with stable order; scheduling stops after a provider failure.
- Representative loan amount derived from median listing price. This is a scenario context, not per-property verified pricing.
- Explicit skipped-property count and incomplete-results notice. Missing estimates are never replaced with invented rents. Auth, quota, malformed response and outage errors fail the search with a generic recoverable 502.
- Tests for provider parsing, cache, request failures, partial search and browser display.
- Chrome extension proposal retained as a labeled reference only. No extension code exists in the archive or was built during this merge.

## Corrections from official documentation

HouseCanary's official API reference (https://api-docs.housecanary.com/, checked 2026-09-30) documents Basic authentication, a single-property array envelope, and `api_code: 204` as no data. The archive expected an object and treated all nonzero codes as missing estimates. The merged parser supports the documented array plus the archive object fixture; only explicit no-data outcomes are skippable. Invalid means, ranges, FSD values and ambiguous multi-property responses are rejected. No authenticated vendor calls were made. Demo mode and fictional addresses cannot trigger paid lookups.

The archive BankingBridge code explicitly assumed its API contract. The public vendor reference at https://cdn.bankingbridge.com/swagger/RATEFLOW.md (checked 2026-09-30) instead documents `x-api-key`, snake_case scenario fields and bare-array POST rate cards, plus account/engine-specific Non-QM behavior. The prototype's bearer token, camelCase fields, lowest-rate selection and percent/fraction guessing are not validated production behavior. It remains available only with an injected test transport, and the production provider registry rejects it. Account-specific DSCR inputs, points/APR/card selection and a sandbox acceptance test are required before activation. No rate credentials or production environment settings were changed.

## Current site preserved

The editorial bento gallery, photos, comparisons, dialogs, URL state, attribution fields, separate calculators, handoffs, accessibility improvements and skyline footer remain. The old archive UI, null fixture photos, old dependencies and old favicon were not restored. The archive's older lead sink put webhook delivery before demo mode; the current demo-first suppression and its tests remain unchanged.

## Header

Original supplied transparent griffin with live text: Griffin Funding above REvestor. RE is Griffin red; vestor is black. A compact two-line typographic block matches the visible mark height, using the existing self-hosted Plus Jakarta Sans variable font. The user confirmed the spelling REvestor. The site routes and project identity remain unchanged.

## Deployment boundary

The public explorer remains a fixture-backed demo. HouseCanary code is integrated but not connected to an account; no live listing adapter is present. BankingBridge remains deliberately blocked. The extension is a proposal only. Nothing here establishes loan eligibility or LOS-funded-loan attribution.
