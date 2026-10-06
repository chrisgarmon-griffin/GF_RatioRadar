/**
 * One-off live check of the RentCast rent adapter. Prints the parsed estimate for one address.
 *
 *   RENTCAST_API_KEY=... npx tsx scripts/check-rentcast.ts "<street>" <zip> "<city>" <ST> [beds baths sqft]
 *
 * The free Developer plan includes 50 requests a month. Run once per address, not in a loop.
 * Pass beds, baths and sqft when you know them: RentCast uses them to pick comparables.
 */
import { createRentCastRent } from "../src/lib/providers/rentcast";

const [address, zip, city = "", state = "", beds = "0", baths = "0", sqft = "0"] = process.argv.slice(2);
const apiKey = process.env.RENTCAST_API_KEY;
if (!address || !zip || !apiKey) {
  console.error('Usage: RENTCAST_API_KEY=.. npx tsx scripts/check-rentcast.ts "<street>" <zip> "<city>" <ST> [beds baths sqft]');
  process.exit(1);
}

createRentCastRent({ apiKey })
  .estimate({ id: "check", address, city, state, zip, price: 0, beds: Number(beds), baths: Number(baths), sqft: Number(sqft), propertyType: "SFR", daysOnMarket: 0, photoUrl: null, source: "check" })
  .then((r) => console.log(JSON.stringify(r, null, 2)))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(2);
  });
