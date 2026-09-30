import type { Metadata, Viewport } from "next";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Ratio Radar | Find Investment Properties by DSCR",
  description:
    "Search homes for sale by DSCR. See the ratio for every property at 20% down, then see what interest-only, a 40-year term, or a larger down payment does to reach 1.0.",
  openGraph: {
    title: "Ratio Radar | Find Investment Properties by DSCR",
    description: "See the DSCR on every listing and what it takes to reach 1.0.",
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
