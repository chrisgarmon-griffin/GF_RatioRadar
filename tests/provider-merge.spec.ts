import { test, expect } from "@playwright/test";
test("partial rent coverage stays explicit and zero priced rows do not imply no listings", async ({
  page,
}) => {
  let allMissing = false;
  await page.route("**/api/search", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.skipped = allMissing ? data.rows.length : 1;
    data.rows = allMissing ? [] : data.rows.slice(1);
    await route.fulfill({ response, json: data });
  });
  await page.goto("/");
  await expect(page.locator(".property-card")).toHaveCount(4);
  await expect(page.locator(".partial-results")).toContainText(
    "Results are incomplete",
  );
  allMissing = true;
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "No priced properties in this view." }),
  ).toBeVisible();
  await expect(page.locator(".partial-results")).toContainText("5 properties");
});
test("REvestor header uses original griffin with live two-line type at responsive widths", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const brand = page.locator("header").getByRole("link", {
      name: /Griffin Funding RE\s?vestor home/,
      exact: true,
    });
    await expect(brand).toBeVisible();
    await expect(brand.locator(".revestor-parent")).toHaveText(
      "Griffin Funding",
    );
    await expect(brand.locator(".revestor-name")).toHaveText("REvestor");
    await expect(brand.locator(".revestor-name>span")).toHaveCSS(
      "color",
      "rgb(189, 12, 12)",
    );
    await brand.locator("img").evaluate((i: HTMLImageElement) => i.decode());
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await brand.screenshot({
      path: `verification/revestor-brand-${width}.png`,
    });
  }
});
