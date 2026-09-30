import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { DEMO } from "./config";

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

export interface SaveResult {
  stored: boolean;
  where: "webhook" | "file" | "none";
}

/**
 * Lead sink, in order of preference:
 * 1. Demo mode: validate only, store nothing, even when a webhook is configured.
 * 2. LEAD_WEBHOOK_URL: POST the lead as JSON (CRM, Zapier, LOS intake).
 * 3. Local development: append to .data/leads.jsonl.
 * Serverless hosts have no durable disk, so production without a webhook throws instead of losing leads.
 * The attribution fields (listing, search state, UTM) are the point of capturing here.
 */
export async function saveLead(lead: LeadInput): Promise<SaveResult> {
  if (DEMO) return { stored: false, where: "none" };
  const row = { ...lead, receivedAt: new Date().toISOString() };
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(`Lead webhook responded ${res.status}`);
    return { stored: true, where: "webhook" };
  }
  if (process.env.VERCEL) throw new Error("No durable lead store configured. Set LEAD_WEBHOOK_URL.");
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(row) + "\n", "utf8");
  return { stored: true, where: "file" };
}
