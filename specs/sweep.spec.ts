import { test, expect, type APIRequestContext } from "@playwright/test";
import { observe } from "./helpers/observe";
import { loadJson } from "./helpers/json";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Routes {
  marketing: string[];
  app: string[];
  library: string[];
}

const routes = loadJson<Routes>("config/routes.json");

function shouldRun(projectName: string, everyProject: boolean): boolean {
  return everyProject || projectName === "desktop";
}

test("sweep: marketing pages return 200 with no page errors", async ({ page }, testInfo) => {
  test.skip(!shouldRun(testInfo.project.name, true), "desktop only");
  for (const p of routes.marketing) {
    await test.step(p, async () => {
      const obs = observe(page);
      const resp = await page.goto(p);
      obs.status = resp?.status() ?? null;
      expect(obs.status, `HTTP status for ${p}`).toBeLessThan(400);
      expect(obs.errors, `console/page errors on ${p}`).toEqual([]);
    });
  }
});

test("sweep: app and library routes return 200 with no page errors", async ({ page }, testInfo) => {
  for (const p of [...routes.app, ...routes.library]) {
    await test.step(p, async () => {
      const obs = observe(page);
      const resp = await page.goto(p);
      obs.status = resp?.status() ?? null;
      expect(obs.status, `HTTP status for ${p}`).toBeLessThan(400);
      expect(obs.errors, `console/page errors on ${p}`).toEqual([]);
    });
  }
});

test("sweep: link crawl finds no broken same-origin links", async ({ page }, testInfo) => {
  test.skip(!shouldRun(testInfo.project.name, false), "desktop only");
  const seen = new Set<string>();
  for (const p of routes.marketing) {
    await page.goto(p);
    const hrefs = await page.locator("a[href]").evaluateAll((as) =>
      as.map((a) => a.getAttribute("href")).filter(Boolean) as string[]
    );
    for (const href of hrefs) {
      try {
        const url = new URL(href, page.url());
        if (url.origin === new URL(process.env.BASE_URL || "https://ancientpaths.app").origin) {
          seen.add(url.pathname);
        }
      } catch {
        /* malformed href */
      }
    }
    if (seen.size >= 120) break;
  }
  expect(seen.size).toBeGreaterThan(0);
  for (const p of [...seen].sort()) {
    await test.step(p, async () => {
      const resp = await page.request.get(p);
      expect(resp.status(), `broken link ${p}`).toBeLessThan(400);
    });
  }
});

test("sweep: sampled works from the manifest all return 200", async ({ page }, testInfo) => {
  test.skip(!shouldRun(testInfo.project.name, false), "desktop only");
  const manifestPath = path.join(__dirname, "..", "corpus", "manifest.snapshot.jsonl");
  const lines = fs.readFileSync(manifestPath, "utf-8").split("\n").filter(Boolean);
  const sampleSize = 40;
  const stride = Math.max(1, Math.floor(lines.length / sampleSize));
  const slugs: string[] = [];
  for (let i = 0; i < lines.length && slugs.length < sampleSize; i += stride) {
    try {
      const rec = JSON.parse(lines[i]);
      if (rec.id) slugs.push(rec.id);
    } catch {
      /* unparseable line */
    }
  }
  expect(slugs.length).toBeGreaterThan(0);
  for (const slug of slugs) {
    await test.step(`/work/${slug}`, async () => {
      const resp = await page.request.get(`/work/${slug}`);
      expect(resp.status(), `broken work /work/${slug}`).toBeLessThan(400);
    });
  }
});
