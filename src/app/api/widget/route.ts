import { NextResponse } from "next/server";
import { makeLimiter } from "@/lib/lookup";
import { ProviderError } from "@/lib/providers";
import { quoteWidget, validateWidget } from "@/lib/widget";

/**
 * Quote endpoint for the embeddable broker widget. PRIVATE DEMO: same-origin only, no CORS headers,
 * so it cannot be called from a real broker site yet. Adding CORS is a launch decision, after counsel
 * (RESPA) and MLS display rules are confirmed.
 */
const limiter = makeLimiter(20, 60_000);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter(ip)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const v = validateWidget(await req.json().catch(() => null));
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  try {
    return NextResponse.json(await quoteWidget(v.input));
  } catch (e) {
    console.error("widget quote failed", e instanceof Error ? e.message : e);
    const status = e instanceof ProviderError ? 502 : 500;
    return NextResponse.json({ error: "We could not estimate this property right now." }, { status });
  }
}
