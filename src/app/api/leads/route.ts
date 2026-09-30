import { NextResponse } from "next/server";
import { saveLead, validateLead } from "@/lib/leads";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // Honeypot: bots fill the hidden field. Pretend success.
  if (body && typeof body === "object" && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  const result = validateLead(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  await saveLead(result.lead);
  return NextResponse.json({ ok: true }, { status: 201 });
}
