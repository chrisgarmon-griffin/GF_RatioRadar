import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/newsreader";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { DEMO } from "@/lib/config";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Ratio Radar | Find Investment Properties by DSCR",
  description:
    "Search homes for sale by DSCR. See the ratio for every property at 20% down, then see what interest-only, a 40-year term, or a larger down payment does to reach 1.0.",
  robots: DEMO ? { index: false, follow: false } : undefined,
  openGraph: {
    title: "Ratio Radar | Find Investment Properties by DSCR",
    description:
      "See the DSCR on every listing and what it takes to reach 1.0.",
    type: "website",
    images: [
      {
        url: "/brand/griffin-wings.png",
        width: 2078,
        height: 1310,
        alt: "Griffin Funding",
      },
    ],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
