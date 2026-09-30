import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const ready = async (page: import("@playwright/test").Page) => {
  await expect(page.locator(".property-card")).toHaveCount(5);
  await expect(page.locator(".result-count")).toHaveText("5 properties");
};
test("gallery renders real images, has no console errors, and passes accessibility checks", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await ready(page);
  await page
    .locator(".property-card img")
    .first()
    .evaluate((img: HTMLImageElement) => img.decode());
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  for (const img of await page.locator(".property-card img").all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((el: HTMLImageElement) => el.decode());
  }
  expect(
    await page
      .locator(".property-card img")
      .evaluateAll((imgs) =>
        imgs.every((img) => (img as HTMLImageElement).naturalWidth > 0),
      ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "verification/desktop-1440.png",
    fullPage: true,
  });
  await page.screenshot({ path: "verification/desktop-viewport.png" });
  await page.evaluate(() => window.scrollTo(0, 430));
  await page.screenshot({ path: "verification/gallery-detail.png" });
  await page.evaluate(() => window.scrollTo(0, 0));
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  expect(errors).toEqual([]);
});
test("market and price filters submit together; zero results reset correctly", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await page.getByLabel("Where are you looking?").selectOption("TX");
  await page.getByLabel("Purchase budget").selectOption("300000");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.locator(".property-card")).toHaveCount(2);
  await expect(page).toHaveURL(/states=TX/);
  await expect(page.locator(".property-location").first()).toContainText("TX");
  await page.getByLabel("Narrow your search").fill("99999");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No properties in this view." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset search" }).click();
  await ready(page);
});
test("financing recalculates ratios, respects mutually exclusive terms and inverse cap", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  const baseline = await page
    .locator(".ratio-metric strong")
    .first()
    .innerText();
  await page
    .getByRole("button", { name: "Interest-only", exact: true })
    .click();
  await expect(page).toHaveURL(/io=1/);
  await expect(page.locator(".result-count")).toHaveText("5 properties");
  expect(
    await page.locator(".ratio-metric strong").first().innerText(),
  ).not.toBe(baseline);
  await page.getByRole("button", { name: "40-year", exact: true }).click();
  await expect(page).toHaveURL(/y40=1/);
  await expect(page).not.toHaveURL(/io=1/);
  await expect(
    page.getByRole("button", { name: "Interest-only", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByLabel("Down payment", { exact: true }).selectOption("0.35");
  await page.getByRole("switch", { name: "Find 1.0+ scenarios" }).click();
  await expect(page.locator(".result-count")).not.toHaveText("Loading…");
  for (const value of await page
    .locator(".ratio-metric strong")
    .allTextContents())
    expect(parseFloat(value)).toBeGreaterThanOrEqual(1);
});
test("comparison limits selections, opens accessible dialog and clears after scenario change", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  for (let i = 0; i < 3; i++)
    await page.locator(".compare-toggle").nth(i).click();
  await expect(page.locator(".compare-toggle").nth(3)).toBeDisabled();
  await page
    .locator(".compare-dock")
    .getByRole("button", { name: "Compare", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".comparison-table thead th")).toHaveCount(4);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({ path: "verification/comparison-desktop.png" });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Down payment", { exact: true }).selectOption("0.25");
  await expect(page.locator(".compare-dock")).toHaveCount(0);
});
test("scenario breakdown matches displayed ratio and supports a demo review with attribution", async ({
  page,
}) => {
  await page.goto("/?utm_source=design-qa&down=0.3");
  await ready(page);
  await page
    .getByRole("button", { name: "View scenario", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".scenario-ratio")).toContainText("30% down");
  await expect(page.locator(".breakdown")).toContainText(
    "Modeled housing payment",
  );
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({ path: "verification/scenario-desktop.png" });
  await page
    .getByRole("button", { name: "Request a scenario review", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(
    page.getByText("Try the review form.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Full name").fill("Preview Tester");
  await page.getByLabel("Email address").fill("preview@example.com");
  await page.getByLabel("Phone number").fill("2025550123");
  await page.getByRole("checkbox").check();
  const reqPromise = page.waitForRequest(
    (r) => r.url().endsWith("/api/leads") && r.method() === "POST",
  );
  await page.getByRole("button", { name: "Try the preview form" }).click();
  const payload = (await reqPromise).postDataJSON();
  expect(payload.utm.utm_source).toBe("design-qa");
  expect(payload.search.downPct).toBe(0.3);
  expect(payload.listingId).toBeTruthy();
  await expect(
    page.getByRole("heading", { name: "Preview complete. Nothing was sent." }),
  ).toBeVisible();
});
test("table sorting and sharing retain scenario and campaign parameters", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?states=TX&down=0.25&utm_source=qa");
  await expect(page.locator(".property-card")).toHaveCount(4);
  await page.getByLabel("Sort properties").selectOption("price-low");
  await page.getByRole("button", { name: "Table view" }).click();
  await expect(page.locator(".results-table tbody tr")).toHaveCount(4);
  await expect(page.locator(".results-table tbody tr").first()).toContainText(
    "$210,000",
  );
  await page.getByRole("button", { name: "Share this search" }).click();
  await expect(
    page.getByText("Search link copied", { exact: true }),
  ).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain("states=TX");
  expect(link).toContain("down=0.25");
  expect(link).toContain("utm_source=qa");
});
test("failed searches recover and never show stale cards as actionable", async ({
  page,
}) => {
  let fail = true;
  await page.route("**/api/search", (route) =>
    fail
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Unavailable" }),
        })
      : route.continue(),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Let’s try that again." }),
  ).toBeVisible();
  await expect(page.locator(".property-card")).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "Retry search" }).click();
  await ready(page);
});
test("invalid price ranges stay editable and subset markets remain accurate", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Minimum purchase price").fill("600000");
  await page.getByLabel("Purchase budget").selectOption("300000");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator(".form-error[role=alert]")).toHaveText(
    "Minimum price must be below maximum price.",
  );
  await page.getByLabel("Minimum purchase price").fill("200000");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator(".property-card")).toHaveCount(1);
});
for (const width of [320, 390, 768])
  test(`responsive layout and dialog at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await ready(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    for (const img of await page.locator(".property-card img").all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((el: HTMLImageElement) => el.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `verification/responsive-${width}.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `verification/mobile-viewport-${width}.png`,
    });
    await page
      .getByRole("button", { name: "View scenario", exact: true })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      await page
        .getByRole("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Request a scenario review", exact: true })
      .click();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await page.getByRole("button", { name: "Close dialog" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

test("multi-market URLs preserve exact markets and a custom down payment", async ({
  page,
}) => {
  await page.goto("/?states=CA,FL&down=0.325");
  await expect(page.locator(".property-card")).toHaveCount(9);
  await expect(page.getByLabel("Where are you looking?")).toHaveValue("custom");
  await expect(page.locator(".results-heading .eyebrow")).toContainText(
    "California / Florida",
  );
  await expect(page.getByLabel("Down payment", { exact: true })).toHaveValue(
    "0.325",
  );
  await expect(page.locator(".scenario-footnote")).toContainText("7.125%");
});
test("image failure has an accessible fallback without breaking property details", async ({
  page,
}) => {
  await page.route("**/_next/image?**", (route) => route.abort());
  await page.goto("/");
  await ready(page);
  await expect(page.locator(".photo-fallback").first()).toContainText(
    "Property photo unavailable",
  );
  await page
    .getByRole("button", { name: "View scenario", exact: true })
    .first()
    .click();
  await expect(page.locator(".scenario-address")).toContainText("705 Kern Ave");
});
test("mobile accessibility and keyboard dialog focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await ready(page);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  const trigger = page
    .getByRole("button", { name: "View scenario", exact: true })
    .first();
  await trigger.click();
  await expect(
    page.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page
      .getByRole("dialog")
      .evaluate((d) => d.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
