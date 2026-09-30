"use client";
import { Specialists } from "./Specialists";
import { MotionLayer } from "./MotionLayer";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
function Brand() {
  return (
<Link
            className="revestor-brand"
            href="/"
          >
            <Image
              src="/brand/griffin-wings.png"
              width={2078}
              height={1310}
              alt=""
              priority
              sizes="64px"
            />
            <span className="revestor-wordmark">
              <span className="revestor-parent">Griffin Funding{" "}</span>
              <span className="revestor-name">
                <span>RE</span>vestor
              </span>
            </span>
            <span className="sr-only"> home</span>
          </Link>
  );
}
const links = [
  ["/", "Properties"],
  ["/calculators/", "Calculators"],
  ["/how-it-works/", "How it works"],
  ["/dscr-guide/", "DSCR guide"],
];
export function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname().replace(/\/$/, "") || "/";
  return (
    <>
      <MotionLayer />
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="rr-header">
        <div className="wrap rr-navigation">
          <Brand />
          <nav aria-label="Primary">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  path === (href.replace(/\/$/, "") || "/") ||
                  (href !== "/" && path.startsWith(href))
                    ? "page"
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
          </nav>
          <a
            className="rr-contact"
            href="https://griffinfunding.com/full-page-form-quick-quote/"
          >
            Talk to Griffin ↗
          </a>
        </div>
      </header>
      <div id="content">{children}</div>
      {(path === "/" || path === "/calculators") && <Specialists />}
      <footer className="griffin-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand-column">
            <Brand />
            <p className="footer-tagline">Property perspective. Financing clarity.</p>
            <div className="footer-disclosures">
              <p>Decision support only. Estimates are not a loan offer, rate quote,
                or credit decision. A human underwriter must review the full scenario.</p>
              <p>Property explorer listings, rents and photography are illustrative.
                {" "}<a href="/image-credits.txt">Image sources</a>.</p>
              <p>© {new Date().getFullYear()} Griffin Funding · NMLS #1120111 · Equal Housing Opportunity.</p>
            </div>
          </div>
          <div className="footer-link-column">
            <h3>EXPLORE</h3>
            {links.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </div>
          <div className="footer-link-column footer-contact-column">
            <h3>CONTACT</h3>
            <a href="tel:8553948288">(855) 394-8288</a>
            <a href="https://griffinfunding.com/contact-us/">Contact Griffin ↗</a>
            <a href="https://griffinfunding.com/">GriffinFunding.com ↗</a>
            <address>2445 5th Avenue, Suite 401<br />San Diego, CA 92101</address>
          </div>
          <div className="footer-link-column footer-legal-column">
            <h3>LEGAL</h3>
            {[
              ["privacy-policy", "Privacy"],
              ["terms-of-use", "Terms"],
              ["cookie-policy", "Cookies"],
              ["state-licensing", "Licensing"],
            ].map(([slug, label]) => (
              <a key={slug} href={"https://griffinfunding.com/" + slug + "/"}>{label}</a>
            ))}
          </div>
        </div>
        <div className="footer-skyline" aria-hidden="true">
          <Image
            src="/brand/footer-reference.png"
            alt=""
            width={1672}
            height={941}
          />
        </div>
      </footer>
    </>
  );
}
