import { expect, type Page } from "@playwright/test";

export function hasCreds(): boolean {
  return Boolean(process.env.TEST_EMAIL && process.env.TEST_PASSWORD);
}

export async function signIn(page: Page): Promise<void> {
  if (!hasCreds()) {
    throw new Error("TEST_EMAIL and TEST_PASSWORD are not set");
  }
  await page.goto("/auth/sign-in");
  const email = page
    .locator('input[type="email"], input[name="email"], input[autocomplete="email"]')
    .first();
  const password = page.locator('input[type="password"]').first();
  await expect(email).toBeVisible({ timeout: 30000 });
  await email.fill(process.env.TEST_EMAIL as string);
  await password.fill(process.env.TEST_PASSWORD as string);
  await page.getByRole("button", { name: /sign in|log in/i }).first().click();
  await page.waitForURL((u) => !u.pathname.includes("/auth/"), { timeout: 30000 });
}
