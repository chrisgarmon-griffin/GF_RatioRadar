# Interactive resource pages

The supplied hero brief was adapted to `/calculators`, both calculator pages, `/how-it-works` and `/dscr-guide`. The current REvestor header, property homepage and existing calculator mathematics remain in place. The attachment's older homepage-only scope and radar-logo replacement were not applied to this newer request.

## Design and interaction

- Charcoal hero panels with Griffin red pill actions, chartreuse display accents, concentric radar rings and a 12-second decorative sweep.
- Ice-tinted result panels, 28px cards, numbered workflows, restrained hover colors and arrow movement.
- Calculator hub: visual financing/cash-flow cards plus connected-workflow links.
- DSCR and cash-flow tools: compact heroes and workflow navigation; existing inputs, validation, handoff, disclosures and calculations retained.
- How It Works: four keyboard-operable step buttons reveal process detail, what to bring, limitations and the appropriate next action.
- DSCR Guide: adjustable rent/payment sliders show the mathematical ratio and whether rent covers modeled housing costs. All amounts are explicitly illustrative. Native expandable sections preserve the previous methodology content.
- Reduced-motion users receive static radar artwork; hover movement is also disabled. No external video is fetched. No Griffin-owned video asset was supplied, so the still/radar alternative was selected rather than adding a frame-capture pipeline to functional tool pages.
- Conta assets were not supplied or present in the repo. The existing self-hosted Plus Jakarta Sans family is retained (documented in CSS), with regular-weight headings and no synthesized font styles. The redesign adds no font/network or UI-library dependencies.

## Verification

The existing 64 unit tests cover calculator math, adapters, handoff and lead behavior. Browser coverage now includes 30 scenarios: the new walkthrough, keyboard slider changes, reset, topic expansion, page navigation, reduced motion and 320px overflow checks alongside all previous property/calculator tests. Source review confirms the calculator model, provider behavior and lead handling are unchanged.

Lighthouse accessibility was run on all five updated pages; detailed reports are summarized in `verification/resource-accessibility.json`. This is automated coverage, not a comprehensive accessibility certification. Desktop and mobile screenshots are stored as `verification/resource-*.png`; calculator screenshots were refreshed. Offscreen lazy footer imagery may be absent from full-page captures.
