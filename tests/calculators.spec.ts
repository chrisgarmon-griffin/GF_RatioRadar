import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("DSCR purchase, IO, STR and refinance calculate with correct displayed units", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/calculators/dscr");
  await page.getByRole("button", { name: "Load example" }).click();
  await expect(page.locator(".result-hero")).toHaveText("1.13×");
  await page.getByLabel("Payment structure").selectOption("interest_only");
  await expect(page.locator(".result-hero")).toHaveText("1.25×");
  await page.getByLabel("Rental strategy").selectOption("str");
  await page.getByLabel("STR income reduction").fill("0");
  await expect(page.locator(".result-hero")).toHaveText("1.56×");
  await page.getByLabel("Transaction").selectOption("refinance");
  await page.getByLabel("Desired cash out").fill("150000");
  await expect(page.locator(".calc-callout")).toContainText("$95,000");
  await expect(page.locator(".calc-callout")).toContainText("80.00%");
  await page.getByLabel("Current loan balance").fill("320000");
  await expect(page.locator(".calc-callout")).toContainText("$25,000");
  expect(errors).toEqual([]);
});
test("DSCR handoff preserves payment and requires unknown operating inputs", async ({
  page,
}) => {
  await page.goto("/calculators/dscr");
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByRole("button", { name: "Continue to cash flow" }).click();
  await expect(page).toHaveURL(/calculators\/cash-flow/);
  await expect(
    page.getByLabel("Loan payment (principal + interest only)"),
  ).toHaveValue("1995.91");
  await expect(page.getByLabel("Total cash invested")).toHaveValue("75000.00");
  await expect(page.locator(".result-empty")).toBeVisible();
  for (const name of [
    "Vacancy / revenue loss",
    "Property management",
    "Maintenance reserve",
    "Owner-paid utilities",
    "Other operating expenses",
  ])
    await page.getByRole("spinbutton", { name, exact: true }).fill("0");
  await expect(page.locator(".result-hero")).toHaveText("$350");
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("ratioradar.calculator-handoff.v1"),
    ),
  ).toBeNull();
});
test("cash flow negative returns and zero denominators", async ({ page }) => {
  await page.goto("/calculators/cash-flow");
  await page.getByRole("button", { name: "Load example" }).click();
  await expect(page.locator(".result-hero")).toHaveText("-$125");
  await expect(page.locator(".result-rows")).toContainText("5.99%");
  await expect(page.locator(".result-rows")).toContainText("-1.87%");
  await page.getByLabel("Total cash invested").fill("0");
  await expect(page.locator(".result-rows")).toContainText("Not defined");
  await page.getByLabel("Property management").fill("-1");
  await expect(page.locator(".result-empty")).toBeVisible();
});
test("property scenario reaches detailed calculator without silently adding unknown costs", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "View scenario", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Refine in DSCR calculator" }).click();
  await expect(page).toHaveURL(/calculators\/dscr/);
  await expect(
    page.getByLabel("Property value / purchase price"),
  ).not.toHaveValue("");
  await expect(page.getByLabel("HOA dues")).toHaveValue("");
  await expect(page.locator(".result-empty")).toBeVisible();
});
for (const width of [320, 390, 768, 1440])
  test(`calculator and footer responsive accessibility ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/calculators/dscr");
    await page.getByRole("button", { name: "Load example" }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(axe.violations).toEqual([]);
    await page.screenshot({
      path: `verification/calculator-${width}.png`,
      fullPage: true,
    });
    await page
      .locator(".griffin-footer")
      .screenshot({ path: `verification/footer-${width}.png` });
  });
test("all new routes return real content and navigation works", async ({
  page,
}) => {
  for (const route of [
    "/calculators",
    "/calculators/dscr",
    "/calculators/cash-flow",
    "/how-it-works",
    "/dscr-guide",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator(".griffin-brand").first()).toContainText(
      "GRIFFIN FUNDING",
    );
    await expect(page.locator(".griffin-footer")).not.toContainText("Pengon");
  }
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Calculators" })
    .click();
  await expect(page).toHaveURL(/\/calculators\/?$/);
});
