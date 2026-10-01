/**
 * One-off live check of the HouseCanary rent adapter. Prints the parsed estimate for one address.
 *
 *   HOUSECANARY_API_KEY=... HOUSECANARY_API_SECRET=... \
 *     npx tsx scripts/check-housecanary.ts "<street>" <zip> ["<city>" <ST>]
 *
 * Test keys only work with addresses returned by GET /v2/property/test_addresses (called with the test key).
 * A production key bills per call. Run once, not in a loop.
 */
import { createHouseCanaryRent } from "../src/lib/providers/housecanary";

const [address, zip, city = "", state = ""] = process.argv.slice(2);
const key = process.env.HOUSECANARY_API_KEY;
const secret = process.env.HOUSECANARY_API_SECRET;
if (!address || !zip || !key || !secret) {
  console.error('Usage: HOUSECANARY_API_KEY=.. HOUSECANARY_API_SECRET=.. npx tsx scripts/check-housecanary.ts "<street>" <zip> ["<city>" <ST>]');
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
