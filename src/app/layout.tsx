import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ratio Radar | DSCR Property Search",
  description:
    "Find investment properties by DSCR ratio. See which listings hit 1.0 at 20% down, and what interest-only, 40-year, or more down does to the ratio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
