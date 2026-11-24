/**
 * PRIVATE DEMO DATA. Fictional brokerages, agents and listings for the partner listings view and the widget demo.
 * In the real version each partner broker would send only the listings their own brokerage represents, by written
 * opt-in, through a feed or upload. Nothing here comes from an MLS.
 */
export interface PartnerListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  taxAnnual: number;
  hoaMonthly: number;
  /** Sample monthly rent. Stands in for the licensed rent estimate while the demo runs on sample data. */
  sampleRent: number;
  blurb: string;
  brokerage: string;
  agent: string;
  /** Hue for the placeholder photo tile. */
  hue: number;
}

export const PARTNER_LISTINGS: PartnerListing[] = [
  { id: "fresno", address: "1204 Alder St", city: "Fresno", state: "CA", zip: "93706", price: 349000, beds: 3, baths: 2, sqft: 1420, taxAnnual: 3640, hoaMonthly: 0, sampleRent: 2450, blurb: "Single-story home near schools and transit. Updated kitchen, fenced yard and a two-car garage.", brokerage: "Sample Coast Realty", agent: "Jordan Sample", hue: 212 },
  { id: "sandiego", address: "88 Marina Way #4", city: "San Diego", state: "CA", zip: "92109", price: 685000, beds: 3, baths: 2.5, sqft: 1610, taxAnnual: 8220, hoaMonthly: 310, sampleRent: 4795, blurb: "End-unit townhome a few blocks from the bay. Attached garage, private patio and community pool.", brokerage: "Sample Coast Realty", agent: "Jordan Sample", hue: 196 },
  { id: "bakersfield", address: "705 Kern Ave", city: "Bakersfield", state: "CA", zip: "93307", price: 289000, beds: 3, baths: 1.5, sqft: 1180, taxAnnual: 3180, hoaMonthly: 0, sampleRent: 2250, blurb: "Corner lot with a detached garage and new roof. Close to downtown and the freeway.", brokerage: "Sample Coast Realty", agent: "Riley Example", hue: 28 },
  { id: "stockton", address: "52 Orchard Ln", city: "Stockton", state: "CA", zip: "95207", price: 379000, beds: 4, baths: 2, sqft: 1760, taxAnnual: 4360, hoaMonthly: 0, sampleRent: 2600, blurb: "Four bedrooms on a quiet street. Large yard, covered patio and room for an ADU.", brokerage: "Sample Coast Realty", agent: "Riley Example", hue: 142 },
  { id: "dallas", address: "1600 Lakeview Blvd", city: "Dallas", state: "TX", zip: "75216", price: 315000, beds: 4, baths: 2.5, sqft: 1900, taxAnnual: 6900, hoaMonthly: 45, sampleRent: 2450, blurb: "Two-story home near the lake trail. Open kitchen, game room and a fenced yard.", brokerage: "Lone Star Sample Homes", agent: "Casey Placeholder", hue: 262 },
  { id: "houston", address: "9021 Bluebonnet Ct", city: "Houston", state: "TX", zip: "77036", price: 245000, beds: 3, baths: 2, sqft: 1500, taxAnnual: 5150, hoaMonthly: 30, sampleRent: 2050, blurb: "Brick ranch on a cul-de-sac. Recent HVAC, tile floors and a long driveway.", brokerage: "Lone Star Sample Homes", agent: "Casey Placeholder", hue: 12 },
  { id: "orlando", address: "2418 Palmetto Dr", city: "Orlando", state: "FL", zip: "32808", price: 335000, beds: 3, baths: 2, sqft: 1450, taxAnnual: 4020, hoaMonthly: 0, sampleRent: 2650, blurb: "Block home with a screened lanai. New water heater and impact windows.", brokerage: "Sunshine Sample Group", agent: "Morgan Demo", hue: 172 },
  { id: "tampa", address: "515 Gulfview Ave", city: "Tampa", state: "FL", zip: "33607", price: 399000, beds: 3, baths: 2, sqft: 1580, taxAnnual: 5580, hoaMonthly: 120, sampleRent: 2700, blurb: "Updated bungalow minutes from downtown. Hardwood floors and a detached studio.", brokerage: "Sunshine Sample Group", agent: "Morgan Demo", hue: 332 },
];

export const partnerListing = (id: string | undefined) => PARTNER_LISTINGS.find((l) => l.id === id);

/** Sample rent for a demo listing, matched by street and ZIP so the widget and the partner view agree. */
export function sampleRentFor(address: string, zip: string): number | undefined {
  const a = address.trim().toLowerCase();
  return PARTNER_LISTINGS.find((l) => l.zip === zip && l.address.toLowerCase() === a)?.sampleRent;
}
