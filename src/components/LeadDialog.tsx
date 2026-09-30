"use client";

import { useEffect, useRef, useState } from "react";
import type { SearchParams, SearchRow } from "@/lib/search";
import { money, pct, ratio } from "@/lib/format";

const PREQUAL_URL = process.env.NEXT_PUBLIC_PREQUAL_URL;

function utmFromLocation() {
  const out: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((v, k) => {
    if (k.startsWith("utm_")) out[k] = v;
  });
  return out;
}

export function LeadDialog({
  row,
  params,
  onClose,
}: {
  row: SearchRow | null;
  params: SearchParams;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [stored, setStored] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (row && !d.open) {
      setStatus("idle");
      setError(null);
      d.showModal();
    }
    if (!row && d.open) d.close();
  }, [row]);

  const summary = row
    ? `${row.listing.address}, ${row.listing.city}, ${row.listing.state} ${row.listing.zip}. ${money(row.listing.price)}. DSCR ${ratio(row.dscr)} at ${pct(params.downPct)} down.`
    : "";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!row) return;
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        website: f.get("website"),
        consent: f.get("consent") === "on",
        listingId: row.listing.id,
        listingSummary: summary,
        search: params,
        utm: utmFromLocation(),
        referrer: document.referrer,
      }),
    }).catch(() => null);
    if (res?.ok) {
      setStored((await res.json().catch(() => null))?.stored !== false);
      setStatus("done");
    } else {
      setStatus("idle");
      setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Try again.");
    }
  }

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="lead-title">
      {row && (
        <div className="dlg">
          {status === "done" ? (
            <>
              <h2 id="lead-title">{stored ? "Thanks. A loan officer will reach out." : "Demo mode: nothing was sent."}</h2>
              <p className="sub">
                {stored
                  ? "We have your request for this property. Ratio Radar figures are estimates, and a loan officer will confirm the real numbers with you."
                  : "This is a preview with sample listings. Your details were checked but not saved, and no one will contact you."}
              </p>
              <div className="row">
                {PREQUAL_URL && (
                  <a className="btn btn-primary" href={PREQUAL_URL} target="_blank" rel="noopener">
                    start your application
                  </a>
                )}
                <button className="btn btn-outline" type="button" onClick={onClose}>
                  close
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={submit} className="dlg" style={{ padding: 0 }}>
              <h2 id="lead-title">Check my loan options</h2>
              <p className="sub">Tell us how to reach you and a Griffin loan officer will review this property with you.</p>
              <div className="sum">{summary}</div>
              <div className="field">
                <label htmlFor="ld-name">Full name</label>
                <input id="ld-name" name="name" type="text" autoComplete="name" required />
              </div>
              <div className="field">
                <label htmlFor="ld-email">Email</label>
                <input id="ld-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="field">
                <label htmlFor="ld-phone">Mobile phone</label>
                <input id="ld-phone" name="phone" type="tel" autoComplete="tel" required />
              </div>
              <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <label className="check consent" style={{ alignItems: "flex-start" }}>
                <input type="checkbox" name="consent" required />
                <span>
                  I agree that Griffin Funding may contact me by phone, text and email about this request, including
                  with automated technology. Consent is not a condition of any loan. Message and data rates may apply.
                </span>
              </label>
              {error && <p className="err" role="alert">{error}</p>}
              <div className="row">
                <button className="btn btn-outline" type="button" onClick={onClose}>
                  cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "sending" : "send request"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </dialog>
  );
}
