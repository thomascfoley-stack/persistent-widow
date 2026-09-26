import { test, expect } from "@playwright/test";
import { observe } from "./helpers/observe";

const CRITICAL = [
  { path: "/", marker: "For those who preach" },
  { path: "/ask", marker: "Try one" },
  { path: "/read/jhn/1", marker: "In the beginning was the Word" },
  { path: "/library", marker: "Six shelves" },
  { path: "/desk", marker: "Your desk is empty" },
];

for (const { path, marker } of CRITICAL) {
  test(`smoke: ${path} loads and renders`, async ({ page }) => {
    const obs = observe(page);
    const resp = await page.goto(path);
    obs.status = resp?.status() ?? null;
    await expect(page.getByText(marker, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    });
    expect(obs.status, `HTTP status for ${path}`).toBeLessThan(400);
    expect(obs.failed, `failed requests on ${path}`).toEqual([]);
    expect(obs.errors, `console/page errors on ${path}`).toEqual([]);
  });
}
