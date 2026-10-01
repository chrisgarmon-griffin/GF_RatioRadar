"use client";
import { useState } from "react";
import Link from "next/link";
const steps = [
  {
    name: "Explore",
    title: "Start with a property.",
    copy: "Apply one financing scenario across the collection. Compare price, rent and the modeled ratio before focusing on a property.",
    takeaway: "A short list, built around your assumptions.",
    tags: ["Market & budget", "Side-by-side comparison", "Sample rent range"],
    href: "/",
    cta: "Explore properties",
    note: "The explorer currently shows fictional listings and illustrative photography, not an active listing feed.",
    visual: ["PRICE", "RENT", "RATIO"],
  },
  {
    name: "Model",
    title: "Make the assumptions yours.",
    copy: "Carry a property into the DSCR calculator. Enter monthly taxes, insurance, HOA and flood costs, then compare purchase or refinance and payment structures.",
    takeaway: "A financing scenario with its inputs in view.",
    tags: [
      "Purchase or refinance",
      "Long-term or short-term rent",
      "Principal + interest or IO",
    ],
    href: "/calculators/dscr/",
    cta: "Open DSCR calculator",
    note: "The explorer includes supplied HOA; unknown HOA is modeled at $0 and flagged. Flood costs are excluded. The detailed calculator asks you to enter them. Rates and program availability require verification.",
    visual: ["RENT", "HOUSING COST", "DSCR"],
  },
  {
    name: "Evaluate",
    title: "Look beyond the payment.",
    copy: "Continue to cash flow with your modeled loan payment. Add vacancy, management, maintenance and other operating costs to see the investment economics.",
    takeaway: "The costs behind the headline ratio.",
    tags: ["Net operating income", "Monthly cash flow", "Cash-on-cash return"],
    href: "/calculators/cash-flow/",
    cta: "Open cash-flow calculator",
    note: "Review invested cash: a purchase handoff starts with down payment only. Add closing costs and improvements. A financing ratio alone does not establish profitability.",
    visual: ["INCOME", "EXPENSES", "CASH FLOW"],
  },
  {
    name: "Review",
    title: "Bring the context to Griffin.",
    copy: "Print your scenario and review checklist. A loan officer and human underwriter can assess the rental evidence, property, costs and applicable investor requirements.",
    takeaway: "A prepared conversation, with questions identified.",
    tags: [
      "Rental documentation",
      "Value, credit & reserves",
      "Terms & final pricing",
    ],
    href: "https://griffinfunding.com/full-page-form-quick-quote/",
    cta: "Talk to Griffin",
    note: "Calculators do not issue approvals or denials. The external contact link does not send your calculator inputs.",
    visual: ["SCENARIO", "EVIDENCE", "HUMAN REVIEW"],
  },
];
export function Workflow() {
  const [active, setActive] = useState(0);
  const s = steps[active];
  return (
    <section
      className="workflow-panel"
      id="workflow"
      aria-labelledby="workflow-title"
    >
      <div className="resource-section-heading">
        <div>
          <span className="resource-label">THE PROCESS</span>
          <h2 id="workflow-title">One step closer to clarity.</h2>
        </div>
        <p>Select a step to see what happens next.</p>
      </div>
      <div className="workflow-layout">
        <div className="workflow-controls" aria-label="Choose a workflow step">
          {steps.map((x, i) => (
            <button
              key={x.name}
              aria-pressed={active === i}
              aria-controls="workflow-detail"
              onClick={() => setActive(i)}
            >
              <span>0{i + 1}</span>
              <span>{x.name}</span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <div className="workflow-detail" id="workflow-detail">
          <div className="workflow-visual" aria-hidden="true">
            {s.visual.map((x, i) => (
              <div key={x}>
                <span className="workflow-node">
                  {i === 0 ? "◉" : i === 1 ? "≋" : "↗"}
                </span>
                <small>{x}</small>
              </div>
            ))}
          </div>
          <div className="workflow-copy">
            <span className="resource-label">
              STEP 0{active + 1} / {s.name}
            </span>
            <h3>{s.title}</h3>
            <p>{s.copy}</p>
            <ul className="resource-tags">
              {s.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="workflow-takeaway">
              <span>YOU LEAVE WITH</span>
              <p>{s.takeaway}</p>
            </div>
            <Link className="resource-inline-link" href={s.href}>
              {s.cta} <span aria-hidden="true">↗</span>
            </Link>
            <p className="resource-fine">{s.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
