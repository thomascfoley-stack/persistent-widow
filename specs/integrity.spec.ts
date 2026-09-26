import { test, expect } from "@playwright/test";
import { loadJson } from "./helpers/json";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, "..", "corpus", "manifest.snapshot.jsonl");
const issuesMap = loadJson<Record<string, number>>("config/issues-map.json");

const STATUS_VOCAB = new Set(["harvested", "imported", "verified", "truncated", "missing", "deprecated"]);

function desktopOnly(testInfo: { project: { name: string } }): boolean {
  return testInfo.project.name !== "desktop";
}

function parseManifest(): Record<string, any>[] {
  return fs
    .readFileSync(manifestPath, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Record<string, any>[];
}

test("integrity: library shelf counts are internally consistent", async ({ page }, testInfo) => {
  test.skip(desktopOnly(testInfo), "desktop only");
  await page.goto("/library");
  await page.waitForTimeout(4_000);
  const text = await page.locator("main").innerText();
  const counts = [...text.matchAll(/(\d+)\s*items/gi)].map((m) => parseInt(m[1], 10));
  expect(counts.length, `expected a total + 6 shelf counts, found ${counts.length}`).toBeGreaterThanOrEqual(7);
  const [total, ...shelves] = counts;
  const shelfSum = shelves.slice(0, 6).reduce((a, b) => a + b, 0);
  expect(shelfSum, `shelf counts sum to ${shelfSum} but All items says ${total}`).toBe(total);
});

test("integrity: every lexicon work served has a manifest record", async ({ page }, testInfo) => {
  test.skip(desktopOnly(testInfo), "desktop only");
  testInfo.annotations.push({ type: "issue", description: `#${issuesMap["lexicon-manifest-gap"]}` });
  const records = parseManifest();

  const norm = (s: string) =>
    s
      .replace(/&#0*39;|&#x27;|&apos;/gi, "'")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const titles = records.map((r) => norm(String(r.title ?? "")));

  await page.goto("/library");
  await page.waitForTimeout(4_000);
  const slugs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("main a[href*='/work/']")).map((a) => {
      const url = new URL(a.getAttribute("href") as string, location.origin);
      return decodeURIComponent(url.pathname.replace(/^\/work\//, ""));
    })
  );
  const unique = [...new Set(slugs)];
  expect(unique.length, "no /work/ links found on /library").toBeGreaterThan(0);

  const unreachable: string[] = [];
  for (const slug of unique) {
    const resp = await page.request.get(`/work/${slug}`);
    if (resp.status() >= 400) unreachable.push(`${slug} (${resp.status()})`);
  }
  expect(unreachable, "lexicon works not reachable").toEqual([]);

  const required: [string, number][] = [
    ["browndriverbriggs", 1],
    ["thayer", 1],
    ["liddell", 1],
    ["strongsexhaustiveconcordance", 1],
    ["internationalstandardbibleencyclopedia", 1],
    ["eastonsbibledictionary", 2],
    ["smithsbibledictionary", 2],
  ];
  const missing: string[] = [];
  for (const [needle, min] of required) {
    const count = titles.filter((t) => t.includes(needle)).length;
    if (count < min) missing.push(`${needle} (${count}/${min})`);
  }
  expect(missing, "reference lexicons absent from the canonical manifest").toEqual([]);
});

test("integrity: manifest ids are unique and statuses in vocabulary", async ({}, testInfo) => {
  test.skip(desktopOnly(testInfo), "desktop only");
  const records = parseManifest();
  const ids = records.map((r) => r.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  expect([...new Set(dupes)], "duplicate manifest ids").toEqual([]);
  const badStatus = records.filter((r) => r.status && !STATUS_VOCAB.has(r.status)).map((r) => `${r.id}:${r.status}`);
  expect(badStatus, "manifest records with unknown status").toEqual([]);
});
