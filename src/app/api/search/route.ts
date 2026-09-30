import { NextResponse } from "next/server";
import { runSearch, type SearchParams } from "@/lib/search";

const VALID_STATES = ["CA", "TX", "FL"];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<SearchParams> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const states = (body.states ?? VALID_STATES).filter((s) => VALID_STATES.includes(s));
  const downPct = Number(body.downPct ?? 0.2);
  if (!states.length || !(downPct >= 0.2 && downPct <= 0.5)) {
    return NextResponse.json({ error: "Invalid states or downPct (0.20 to 0.50)" }, { status: 400 });
  }

  const result = await runSearch({
    states,
    minPrice: body.minPrice,
    maxPrice: body.maxPrice,
    mode: body.mode === "inverse" ? "inverse" : "forward",
    interestOnly: Boolean(body.interestOnly),
    fortyYear: Boolean(body.fortyYear) && !body.interestOnly,
    downPct,
  });
  return NextResponse.json(result);
}
