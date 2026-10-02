# Griffin Rental Property Analyzer: Enriched Build Brief

Prepared 2026-10-02 from the handoff "Griffin Rental Property Deal Analyzer — Claude Context Enrichment Handoff" (same date). Status: implementation brief. Nothing in it is built, deployed or approved by this document.

**Access statement.** Claude read this repository (`chrisgarmon-griffin/GF_RatioRadar`, `main` at `30f9ee6`) and its `docs/`. Claude did not read Chris's Claude memory, other Claude conversations, ChatGPT history, Slack, email, Vercel runtime state or vendor accounts. Claims sourced from those places stay labeled HISTORICAL—RECONFIRM or [NEEDS VERIFICATION].

**Labels.** CONFIRMED (source/date) · HISTORICAL—RECONFIRM · PROPOSED · [NEEDS VERIFICATION].

---

## 1. Executive decision

**Reshape.** Do not build a new analyzer. Ratio Radar already is that product: the REvestor successor with a tested DSCR engine, cash-flow calculator, scenario handoff and lead capture. Build the plugin as a thin tool layer over `src/lib/dscr.ts`. No second calculation engine.

Order: plugin-first on manual inputs, served by the existing Ratio Radar deployment. A manual-input plugin needs no listing license, which is the repo's gating blocker (`docs/SCOPING.md` §5). The internal-pilot-first path in the handoff adds a stage without removing a risk.

Fit with Griffin outcomes:
- **Handling time:** only if the structured handoff reaches the LO and removes re-entry. Unproven.
- **Decision accuracy:** rent range, explicit assumptions and paths to 1.0 give LOs a cleaner first conversation. Unproven.
- **Attribution:** a scenario ID carried from tool call to lead to LOS is the only way to credit funded loans. Not built.

Bill Lyons expects DSCR volume to exceed bank-statement volume into Q4, with DSCR loans averaging about half the size. Griffin needs about twice the file count (HISTORICAL—RECONFIRM, `docs/SCOPING.md` §1, 2026-09-30). That makes DSCR lead flow the business case.

## 2. Primary user, replaced task, constraint, owner

| Item | Value | Status |
|---|---|---|
| Primary v1 user | Real estate investor evaluating a long-term rental purchase | PROPOSED, consistent with `docs/SCOPING.md` §1 |
| Receiving user | Griffin DSCR loan officer (13 listed in `src/lib/specialists.json`) | CONFIRMED roster snapshot 2026-09-30, `docs/SPECIALIST-HANDOFF.md` |
| Replaced task | The investor's hand-built DSCR estimate, and the LO's first-call re-collection of price, rent, down payment, taxes, insurance and HOA | PROPOSED |
| What happens next | The investor picks a specialist or the pre-qual link; the LO receives the exported scenario | PROPOSED; no routing contract exists |
| Current constraint | Lock-to-STP 62% vs 80% need is stale after 2026-08-07. No current evidence is in this repo | [NEEDS VERIFICATION]. Do not claim this plugin addresses the constraint. It works at the top of the funnel, before lock |
| Business outcome owner | Chris Garmon (operator) | [NEEDS VERIFICATION]. No written assignment found |
| Product direction | Bill Lyons (CEO) set locked decisions 2026-09-29 | HISTORICAL—RECONFIRM, `docs/SCOPING.md` §2 |

## 3. Evidence register

| # | Claim | Status | Source / date | Confidence | Consequence |
|---|---|---|---|---|---|
| E1 | Ratio Radar is the next version of REvestor; Griffin acquired REvestor assets Dec 2025 | CONFIRMED | `README.md`, `docs/SCOPING.md` §1 | High | Build here. No new repo |
| E2 | `sourcecode-master.zip` is legacy C# (commit `6e8b71a`, March 2019) and not runnable | CONFIRMED | `docs/dscr-mvp.md` | High | Do not reuse. Price-derived rent fallback and hard-coded rent floors are rejected |
| E3 | Griffin DSCR = gross monthly rent / PITIA(+HOA) | CONFIRMED in code | `src/lib/dscr.ts` header | High | Primary ratio. NOI/debt service is not Griffin DSCR |
| E4 | "No expense modeling. One number: DSCR." for the explorer | HISTORICAL—RECONFIRM | `docs/SCOPING.md` §1–2, Bill, 2026-09-29 | Moderate | Plugin core = DSCR. Cash flow stays a separate, optional tool |
| E5 | A separate cash-flow calculator (vacancy, NOI, cap rate, CoC) exists | CONFIRMED | `docs/CALCULATOR-INTEGRATION.md`, `src/lib/calculators/model.ts` | High | Reuse for the optional tool. No new math |
| E6 | Tax: CA 0.70%, TX 1.90%, FL 1.02%; insurance 0.30% | CONFIRMED in code | `src/lib/property-costs.ts`, reviewed 2026-10-01 against griffinfunding.com property-tax-by-state and DSCR-by-state pages | Moderate | Use. Label as state estimates. Accept user-supplied actual tax and premium |
| E7 | `SCOPING.md` §4 still lists 1.10% tax and 0.45% insurance placeholders; `DEFAULT_ASSUMPTIONS.taxRate` is 0.011 | CONFIRMED conflict | `docs/SCOPING.md`, `src/lib/dscr.ts` | High | Resolution: state rates win. Plugin must require a state or an explicit tax figure. Never fall back to 0.011 silently. Update SCOPING |
| E8 | Example rate 7.99% pending verified BankingBridge pricing | CONFIRMED | `docs/dscr-mvp.md`, `README.md` | High | Rate is a labeled hypothetical input. No live pricing |
| E9 | BankingBridge prototype is test-only; live activation blocked on account mapping | CONFIRMED | `README.md`, `docs/SCOPING.md` §6 | High | Defer live rate |
| E10 | HouseCanary adapter exists with validation, caching, typed errors; no authenticated account verification | CONFIRMED | `README.md`, `src/lib/providers/housecanary.ts` | Moderate | Rent lookup is Stage 3, behind verification |
| E11 | Listing rights unresolved; scraping Zillow/Redfin/Realtor.com prohibited | CONFIRMED as open | `docs/SCOPING.md` §5, `docs/DATA_SOURCE_AUDIT.md` | High | No listing search in the plugin v1 |
| E12 | Company NMLS 1120111 | CONFIRMED 2026-09-29 | griffinfunding.com/state-licensing, via `docs/CALCULATOR-INTEGRATION.md` | High | Show in every plugin response footer |
| E13 | Lead capture records listing, search state, UTM, referrer; demo mode stores nothing; Vercel live mode without webhook fails | CONFIRMED in code | `src/lib/leads.ts`, `README.md` | High | Attribution starts here. Durable destination missing |
| E14 | No LOS, CRM, officer-routing or funded-loan attribution exists | CONFIRMED | `docs/SPECIALIST-HANDOFF.md`, `docs/CALCULATOR-INTEGRATION.md` | High | Do not claim downstream events |
| E15 | Production: Vercel project `ratio-radar`, https://ratio-radar.vercel.app, demo mode on by default | CONFIRMED in docs | `README.md` | Moderate (not checked live today) | Host plugin endpoints here |
| E16 | OpenAI plugin rules prohibit SSN processing and in-plugin subscription commerce | HISTORICAL—RECONFIRM | Handoff, checked 2026-10-02 | Moderate | No borrower identifiers, documents or checkout |
| E17 | Social-post distribution claims (1.2B users, 2,000% growth, free window) | Unverified | Handoff | Low | Excluded from projections |
| E18 | Engine returns `Infinity` when PITIA is 0 | CONFIRMED in code | `src/lib/dscr.ts` `computeDscr` | High | Tool layer must map to "not defined"; never serialize Infinity |

## 4. REvestor reuse assessment

| Asset | Path | Reuse |
|---|---|---|
| DSCR engine: ratio, IO, 40-year, required down, required rate | `src/lib/dscr.ts` | Core of every plugin tool. Unchanged |
| State tax and insurance assumptions | `src/lib/property-costs.ts` | Default when actual figures are absent |
| Detailed DSCR and cash-flow calculator (purchase, cash-out refi, LTR, STR, IO) | `src/lib/calculators/model.ts`, `vendor/nonqm-engine.js` | Optional `analyze_cash_flow` tool. STR and refi deferred |
| Session handoff (versioned, allowlisted, 20-minute expiry) | `src/lib/calculators/handoff.ts` | Pattern for a server-side handoff token |
| Lead validation, consent, attribution | `src/lib/leads.ts`, `POST /api/leads` | Destination for `export_handoff` |
| Providers: rent, rate, listings | `src/lib/providers/` | Rent in Stage 3 only |
| Specialist roster | `src/lib/specialists.json` | Optional specialist pick on export |
| Search (forward and inverse) | `src/lib/search.ts`, `POST /api/search` | Not in plugin v1 (listing rights) |

Gaps: no plugin/MCP endpoint, no server-side scenario ID, no durable lead destination, no LOS join, no current-constraint data.

**Integration location (PROPOSED):** `src/lib/plugin/` for tool schemas and adapters that call `dscr.ts`; `src/app/api/plugin/[tool]/route.ts` for endpoints; plugin manifest per current OpenAI packaging, checked at build time. Branch from `main`.

## 5. Frozen v1 scope

**In v1 (PROPOSED, freeze on Chris's approval):**
1. One property, purchase, long-term rental, 30-year amortizing, 40-year amortizing or interest-only.
2. Manual inputs only. State-based tax/insurance defaults when actuals are not supplied.
3. DSCR = rent / PITIA(+HOA), with a rent range when the user gives low/mid/high.
4. Paths to 1.0: required down payment at the current rate; target rate at the current down payment; IO and 40-year comparison.
5. Sensitivity: rent ±5/10%, rate ±0.5/1.0 pt, down payment 20/25/30/40%.
6. Export handoff to Griffin lead capture with consent, scenario ID and specialist pick.
7. Disclosures and NMLS on every result.

**Deferred:** listing search and inverse listing mode; live HouseCanary rent; live BankingBridge rate; refinance and cash-out; short-term rental; NOI/cash-flow as default output; investor eligibility or LTV limits; saved scenarios and accounts; LOS writes; states beyond CA/TX/FL defaults (other states allowed only with user-supplied tax).

## 6. Input schema

| Field | Unit | Req. | Bounds | Provenance tag | Missing behavior |
|---|---|---|---|---|---|
| `state` | USPS code | Req. unless `annualTax` given | Any; defaults exist for CA, TX, FL only | user | Unsupported state without `annualTax`: reject with explanation |
| `price` | USD | Req. | 50,000–10,000,000 | user | Reject |
| `monthlyRent` | USD/mo | Req. | 1–100,000 | user · lease · appraisal_1007 · estimate | Reject. Never derive from price |
| `rentLow`, `rentHigh` | USD/mo | Opt. | low ≤ rent ≤ high | same as rent | Show a single value only |
| `downPct` | fraction | Opt. | 0.20–1.00 | user · default | Default 0.20, labeled "assumed" |
| `annualRate` | fraction | Req. | 0–0.20 | Always `hypothetical` | Reject. Never quote a Griffin rate |
| `structure` | enum | Opt. | `amortizing_30`, `amortizing_40`, `interest_only` | user | Default `amortizing_30` |
| `annualTax` | USD/yr | Opt. | 0–price×0.05 | user · tax_bill | State rate × price, labeled "state estimate" |
| `annualInsurance` | USD/yr | Opt. | 0–price×0.05 | user · quote | 0.30% × price, labeled "illustration; premiums may be higher" |
| `monthlyHoa` | USD/mo | Opt. | 0–10,000 | user · listing | Flag "HOA unknown", model at 0, show the flag in result and export |
| `propertyLabel` | text | Opt. | ≤80 chars, no full address required | user | Omit |

No SSN, DOB, income, credit score, account numbers or documents. Strip any that appear.

## 7. Calculation definitions and fixtures

Definitions are the existing `dscr.ts` behavior. These are modeling conventions, not investor guidelines.

- P&I factor: r = rate/12; n = 360 or 480; amortizing = r(1+r)^n / ((1+r)^n − 1); zero rate = 1/n; IO = r.
- Loan = price × (1 − downPct).
- Monthly T&I = (annualTax + annualInsurance) / 12, or price × (taxRate + insuranceRate) / 12.
- PITIA = P&I + T&I + HOA.
- DSCR = monthlyRent / PITIA. PITIA = 0 → "not defined" (map from engine `Infinity`).
- Required down (closed form): affordable P&I = rent/1.0 − T&I − HOA; ≤ 0 → unreachable (`rent-below-tax-ins`); else downPct = max(0.20, 1 − (affordablePI / factor) / price); > 1.0 → unreachable.
- Target rate: bisection on [0, current rate] for the highest rate with loan × factor ≤ affordable P&I. Mathematical target, not available pricing or a buydown quote.
- Full precision internally. Display DSCR to 2 decimals, money to whole dollars. Compare against 1.0 before rounding.

**Fixtures.** Independently recomputed in Python on 2026-10-02 (not by the TypeScript engine). Insurance 0.30%, HOA 0 unless stated. Codex must add these as tests and confirm the engine matches to ±$0.01 and ±0.0001.

| # | Inputs | P&I | T&I | PITIA | DSCR | Required down |
|---|---|---|---|---|---|---|
| F1 | CA, $400,000, rent $2,600, 7.99%, 20%, 30-yr | 2,345.82 | 333.33 | 2,679.15 | 0.9705 | 22.70%; target rate 7.6328% |
| F2 | F1 with interest-only | 2,130.67 | 333.33 | 2,464.00 | 1.0552 | 20% (meets) |
| F3 | F1 with 40-year | 2,222.60 | 333.33 | 2,555.93 | 1.0172 | 20% (meets) |
| F4 | TX, $300,000, rent $2,400, 7.99%, 20%, 30-yr | 1,759.36 | 550.00 | 2,309.36 | 1.0392 | 20% (meets) |
| F5 | FL, $350,000, rent $2,500, HOA $150, 7.99%, 20%, 30-yr | 2,052.59 | 385.00 | 2,587.59 | 0.9662 | 23.41% |
| F6 | TX, $300,000, rent $2,000, 0% rate, 20%, 30-yr | 666.67 | 550.00 | 1,216.67 | 1.6438 | 20% (meets) |
| F7 | Rent ≤ T&I + HOA (e.g. TX $300,000, rent $500) | n/a | 550.00 | n/a | <1 | Unreachable: `rent-below-tax-ins` |
| F8 | Price 0, or rate 0.25, or downPct 0.10 | Validation error, no number returned |

## 8. User flow, result layout, LO handoff

**Flow.** Investor describes a property in chat → model collects the required fields and asks for missing ones (never fills them) → `analyze_dscr` → model explains the result in plain language → optional `paths_to_one` and `sensitivity` → `export_handoff` after explicit consent.

**Result layout (every response).**
1. DSCR (and range), with "meets 1.0" or "below 1.0".
2. PITIA itemized: P&I, tax, insurance, HOA, each with provenance tag.
3. Paths to 1.0 table: down payment, target rate, IO, 40-year.
4. Flags: HOA unknown, state-estimate tax, hypothetical rate.
5. Disclosure: "Estimate only. Not a loan offer, rate quote, or credit decision. A licensed Griffin loan officer reviews every scenario. Griffin Funding NMLS 1120111." Compliance must approve final text.

**LO handoff contents.** Scenario ID; calculation version (git SHA + engine version); timestamp; property label and state; price, down payment, loan amount, LTV; rent and range with source tags; hypothetical rate and structure; tax/insurance/HOA with source tags; DSCR and paths to 1.0; unresolved inputs; investor name, email, phone and consent record; chosen specialist; next information the LO needs (lease or 1007 rent, actual tax bill, insurance quote, HOA dues, reserves, credit). Ordered for Place → Document → Price. The handoff does not claim any stage is complete.

### 8a. Worked example, end to end (target behavior)

PROPOSED behavior once built. Numbers are fixture F1.

1. **Investor asks:** "I'm looking at a $400K rental in California that should rent for $2,600. Does it work as a DSCR loan?"
2. **Model collects gaps:** down payment, rate to model, HOA. It never guesses rent or invents a rate. A skipped HOA is flagged unknown.
3. **`analyze_dscr` returns:** P&I $2,346 (7.99% hypothetical, 20% down, 30-yr) · tax $233 (CA state estimate 0.70%) · insurance $100 (0.30% illustration) · HOA unknown, modeled $0 · PITIA $2,679 · **DSCR 0.97, below 1.0**.
4. **`paths_to_one` returns:** 22.7% down; or a 7.63% target rate (math target, not a quote); or interest-only (1.06); or 40-year (1.02).
5. **`sensitivity`** answers "what if rent is $2,400" or "30% down" from the same engine.
6. **`export_handoff`**, after consent: name, email, phone, optional specialist pick → Griffin lead capture with a scenario ID.
7. **LO receives** the handoff in §8 and starts the first call at Document, not at re-collection. That is the handling-time claim the pilot must prove.

```
Investor in ChatGPT
  → tool call: analyze_dscr | paths_to_one | sensitivity | export_handoff
  → Ratio Radar API on Vercel (/api/plugin/[tool])
  → src/lib/dscr.ts (same engine as the website)
  → structured result + provenance + calculation version
  → model explains in plain language
  → export_handoff → lead capture, tagged with scenario ID
  → (blocked) CRM/LOS join → application → funded loan
```

Works in demo mode once stage 2 ships. Real leads need §12 blockers 1–2. Funded-loan credit needs the scenario ID field in the CRM/LOS (§10).

## 9. Architecture, data, policy boundaries

- Validated inputs → `dscr.ts` → structured result with provenance → tool response / export. The model explains; it never computes or edits numbers.
- Tools (PROPOSED): `analyze_dscr`, `paths_to_one`, `sensitivity`, `export_handoff`. Optional later: `analyze_cash_flow` (reuses `calculators/model.ts`, labeled separately from DSCR).
- Host: Next.js API routes in this repo on Vercel project `ratio-radar`. Stateless except `export_handoff`.
- Data leaving Griffin systems: tool inputs and outputs pass through the plugin host platform. Keep inputs to property and financing values. Contact data goes only to `export_handoff` with consent.
- Retention: [NEEDS VERIFICATION]. Proposed default: no scenario storage beyond the lead record; logs hold scenario ID, tool, calculation version, timestamp, result band. No full conversation capture.
- Demo mode stays the default until a durable lead destination, NMLS display and compliance review are in place.
- Never silently fall back from a failed live provider to fixtures (`docs/dscr-mvp.md`).
- Public plugin: recheck OpenAI packaging, auth, privacy, submission and commerce rules at build time. No borrower documents, no SSN, no subscription checkout.

## 10. Attribution plan

| Event | Definition | Status |
|---|---|---|
| `scenario_created` | First valid tool call; new scenario ID (random, pseudonymous) | PROPOSED, buildable |
| `analysis_completed` | `analyze_dscr` returned a number | PROPOSED, buildable |
| `handoff_exported` | `export_handoff` returned success with consent | PROPOSED, buildable |
| `handoff_received` | Lead landed in a durable destination | Blocked: no destination |
| `application_linked` | Scenario ID matched to an application | Blocked: no LOS/CRM join |
| `funded_outcome_linked` | Application funded | Blocked: same |

- Join: scenario ID stored on the lead record, then carried into the LOS/CRM as a custom field. Field and owner [NEEDS VERIFICATION].
- Dedup: one lead per email + scenario ID per 24 hours (PROPOSED).
- Baseline: current DSCR inquiry-to-application rate and LO first-call duration before launch. Source [NEEDS VERIFICATION].
- Limits: plugin users self-select. Report correlation until a holdout or matched comparison exists. An export is never reported as a lead, application or funding.

## 11. Delivery stages

| Stage | Work | Estimate | Exit check |
|---|---|---|---|
| 0 | Fix E7 conflict; add F1–F8 tests | 0.5 day | Tests green |
| 1 | Tool adapters and API routes over `dscr.ts`; validation; disclosures | 1–2 days | Fixtures match via API; no NaN or Infinity serialized |
| 2 | `export_handoff` to lead capture with scenario ID and consent; demo mode respected | 1 day | Handoff complete in demo; nothing stored in demo |
| 3 | Plugin manifest and private test install | 1 day + platform queue | Chris completes 5 real scenarios end to end |
| 4 | Internal pilot with 2–3 DSCR LOs | 2 weeks elapsed | LOs confirm handoff completeness; re-entry measured |
| 5 | Public submission | Blocked on section 12 | All approvals in hand |

Live rent (HouseCanary) and live rate (BankingBridge) are separate scoping once vendor access is verified. Estimates assume narrow scope and exclude review queues and compliance turnaround.

## 12. Blockers, defaults, approvals

**Blockers:**
1. Durable lead destination (CRM/LOS webhook). Owner [NEEDS VERIFICATION].
2. Compliance approval of disclosures and consent text (drafts today).
3. Named owners for math validation, pilot and public approval.
4. Retention and logging policy for plugin traffic.

**Defaults for non-blocking decisions (PROPOSED):** 20% down, 30-year amortizing, insurance 0.30%, state tax for CA/TX/FL, HOA unknown flagged at 0, 7.99% shown only as an example the user can replace, demo mode on.

**Before public launch:** compliance sign-off; NMLS and canonical domain configured (revestor.com vs a griffinfunding.com path, `docs/SCOPING.md` §9 Q4); Bill's approval of public pilot vs private prototype (§9 Q8); current plugin policy recheck; pilot evidence from stage 4.

## 13. Codex build instruction

```
Repository: chrisgarmon-griffin/GF_RatioRadar. Branch from main.
Read README.md, docs/SCOPING.md, docs/dscr-mvp.md, docs/CALCULATOR-INTEGRATION.md
and docs/Griffin-Rental-Property-Analyzer-Enriched-Build-Brief.md first.

Goal: expose the existing DSCR engine (src/lib/dscr.ts, src/lib/property-costs.ts)
as plugin tools. Do not write new calculation math. Do not change dscr.ts formulas.

1. Add fixtures F1-F8 from brief section 7 as tests. Confirm the engine matches.
   Report any mismatch instead of adjusting expected values.
2. Create src/lib/plugin/ with input schemas per brief section 6 and adapters for
   analyze_dscr, paths_to_one, sensitivity, export_handoff. Require state or annualTax.
   Never use DEFAULT_ASSUMPTIONS.taxRate silently. Map Infinity to "not defined".
   Tag every value with provenance. Label rate as hypothetical.
3. Add src/app/api/plugin/[tool]/route.ts. Stateless except export_handoff, which
   calls the existing lead validation with consent and a random scenario ID.
   Respect demo mode: no storage, no webhook.
4. Every response carries the disclosure text and NMLS 1120111 from brief section 8.
5. Log only scenario ID, tool, calculation version, timestamp and result band.
6. Draft the plugin manifest against current OpenAI documentation. Do not submit.
7. Out of scope: listing search, live HouseCanary or BankingBridge calls,
   refinance, STR, eligibility rules, accounts, LOS writes.
8. Run npm run check, npm test and the e2e suite. Report results, the diff,
   and open questions. Request approval before any deployment or submission.
```
