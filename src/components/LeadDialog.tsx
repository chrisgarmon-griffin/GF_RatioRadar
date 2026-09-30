"use client";
import { useRef, useState, useEffect } from "react";
import type { SearchParams, SearchRow } from "@/lib/search";
import { money, pct, ratio } from "@/lib/format";
import { DEMO } from "@/lib/config";
import { Modal } from "./Modal";
import { Icon } from "./Icon";
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
  row: SearchRow;
  params: SearchParams;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [stored, setStored] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const summary = `${row.listing.address}, ${row.listing.city}, ${row.listing.state} ${row.listing.zip}. ${money(row.listing.price)}. DSCR ${ratio(row.dscr)} at ${pct(params.downPct)} down.`;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    setError(null);
    const ctrl = new AbortController();
    pending.current = ctrl;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        signal: ctrl.signal,
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
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Please try again.");
      setStored(body.stored === true);
      setStatus("done");
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setStatus("idle");
      setError(
        e instanceof Error
          ? e.message
          : "We could not send your request. Please try again.",
      );
    }
  }
  return (
    <Modal title="GRIFFIN FUNDING / SCENARIO REVIEW" onClose={onClose}>
      <div className="lead-content">
        {status === "done" ? (
          <>
            <span className="success-icon">
              <Icon name="check" />
            </span>
            <h2>
              {stored
                ? "Your request is with Griffin."
                : "Preview complete. Nothing was sent."}
            </h2>
            <p>
              {stored
                ? "A loan officer will review the property and your scenario with you. Estimates remain subject to verification."
                : "Your details were validated but not saved. No request was sent and no one will contact you."}
            </p>
            <div className="row">
              {stored && PREQUAL_URL && (
                <a
                  className="btn btn-primary"
                  href={PREQUAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start your application <Icon name="diagonal" />
                </a>
              )}
              <button className="btn btn-ink" onClick={onClose}>
                Back to properties
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <h2>
              Bring your next move
              <br />
              into focus.
            </h2>
            <p>
              {DEMO
                ? "Try the review form. This preview does not save your details or contact a loan officer."
                : "Share your details so a Griffin loan officer can review this property and scenario with you."}
            </p>
            <div className="lead-summary">
              <Icon name="home" />
              <div>
                <strong>{row.listing.address}</strong>
                <span>
                  {row.listing.city}, {row.listing.state} ·{" "}
                  {money(row.listing.price)}
                </span>
                <small>
                  Est. DSCR {ratio(row.dscr)}× · {pct(params.downPct)} down
                </small>
              </div>
            </div>
            <div className="field">
              <label htmlFor="ld-name">Full name</label>
              <input
                id="ld-name"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                placeholder="Your name"
              />
            </div>
            <div className="field">
              <label htmlFor="ld-email">Email address</label>
              <input
                id="ld-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={200}
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label htmlFor="ld-phone">Phone number</label>
              <input
                id="ld-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                maxLength={30}
                placeholder="(555) 555-0100"
              />
            </div>
            <input
              className="hp"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <label className="check consent">
              <input type="checkbox" name="consent" required />
              <span>
                I agree that Griffin Funding may contact me by phone, text and
                email about this request, including with automated technology.
                Consent is not a condition of any loan. Message and data rates
                may apply.
              </span>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="btn btn-primary full"
              type="submit"
              disabled={status === "sending"}
            >
              {status === "sending"
                ? "Checking your request…"
                : DEMO
                  ? "Try the preview form"
                  : "Request a scenario review"}
              <Icon name="arrow" />
            </button>
            <p className="hint">
              Decision support only. A human underwriter reviews any loan
              application.
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
}
