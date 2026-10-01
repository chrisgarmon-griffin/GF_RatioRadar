/**
 * One-off live check of the HouseCanary rent adapter. Prints the parsed estimate for one address.
 *
 *   HOUSECANARY_API_KEY=... HOUSECANARY_API_SECRET=... \
 *     npx tsx scripts/check-housecanary.ts "123 Main St" "San Francisco" CA 94105
 *
 * Test keys only work with the addresses on HouseCanary's "Test Lists" docs page.
 * A production key bills per call. Run once, not in a loop.
 */
import { createHouseCanaryRent } from "../src/lib/providers/housecanary";

const [address, city, state, zip] = process.argv.slice(2);
const key = process.env.HOUSECANARY_API_KEY;
const secret = process.env.HOUSECANARY_API_SECRET;
if (!address || !city || !state || !zip || !key || !secret) {
  console.error('Usage: HOUSECANARY_API_KEY=.. HOUSECANARY_API_SECRET=.. npx tsx scripts/check-housecanary.ts "<street>" "<city>" <ST> <zip>');
  process.exit(1);
}

const provider = createHouseCanaryRent({ key, secret });
provider
  .estimate({ id: "check", address, city, state, zip, price: 0, beds: 0, baths: 0, sqft: 0, propertyType: "SFR", daysOnMarket: 0, photoUrl: null, source: "check" })
  .then((r) => console.log(JSON.stringify(r, null, 2)))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(2);
  });
