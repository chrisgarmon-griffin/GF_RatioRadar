"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
function Brand() {
  return (
    <Link
      className="griffin-brand"
      href="/"
      aria-label="Griffin Funding RatioRadar home"
    >
      <Image
        src="/brand/griffin-wings.png"
        width={78}
        height={49}
        alt=""
        priority
      />
      <span>
        GRIFFIN FUNDING<small>ratioradar</small>
      </span>
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
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setTime(new Date()), 0);
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return (
    <>
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
      <footer className="griffin-footer">
        <div className="wrap footer-grid">
          <div>
            <Brand />
            <p>
              Property perspective. Financing clarity.
              <br />
              Explore the numbers behind your next investment.
            </p>
            <div className="office-clocks">
              {[
                ["San Diego", "America/Los_Angeles", "HEADQUARTERS"],
                ["Scottsdale", "America/Phoenix", "ARIZONA"],
                ["Irvine", "America/Los_Angeles", "ORANGE COUNTY"],
                ["Incline Village", "America/Los_Angeles", "NEVADA"],
              ].map(([city, tz, label]) => (
                <div key={city}>
                  <time>
                    {time
                      ? new Intl.DateTimeFormat("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: tz,
                        }).format(time)
                      : "—"}
                  </time>
                  <span>{city}</span>
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>EXPLORE</h3>
            {links.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
            <a href="https://griffinfunding.com/contact-us/">
              Contact Griffin ↗
            </a>
          </div>
          <div>
            <h3>LEGAL</h3>
            {[
              ["privacy-policy", "Privacy"],
              ["terms-of-use", "Terms"],
              ["cookie-policy", "Cookies"],
              ["state-licensing", "Licensing"],
            ].map(([slug, label]) => (
              <a key={slug} href={"https://griffinfunding.com/" + slug + "/"}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="wrap footer-fine">
          <p>
            © {new Date().getFullYear()} GRIFFIN FUNDING · NMLS #1120111 ·{" "}
            <a href="https://griffinfunding.com/">GRIFFINFUNDING.COM</a> ·{" "}
            <a href="tel:8553948288">(855) 394-8288</a>
          </p>
          <p>
            2445 5th Avenue, Suite 401, San Diego, CA 92101. Equal Housing
            Opportunity.
          </p>
          <p>
            Decision support only. Estimates are not a loan offer, rate quote,
            or credit decision. A human underwriter must review the full
            scenario. Property explorer listings, rents and photography are
            illustrative. <a href="/image-credits.txt">Image sources</a>.
          </p>
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
