import { test, expect } from "@playwright/test";
import { loadJson } from "./helpers/json";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const thresholds = loadJson<{ performance: Record<string, number> }>("config/thresholds.json").performance;
const issuesMap = loadJson<Record<string, number>>("config/issues-map.json");

interface Vitals {
  lcp?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

async function collectVitals(page: import("@playwright/test").Page): Promise<Vitals> {
  return page.evaluate(() => {
    const w = window as unknown as Record<string, any>;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return {
      lcp: w.__widow_lcp as number | undefined,
      cls: w.__widow_cls as number | undefined,
      fcp: (performance.getEntriesByName("first-contentful-paint")[0]?.startTime as number | undefined),
      ttfb: nav?.responseStart,
    };
  });
}

const CRITICAL = ["/", "/ask", "/read/jhn/1", "/library", "/desk"];

test.describe("performance budgets", () => {
  for (const p of CRITICAL) {
    test(`perf: ${p} meets Web Vitals budgets`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "desktop only");
      testInfo.annotations.push({ type: "issue", description: `#${issuesMap["homepage-ttfb"]}` });
      await page.addInitScript(() => {
        const w = window as unknown as Record<string, any>;
        w.__widow_lcp = undefined;
        w.__widow_cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) w.__widow_lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!(e as any).hadRecentInput) w.__widow_cls += (e as any).value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });

      const t0 = Date.now();
      const resp = await page.goto(p);
      expect(resp?.status() ?? 0, `HTTP status for ${p}`).toBeLessThan(400);

      await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
      await page.waitForTimeout(2_000);
      const vitals = await collectVitals(page);
      const loadMs = Date.now() - t0;

      const row = { route: p, project: test.info().project.name, at: new Date().toISOString(), loadMs, ...vitals };
      const outFile = path.join(__dirname, "..", "test-results", "perf.jsonl");
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.appendFileSync(outFile, JSON.stringify(row) + "\n");

      expect(row.lcp ?? 0, `LCP on ${p}`).toBeLessThan(thresholds.lcpMs);
      expect(row.cls ?? 0, `CLS on ${p}`).toBeLessThan(thresholds.cls);
      expect(row.ttfb ?? 0, `TTFB on ${p}`).toBeLessThan(thresholds.ttfbMs);
    });
  }
});
