import { test, expect } from "@playwright/test";

const PAGES = ["/", "/features", "/ask", "/read/jhn/1", "/library", "/desk", "/settings"];

test.describe("visual regressions", () => {
  for (const p of PAGES) {
    test(`visual: ${p} matches baseline`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(p);
      await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
      await page.waitForTimeout(2_000);
      await expect(page).toHaveScreenshot(`${p.replace(/[^a-z0-9]+/gi, "_")}.png`, {
        maxDiffPixelRatio: 0.03,
      });
    });
  }

  test(`visual: /read/jhn/1 in dark mode matches baseline`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/settings");
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await page.getByRole("button", { name: "Dark" }).click();
    await page.goto("/read/jhn/1");
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(2_000);
    await expect(page).toHaveScreenshot("read_jhn_1_dark.png", { maxDiffPixelRatio: 0.03 });
  });

  test(`visual: /settings large text size matches baseline`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/settings");
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    const plus = page.getByRole("button", { name: "A+" }).or(page.getByRole("button", { name: /text size/i }));
    if (await plus.count()) {
      for (let i = 0; i < 2; i++) await plus.first().click();
    }
    await page.waitForTimeout(1_000);
    await expect(page).toHaveScreenshot("settings_large_text.png", { maxDiffPixelRatio: 0.03 });
  });
});
