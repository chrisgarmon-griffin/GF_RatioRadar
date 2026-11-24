import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Browsers only load cross-origin fonts with this header. Needed once the widget runs on another site.
  async headers() {
    return [{ source: "/widget-fonts/:file*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] }];
  },
};

export default nextConfig;
