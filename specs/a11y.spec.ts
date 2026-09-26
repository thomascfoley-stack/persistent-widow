import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loadJson } from "./helpers/json";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const thresholds = loadJson<{ a11y: { tags: string[]; maxViolationsPerPage: number } }>(
  "config/thresholds.json"
).a11y;

const issuesMap = loadJson<Record<string, number>>("config/issues-map.json");

const PAGES = ["/", "/features", "/why", "/about", "/ask", "/read/jhn/1", "/library", "/settings", "/auth/sign-in"];

test.describe("accessibility", () => {
  for (const p of PAGES) {
    test(`a11y: ${p} has no critical or serious WCAG A/AA violations`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "desktop only");
      testInfo.annotations.push({ type: "issue", description: `#${issuesMap["marketing-contrast"]}` });
      await page.goto(p);
      await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
      const results = await new AxeBuilder({ page }).withTags(thresholds.tags).analyze();
      const blocking = results.violations.filter(
        (v) => (v.impact ?? "moderate") === "critical" || (v.impact ?? "moderate") === "serious"
      );
      const outFile = path.join(__dirname, "..", "test-results", "a11y.jsonl");
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.appendFileSync(
        outFile,
        JSON.stringify({
          route: p,
          at: new Date().toISOString(),
          blocking: blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })),
          moderate: results.violations
            .filter((v) => (v.impact ?? "moderate") === "moderate" || (v.impact ?? "moderate") === "minor")
            .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        }) + "\n"
      );
      expect(
        blocking.map((v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} nodes]`),
        `blocking a11y violations on ${p}`
      ).toEqual([]);
    });
  }
});
