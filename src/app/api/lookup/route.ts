import { NextResponse } from "next/server";
import { lookupAddress, makeDailyCap, makeLimiter, validateLookup } from "@/lib/lookup";
import { ProviderError } from "@/lib/providers";

// A live lookup is a billed HouseCanary rental_value call (about $3.15 each on Griffin's current bill).
// Per-IP speed bump plus a daily ceiling per instance. LIVE_LOOKUP_DAILY_CAP overrides the default of 25.
const allow = makeLimiter(3, 60_000);
const underDailyCap = makeDailyCap(Number(process.env.LIVE_LOOKUP_DAILY_CAP ?? 25));
const isLive = () => (process.env.LOOKUP_RENT_PROVIDER || process.env.RENT_PROVIDER || "fixture") !== "fixture";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) return NextResponse.json({ error: "Too many lookups. Try again in a minute." }, { status: 429 });

  if (isLive() && !underDailyCap()) {
    return NextResponse.json({ error: "Daily lookup limit reached. Try again tomorrow." }, { status: 429 });
  }

  const v = validateLookup(await req.json().catch(() => null));
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  try {
    return NextResponse.json(await lookupAddress(v.input));
  } catch (e) {
    console.error("lookup failed", e instanceof Error ? e.message : e);
    if (e instanceof ProviderError && /no rent estimate/.test(e.message)) {
      return NextResponse.json({ error: "We could not find a rent estimate for that address. Check the street and ZIP." }, { status: 404 });
    }
    return NextResponse.json({ error: "Lookup is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
