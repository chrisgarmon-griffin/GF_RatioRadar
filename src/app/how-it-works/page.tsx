import Link from "next/link";
import { PageHero } from "@/components/resources/PageHero";
import { Workflow } from "@/components/resources/Workflow";
export const metadata = { title: "How It Works | Griffin Funding RatioRadar" };
export default function Page() {
  return (
    <main className="wrap resource-page">
      <PageHero
        eyebrow="from a property to a conversation"
        title="Find your perspective."
        accent="Build your plan."
        description="A connected path from property exploration to financing, cash flow and a more informed conversation with Griffin."
        actions={[
          { label: "Explore the process", href: "#workflow" },
          { label: "Search properties", href: "/" },
        ]}
      />
      <Workflow />
      <section className="resource-bottom-grid">
        <div className="resource-note-card">
          <span className="resource-label">CONNECTED, WITH YOUR CONTROL</span>
          <h2>Your scenario travels with you.</h2>
          <p>
            Property details can carry into DSCR, and DSCR can carry into cash
            flow. Each handoff happens only when you choose it. Missing costs
            stay blank until you enter them.
          </p>
          <Link href="/calculators/" className="resource-inline-link">
            Explore the workbench ↗
          </Link>
        </div>
        <div className="resource-note-card resource-note-ice">
          <span className="resource-label">PREPARED FOR HUMAN REVIEW</span>
          <h2>Keep the evidence close.</h2>
          <p>
            Bring rental documentation, property costs and your financing
            assumptions. Print the calculator’s scenario and checklist to make
            the next conversation concrete.
          </p>
          <p className="resource-fine">
            Inputs stay in your browser. Handoffs use one-time session storage
            and expire after 20 minutes. External contact links do not transmit
            those inputs.
          </p>
        </div>
      </section>
    </main>
  );
}
