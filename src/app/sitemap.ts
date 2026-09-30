import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    "",
    "/calculators",
    "/calculators/dscr",
    "/calculators/cash-flow",
    "/how-it-works",
    "/dscr-guide",
  ].map((path) => ({
    url: site + path,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
