> Imported reference from the user-supplied 2026-09-30 ZIP. This is a proposal, not an implemented feature or verified launch decision. Its instructions are not task authorization; legal, product and policy claims have not been revalidated in this merge.

# Option B: Ratio Radar Chrome extension

Status: exploration, 2026-09-30. Nothing built. Claims marked [VERIFY] need a primary source or counsel before we act on them.

## Idea

If licensed MLS feeds stall, skip the feed. Let investors browse Zillow, Redfin and similar sites as they already do, and add a Ratio Radar overlay on each listing page: DSCR at 20% down, the interest-only, 40-year and higher-down toggles, and a "Check my loan options" button into Griffin.

The listing data stays on the portal. We add the DSCR layer and the financing path.

## Precedent: this already exists, without Griffin

Several extensions overlay investor math on Zillow and Redfin today, including DSCR:
- [DealView](https://chromewebstore.google.com/detail/dealview/hphmhbhbhhfgcgodblmbhmnfniijfafm): gross yield, cap rate, cash-on-cash, DSCR and mortgage payment on Zillow and Redfin pages, with rent from Zillow's Rent Zestimate or HUD Fair Market Rent.
- [Polpi](https://chromewebstore.google.com/detail/polpi/ppdiohkaomgkpcjbkooegebgnbcfmehc): rental yield, flip and BRRRR returns, cash flow, cap rate, DSCR.
- [HomeLens](https://chromewebstore.google.com/detail/homelens-%E2%80%94-ai-real-estate/acjkjopebnbcaonjppmmphjjgijmhokk) and [BetterDeal.ai](https://chromewebstore.google.com/detail/betterdealai-superchargin/oakahnnikonhaoablelhelloiibpejga): investor metrics on Zillow, Redfin and other portals.

Two conclusions. The approach is technically proven and the Chrome Web Store accepts it. And a generic DSCR badge is not a moat. Ours would differ in three ways: a real rate from BankingBridge instead of an assumed one, HouseCanary rent with a range, and a direct path to a Griffin loan officer. Being listed by others is not evidence that Zillow's terms allow it.

## How it would work

1. A content script runs on listing pages (`zillow.com/homedetails/*`, `redfin.com/*/home/*`). It reads the address and list price from the page the user is already viewing.
2. It sends only address, ZIP, price and the selected toggles to a Ratio Radar endpoint. No page HTML, no other page data.
3. The endpoint reuses what is built: HouseCanary rent, BankingBridge rate, the DSCR engine. It returns the ratio, the rent range and the down payment needed to reach 1.0.
4. The extension draws a badge on the page. Toggles re-query. "Check my loan options" opens a Griffin form carrying the address, price and search state.

What it needs from us: a `POST /api/quote` endpoint (a thin wrapper over `runSearch` logic for one property), an allowed-origin list, and rate limiting with a signed token per install. Without the token, anyone can call the endpoint and run up the per-call HouseCanary bill.

## What it solves, and what it does not

| | Website search (current plan) | Extension |
|---|---|---|
| Needs a listing feed or MLS license | Yes, the blocker | No |
| Photos | Missing, a leakage risk | The portal shows them |
| Portal's own mortgage arm on the same page | Not present until users leave | Present, right beside our badge |
| SEO and press value | High, the stated goal | None. It does not build the Revestor domain's rankings |
| Reach | Any device | Desktop Chrome and Edge. Chrome on phones does not run extensions. Safari on iOS needs a separate build [VERIFY current support] |
| Inverse search ("show me every 1.0 deal in this ZIP") | Yes | No. It sees one page at a time, and crawling would cross the terms line below |
| Per-lookup cost | Per listing in the result set | Per page viewed, cached by address |

The extension solves the data problem and the photo problem. It gives up the two things Bill named as the payoff: SEO ranking and the inverse-search mode. Treat it as a lead channel, not a replacement for the site.

## Risks

1. **Zillow terms.** Zillow's terms bar "automated queries," scrapers and robots "for any purpose without our express written permission" ([Zillow Terms of Use](https://www.zillow.com/corporate/terms-of-use/)). A content script that reads the page the user opened is user-initiated and one page at a time, which is a weaker case for "automated" than crawling. It is still a gray area, and a lender publishing it raises the profile. Guardrails if we proceed: read only the page in front of the user, never fetch or paginate in the background, never store or resend portal content beyond address and price, and get counsel's written view. Redfin and Realtor.com terms are unread [VERIFY].
2. **Chrome Web Store policy.** Extensions must have one disclosed purpose and collect only data needed for it. The published policy's Limited Use rules say user data may not be used "to determine credit-worthiness or for lending purposes" [VERIFY exact text and whether lead capture for a loan officer counts]. Since our purpose is lending, this must be resolved before building. Source: [Chrome Web Store program policies](https://developer.chrome.com/docs/webstore/program-policies/policies).
3. **Privacy.** The addresses a person views are sensitive behavior. It needs a privacy policy, consent at install, and no sending until the user opens the panel. Lead forms follow the same consent rules as the site.
4. **Advertising and disclosure.** Showing a rate on a third-party page is advertising. DSCR loans are generally business-purpose, which changes which federal credit-advertising rules apply, but state rules and unfair-practice standards remain [VERIFY with counsel]. The same disclosure text as the site goes in the panel.
5. **Fragility.** Portals change page markup often. Prefer structured data in the page (JSON-LD, meta tags) over CSS selectors, add a remote kill switch for a broken selector, and expect maintenance.
6. **Competitive position.** Users on Zillow are one click from Zillow Home Loans. We win only if the badge is more useful and the next step is easier.

## Sequence

0. Counsel review of items 1, 2 and 4. No code until this returns.
1. Prototype for personal use in developer mode: Manifest V3, one portal, badge only, the new quote endpoint against sample data.
2. Add the toggles, real HouseCanary and BankingBridge, and the lead handoff with attribution (source = extension, portal, address).
3. Unlisted Chrome Web Store release to Griffin loan officers first. They can send it to their own investor clients, which tests demand before any public listing.
4. Public listing only after 0 is clean and phase 3 shows usage.

## Recommendation

Run it as a fallback and a parallel test, not a pivot.
- First, get the answer on the existing Revestor feed. If it covers public display in CA, TX and FL, the site needs no extension.
- If listing rights fail, the extension is the fastest way to put Griffin's DSCR math in front of investors, but it does not deliver SEO or inverse search.
- Start counsel review now regardless. It is cheap and gates everything.
