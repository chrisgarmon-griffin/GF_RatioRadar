import { NextResponse } from "next/server";
import { runSearch, type SearchParams } from "@/lib/search";

const VALID_STATES = ["CA", "TX", "FL"];
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined);

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const states = (Array.isArray(body.states) ? body.states : VALID_STATES).filter(
    (s): s is string => typeof s === "string" && VALID_STATES.includes(s),
  );
  const downPct = Number(body.downPct ?? 0.2);
  const zip = typeof body.zip === "string" && /^\d{1,5}$/.test(body.zip) ? body.zip : undefined;
  if (!states.length || !(downPct >= 0.2 && downPct <= 0.5)) {
    return NextResponse.json({ error: "Invalid states or down payment (20% to 50%)" }, { status: 400 });
  }

  const params: SearchParams = {
    states,
    zip,
    minPrice: num(body.minPrice),
    maxPrice: num(body.maxPrice),
    mode: body.mode === "inverse" ? "inverse" : "forward",
    interestOnly: body.interestOnly === true,
    fortyYear: body.fortyYear === true && body.interestOnly !== true,
    downPct,
  };
  try {
    return NextResponse.json(await runSearch(params));
  } catch (e) {
    console.error("search failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Search is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
