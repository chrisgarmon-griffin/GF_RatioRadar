import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
  listingId?: string;
  listingSummary?: string;
  search?: Record<string, unknown>;
  utm?: Record<string, string>;
  referrer?: string;
}

export type LeadValidation = { ok: true; lead: LeadInput } | { ok: false; error: string };

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function validateLead(body: unknown): LeadValidation {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request" };
  const b = body as Record<string, unknown>;
  const name = clean(b.name, 120);
  const email = clean(b.email, 200);
  const phone = clean(b.phone, 30);
  if (name.length < 2) return { ok: false, error: "Enter your name" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "Enter a valid email" };
  if (phone.replace(/\D/g, "").length < 10) return { ok: false, error: "Enter a 10-digit phone number" };
  if (b.consent !== true) return { ok: false, error: "Consent is required to contact you" };

  const utm: Record<string, string> = {};
  if (b.utm && typeof b.utm === "object") {
    for (const [k, v] of Object.entries(b.utm as Record<string, unknown>)) {
      if (/^utm_[a-z]+$/.test(k) && typeof v === "string") utm[k] = v.slice(0, 200);
    }
  }
  return {
    ok: true,
    lead: {
      name,
      email,
      phone,
      consent: true,
      listingId: clean(b.listingId, 80) || undefined,
      listingSummary: clean(b.listingSummary, 300) || undefined,
      search: b.search && typeof b.search === "object" ? (b.search as Record<string, unknown>) : undefined,
      utm,
      referrer: clean(b.referrer, 300) || undefined,
    },
  };
}

/**
 * Lead sink. Default writes JSON lines to .data/leads.jsonl for local and pilot use.
 * Replace with the LOS / CRM handoff; the attribution fields (listing, search state, UTM)
 * are the point of capturing here.
 */
export async function saveLead(lead: LeadInput): Promise<void> {
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  const row = { ...lead, receivedAt: new Date().toISOString() };
  await appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(row) + "\n", "utf8");
}
