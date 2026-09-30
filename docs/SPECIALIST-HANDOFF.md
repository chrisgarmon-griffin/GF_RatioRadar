# Specialist and review integration

Source snapshot: 2026-09-30. Team repository commit e4ab18fafb62330d34a458b99e4f4b18a73546a7; reviews repository commit 256a6aab2ab4893000ce01e428719407dde9037b.

`src/lib/specialists.json` contains 13 public roster members whose first three displayed profile spotlight tags contain DSCR (the same pill selection used in `public/assets/team.js` cardTemplate). This includes loan officers and producing/branch managers. Source fields: data/people.json, data/contact-data.json and PROFILE_SPOTLIGHTS. No ratings, volume claims, or inferred state eligibility were copied. Missing local portraits use initials. Missing NMLS numbers remain omitted, not invented.

The company-owned reviews site is https://griffinfundingreviews.com/ (also the team's data/review-profiles.json destination). Both this URL and https://apply.griffinfunding.com/ returned HTTP 200 during verification. Profile paths reproduce the team's profileUrl helper, including Cody's anchor and Larry's normalized slug.

Cards appear on all pages, with a compact specialist picker inside property scenario dialogs. The initial three cards retain source order, not a recommendation ranking. Remaining cards expand with a native details element.

The source application URL is shared. There is no verified officer-routing or financial-scenario intake contract. Application links therefore send no calculator values or selected officer and clearly explain this boundary. Clients can print the existing calculator scenario and contact their chosen officer directly. No application is submitted by this site. No funded-loan or LOS attribution is claimed. Future application handoff requires a documented vendor contract and attribution implementation.

This is a checked-in source snapshot, not a live roster feed. Refresh the roster, tags, contacts and portraits together after source roster changes.

Verification: lint, TypeScript, 64 unit tests, production build, 33 browser tests, axe checks, 320px layout and desktop hero height checks. Desktop resource heroes are 230px and calculator headers 165px; mobile height is content-driven. Guide accent uses contrast-tested red #ff7777 on charcoal.
