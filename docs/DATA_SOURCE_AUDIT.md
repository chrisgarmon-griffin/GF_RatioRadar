# Data Source Audit

Audit date: 2026-09-30. Method: web search snippets only. The egress proxy blocked direct fetches of vendor pages (Constellation, RentCast, Griffin), so no license text was read in full.
**Every license and price below is a lead to confirm in writing before anything ships to consumers.** Confidence labels: High / Moderate / Low.

---

## 0. Read first: two findings that change the plan

1. **Griffin's press release says the Revestor search already runs on "MLS data feeds."** The release describes search of homes for sale in real time, estimated rent ranges, and instant DSCR metrics. First action: find out what feed powers it today, under which license, and in which MLSs. That answer may remove the Constellation question entirely. Confidence: Moderate (release text via search snippet; live product not inspected).
2. **Constellation does document a photo resource.** Its RESO Web API exposes a `Media` entity (photos, virtual tours) alongside `Property`. Bill was told there are no pictures. Either the quoted package excludes media, or the MLSs in scope do not license photos to this use. Ask Constellation which. Confidence: Moderate. Source: [Constellation Listings API docs](https://docs.cdatalabs.com/listings/).

---

## 1. The gating issue is licensing, not price

Listing access is decided MLS by MLS, and eligibility depends on who you are.

- MLS vendor access is generally for member-facing products. One vendor guide states MLS data cannot go into tools for the general public or for non-member clients "such as mortgage brokers or title companies." Confidence: Moderate (one vendor's summary of MLS practice, not an MLS rule). Source: [Repliers vendor approvals guide](https://help.repliers.com/en/article/guide-to-vendor-approvals-and-mls-access-1bu6n3a/).
- Consumer display of MLS listings normally runs through IDX, where a participating broker grants reciprocal display rights. A company signs a license with each MLS to use the API. Source: [MLSListings IDX FAQ](https://support.mlslistings.com/s/article/IDX-FAQ), [Constellation compliance primer](https://www.cdatalabs.com/real-estate-data-compliance-101-idx-vow-and-bbo-broker-back-office-access-explained/).
- Constellation says onboarding is approved MLS by MLS and normalizes 500+ MLS sources. Whether Griffin qualifies for a public lender site in CA, TX and FL is the question to put to them in writing.
- Bill's read on Zillow is right. Zillow's official API was retired in 2021. Its replacement, Bridge Interactive, is reserved for MLS members and licensed brokers. Zillow's terms bar automated queries and scraping. The Zillow app inside ChatGPT is a Zillow-controlled display, not a data license anyone else can buy. Confidence: Moderate-High. Sources: [Zillow Terms of Use](https://www.zillow.com/corporate/terms-of-use/), [HousingWire on the ChatGPT integration](https://www.housingwire.com/articles/zillow-chatgpt-integration-redefine-or-violate-mls-policies/).
- Scraping Zillow, Redfin or Realtor.com is not a legal path. Redfin offers aggregate market files only and no listing API. Source: [Redfin Data Center](https://www.redfin.com/news/data-center/).

**Recommendation (Confidence: Moderate).** Do not sign Constellation, and do not build on any listing feed, until three answers are in hand:

| # | Question | Ask |
|---|---|---|
| 1 | What feed and license power the current Revestor / Griffin investment search? | Bill, Revestor tech transfer |
| 2 | Can Griffin, as a lender, display listings publicly in CA/TX/FL under an IDX participant or another arrangement? | Constellation, plus counsel |
| 3 | Is Media (photos) included, and under which MLS terms? | Constellation |

---

## 2. Source audit

| Source | Layer | Coverage | Cost | Photos | Refresh | Format | License / display risk | Confidence |
|---|---|---|---|---|---|---|---|---|
| **Existing Revestor / Griffin MLS feed** | Listings | Unknown | Sunk | Unknown | "Real time" per release | Unknown | Unknown, likely already licensed | Low (unverified) |
| **Constellation Data Labs** | Listings (+Media) | 500+ MLS sources, 4M+ active listings | Bill: ~$50K/yr national, ~$1K/mo pilot. Site says flat, requirement-based pricing | Media entity exists; per-MLS license | Under 5 min claimed | RESO Web API (OData), GraphQL, webhooks, SFTP | Per-MLS approval; public lender display unconfirmed | Moderate |
| **Broker-of-record IDX** (via Constellation, Trestle, MLS Grid, Spark) | Listings + photos | Per MLS | Membership + feed fees, TBD | Yes, with IDX display rules | Near real time | RESO Web API / RETS | Requires IDX participant status; strict display and attribution rules | Moderate |
| **Bridge Interactive (Zillow Group)** | Listings | MLS by MLS, no national grant | Third-party blogs say from ~$500/mo | Yes | Near real time | API | Members and licensed brokers only | Low (blog-sourced price) |
| **RentCast API** | Listings (sale + rent), rent AVM, property records | All 50 states, 150M+ records | $0 (50 calls) / $74 / $199 / $449 per month | Not confirmed | Daily listings and AVM | REST/JSON | API terms grant display and resale rights and need no attribution. Listing provenance unstated, so MLS display rules may still bind. Ask what the listings come from | Moderate on terms, Low on provenance. Sources: [RentCast pricing](https://www.rentcast.io/pricing), [API terms](https://www.rentcast.io/terms-api) |
| **HouseCanary (locked)** | Rent AVM, value, forecast | 136M properties; rent on ~86M | From Griffin's 9/2026 bill: rental_value $3.15 per call (94 calls, $296.10), value $4.20, Basic endpoints $0.53, plus a $1,050 platform fee. Test keys are free. The earlier $0.05 to $0.45 estimates were wrong | No | Rent model refreshed monthly | REST/JSON | Contracted vendor, terms per Griffin agreement. Live-tested with a test key on 2026-10-01: returned mean, low, high and fsd for a test address | Moderate-High. Source: [HouseCanary pricing](https://www.housecanary.com/pricing) |
| **BankingBridge (locked)** | DSCR rate | n/a | Existing | n/a | Not researched | API | Contracted | Not researched |
| **County assessor and tax rolls** (LA County confirmed) | Tax, ownership, last sale, parcel | Per county | Free | No | LA County: monthly parcel update | Shapefile / geodatabase / roll files | Informational license, county can restrict or discontinue. No "for sale" status | High for LA County. Others unchecked. Source: [LA County Open Data](https://data.lacounty.gov/pages/52dc6710edfa4dabb47db8a8e6b79432) |
| **SanGIS / San Diego** | Parcel | San Diego County | Unknown | No | Unknown | GIS layers | Bulk terms not found | Low |
| **HUD Fair Market Rents and Small Area FMRs** | Rent cross-check | National, ZIP-level in SAFMR metros | Free (free API token) | n/a | Annual | API, Excel | Public federal data | High. Source: [HUD FMR API](https://www.huduser.gov/portal/dataset/fmr-api.html) |
| **Census ACS (B25064 median gross rent)** | Rent cross-check | County, city, ZCTA | Free | n/a | Annual (5-year) | API, CSV | Public federal data | High |
| **Census ACS median real estate taxes (B25103)** | Tax-rate assumption | County | Free | n/a | Annual | API | Public | Moderate (table ID from memory, confirm) |
| **FHFA HPI** | Market context | State, MSA | Free | n/a | Quarterly | CSV | Public | High. Source: [FHFA HPI datasets](https://www.fhfa.gov/data/hpi/datasets) |
| **Redfin Data Center** | Market context only | Regions | Free | n/a | Weekly/monthly | CSV | Aggregates only, attribution required, no listings | High |
| **Google Street View Static API** | Photo fallback | Wide | Free to 10K requests, then ~$7 per 1,000 | Street exterior, not listing photos | Live | Image URL | Caching and storing images prohibited except panorama IDs. Max 640x640. Needs public terms and privacy policy | Moderate. Source: [Street View policies](https://developers.google.com/maps/documentation/streetview/policies). Verify current pricing |
| **Regrid** | Parcel, assessed value, land use | ~158M parcels (vendor-reported) | Custom, vendor-reported as low for a pilot | No | Often quarterly | API, GeoJSON | Not reviewed | Low (vendor-reported, unverified) |
| **ATTOM** | Tax assessments, rental AVM, hazards | ~155M properties | Quote-based; reported $850 to $2,000+/mo | No | Daily/weekly | REST | Internal apps and end-user experiences allowed, resale restricted (vendor-reported) | Low-Moderate. Sources: [ATTOM API overview](https://blog.iq.dwellsy.com/attom-data-overview-2026-property-ownership-and-market-data-explained/) |
| **Zillow / Redfin / Realtor.com scraping** | Listings | n/a | n/a | n/a | n/a | n/a | Prohibited by terms. Do not use | High |

---

## 3. Cost paths

The three paths from the scoping doc, filled with what is known.

| Path | Data cost | Coverage | Active "for sale" | Photos | Refresh | License risk |
|---|---|---|---|---|---|---|
| **1. Constellation pilot** (CA, or CA/TX/FL) | ~$1K/mo per Bill (~$12K/yr). 50 states ~$50K/yr | 1 to 3 states | Yes | Depends on Media entitlement per MLS | Minutes | Medium until MLS eligibility is confirmed |
| **2. Free/public only** | ~$0 | County by county | **No.** Assessor rolls carry no listing status | No | Monthly to annual | Low, but the product loses its core purpose |
| **3. Blended:** county + HUD/Census for context, IDX or Constellation for actives and photos | Path 1 cost + license/membership fees (unknown) + optional RentCast or ATTOM | Pilot states | Yes | Yes, if IDX terms allow | Minutes | Lowest once an IDX participant is in place |
| **3b. Reuse existing Revestor feed** | Sunk (verify) | Whatever Revestor holds | Yes | Unknown | Real time | Already licensed, verify scope covers a public DSCR search |

**Free/public alone cannot ship the MVP.** Bill's requirement is "know that property is listed for sale." No free source supplies that legally. Free data narrows the paid bill: it replaces guessed tax rates, gives a rent sanity check, and powers SEO market pages.

**Path 3b is the fastest test.** Confirm it first.

---

## 4. Where free and public data does help

| Use | Source | Effect on Revestor |
|---|---|---|
| Replace the 1.10% tax placeholder | ACS median real estate taxes by county, later ATTOM/Regrid parcel tax | Removes the least defensible number in the DSCR math. Lenders often estimate taxes on purchase price, so confirm with the Griffin underwriting rule before changing the method |
| Rent confidence | HUD SAFMR and ACS gross rent against the HouseCanary estimate | Flag listings where HouseCanary rent sits far above local benchmarks |
| Rent range | HouseCanary upper and lower bound | Show a DSCR range (low rent, mid, high rent) instead of one number |
| SEO landing pages | ACS, FHFA, HUD by ZIP and metro | "DSCR-friendly ZIP codes" pages that need no listing license. Feeds Bill's SEO goal |
| Photo fallback | Street View Static API, live render only | Avoids the blank card. Not a substitute for listing photos, and it shows the street, not the home |

---

## 5. Open questions

1. What feed and license power the live Revestor search? (Bill, Revestor tech transfer)
2. Does the existing Revestor feed cover public display for CA, TX and FL? (Legal)
3. Can Griffin qualify for Constellation delivery in those states as a lender, and does the quote include Media? (Constellation)
4. Does Bill want the product at revestor.com (SEO equity, currently forwarding) or under griffinfunding.com? Decide before build, because it sets the canonical URL for SEO.
5. Which rate does BankingBridge return per scenario (IO, 40-year, down payment tiers)? Not researched. Replace the fixture adjusters once known.
6. Is the HouseCanary rent endpoint in the current contract, and what is the per-call price? Range bounds are the useful field.
7. Does Griffin's underwriting rule for taxes and insurance use purchase price or actual tax bills? Sets the DSCR method.
8. Read the full Constellation and RentCast terms. This audit read snippets only.

## 6. Next actions

1. Send questions 1 to 3 to Bill and Constellation this week.
2. Build the HouseCanary and BankingBridge adapters behind the existing interfaces (both contracted).
3. Add ACS county tax-rate lookup to replace the 1.10% placeholder, and HUD/ACS rent cross-check.
4. Hold any listing adapter until the license answers land. A RentCast adapter is fine for a private prototype only, and needs legal sign-off before any public URL.
