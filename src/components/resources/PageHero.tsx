import Link from "next/link";
export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  actions,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  actions?: { label: string; href: string }[];
  compact?: boolean;
}) {
  return (
    <section
      className={`resource-hero resource-hero-light${compact ? " resource-hero-compact" : ""}`}
    >
      <div className="resource-radar" aria-hidden="true">
        <div className="radar-sweep" />
        <i />
        <i />
        <i />
        <span className="radar-axis" />
        <span className="radar-point point-one" />
        <span className="radar-point point-two" />
        <span className="radar-center" />
      </div>
      <div className="resource-hero-copy">
        <span className="resource-eyebrow">
          <span aria-hidden="true">◉</span>
          {eyebrow}
        </span>
        <h1>
          {title}
          <br />
          <em className={accent.toLowerCase().includes("see the bigger picture") ? "hero-accent-red" : undefined}>{accent}</em>
        </h1>
        <p>{description}</p>
        {actions && (
          <div className="resource-actions">
            {actions.map((a, i) => (
              <Link
                className={
                  i === 0
                    ? "resource-pill"
                    : "resource-pill resource-pill-outline"
                }
                href={a.href}
                key={a.href}
              >
                {a.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <span className="hero-coordinate" aria-hidden="true">
        RE / PERSPECTIVE
      </span>
    </section>
  );
}
export function ResourcePath({ active }: { active: "dscr" | "cashflow" }) {
  return (
    <nav className="resource-path" aria-label="Calculator workflow">
      <Link href="/calculators/">The workbench</Link>
      <Link
        href="/calculators/dscr/"
        aria-current={active === "dscr" ? "page" : undefined}
      >
        <span>01 /</span> Financing <span aria-hidden="true">→</span>
      </Link>
      <Link
        href="/calculators/cash-flow/"
        aria-current={active === "cashflow" ? "page" : undefined}
      >
        <span>02 /</span> Cash flow <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}
