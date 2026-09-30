import { describe, expect, it } from "vitest";
import { validateLead } from "./leads";

const good = { name: "Ada Lovelace", email: "ada@example.com", phone: "(559) 555-0142", consent: true };

describe("validateLead", () => {
  it("accepts a complete lead and keeps only utm_ keys", () => {
    const r = validateLead({ ...good, utm: { utm_source: "seo", evil: "x" } });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.lead.utm).toEqual({ utm_source: "seo" });
  });
  it("requires consent", () => {
    expect(validateLead({ ...good, consent: false })).toEqual({ ok: false, error: "Consent is required to contact you" });
  });
  it("rejects bad email and short phone", () => {
    expect(validateLead({ ...good, email: "nope" }).ok).toBe(false);
    expect(validateLead({ ...good, phone: "555" }).ok).toBe(false);
  });
  it("rejects non-objects", () => {
    expect(validateLead(null).ok).toBe(false);
  });
});
