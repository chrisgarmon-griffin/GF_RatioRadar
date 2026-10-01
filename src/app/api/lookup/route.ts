import { NextResponse } from "next/server";
import { lookupAddress, makeLimiter, validateLookup } from "@/lib/lookup";
import { ProviderError } from "@/lib/providers";

// Each live lookup is a billed HouseCanary call. Keep a per-IP speed bump even behind login.
const allow = makeLimiter(10, 60_000);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) return NextResponse.json({ error: "Too many lookups. Try again in a minute." }, { status: 429 });

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
