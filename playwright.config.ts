import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 3,
  retries: 0,
  timeout: 30000,
  reporter: [
    ["list"],
    ["json", { outputFile: "verification/browser-results.json" }],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL ?? "http://localhost:3123",
    viewport: { width: 1440, height: 1000 },
    browserName: "chromium",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  outputDir: "test-results",
});
