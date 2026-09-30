"use client";
import Image from "next/image";
import { useState } from "react";
import specialists from "@/lib/specialists.json";

export const REVIEWS_URL = "https://griffinfundingreviews.com/";
export const APPLICATION_URL = "https://apply.griffinfunding.com/";
function SpecialistCard({ person }: { person: (typeof specialists)[number] }) {
  return <article className="specialist-card">
    <div className="specialist-identity">
      {person.image ? <Image src={person.image} width={64} height={64} alt="" /> : <span className="specialist-initials" aria-hidden="true">{person.name.split(" ").slice(0,2).map(n=>n[0]).join("")}</span>}
      <div><h3>{person.name}</h3><p>{person.role}</p><small>{person.office}{person.nmls ? ` · NMLS #${person.nmls}` : ""}</small></div>
    </div>
    <span className="specialist-tag">DSCR</span>
    <p className="specialist-bio">{person.tags.join(" · ")}. Explore your property financing scenario with {person.name.split(" ")[0]}.</p>
    <div className="specialist-links">
      {person.phone && <a href={`tel:+1${person.phone.replace(/\D/g, "")}`}>Call {person.name.split(" ")[0]}</a>}
      {person.email && <a href={`mailto:${person.email}`}>Email</a>}
      <a href={person.profile} target="_blank" rel="noopener noreferrer">Full bio ↗</a>
    </div>
    <a className="specialist-apply" href={APPLICATION_URL} target="_blank" rel="noopener noreferrer">Start Griffin application ↗</a>
  </article>;
}
export function Specialists({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(specialists[0].slug);
  return <section className={`specialists ${compact ? "specialists-compact" : "wrap"}`} aria-label="DSCR specialists">
    <div className="specialists-heading"><div><span className="section-kicker">FROM SCENARIO TO CONVERSATION</span><h2>Numbers first. People next.</h2><p>Meet Griffin team members whose roster highlights DSCR lending.</p></div><a className="reviews-link" href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">Read Griffin client reviews ↗<small>Griffin’s company-owned review site</small></a></div>
    {compact ? <><label className="specialist-select">Choose a DSCR specialist<select value={selected} onChange={e=>setSelected(e.target.value)}>{specialists.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label><SpecialistCard person={specialists.find(p=>p.slug===selected)!} /></> : <><div className="specialist-grid">{specialists.slice(0,3).map(p=><SpecialistCard key={p.slug} person={p}/>)}</div><details className="specialist-more"><summary>Meet all {specialists.length} DSCR specialists</summary><div className="specialist-grid">{specialists.slice(3).map(p=><SpecialistCard key={p.slug} person={p}/>)}</div></details></>}
    <p className="specialist-disclosure">Review your estimated scenario above before applying. The application opens in a new tab. Calculator inputs and your specialist selection are not transferred automatically; tell Griffin which specialist you would like to work with. State licensing, property eligibility and terms require human review.</p>
  </section>;
}
