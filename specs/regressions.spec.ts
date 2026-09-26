import { test, expect, type TestInfo } from "@playwright/test";
import { observe } from "./helpers/observe";
import { hasCreds, signIn } from "./helpers/auth";
import { loadJson } from "./helpers/json";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, "..", "corpus", "manifest.snapshot.jsonl");

const issuesMap = loadJson<Record<string, number>>("config/issues-map.json");

function desktopOnly(testInfo: { project: { name: string } }): boolean {
  return testInfo.project.name !== "desktop";
}

function annotate(testInfo: TestInfo, key: keyof typeof issuesMap) {
  testInfo.annotations.push({ type: "issue", description: `#${issuesMap[key]}` });
}

const RAW_FILENAME = [
  /\.(txt|htm|html|pdf)(\b|$)/i,
  /^pg\s*\d+/i,
  /^text\s*#?\s*\d+/i,
  /^\d+$/,
];

function isRawFilename(text: string): boolean {
  return RAW_FILENAME.some((re) => re.test(text.trim()));
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

const ROMAN_RE = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;

function romanValue(s: string): number | null {
  if (!ROMAN_RE.test(s)) return null;
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  const up = s.toUpperCase();
  for (let i = 0; i < up.length; i++) {
    const cur = map[up[i]];
    const next = map[up[i + 1]] ?? 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}

function titleOrdinal(title: string): number | null {
  const m = title.match(/\b(?:vol(?:ume)?s?|part|pt)\.?\s*([IVXLCDM]+|\d+)\b/i);
  if (m) {
    const n = romanValue(m[1]);
    if (n !== null) return n;
    const arabic = parseInt(m[1], 10);
    if (!Number.isNaN(arabic)) return arabic;
  }
  const trailing = title.match(/(?:^|\s)([IVXLCDM]+)$/i);
  if (trailing) return romanValue(trailing[1]);
  return null;
}

function assertContiguous(ordinals: number[]): { ok: boolean; detail: string } {
  const sorted = [...ordinals].sort((a, b) => a - b);
  const dupes = sorted.filter((n, i) => sorted.indexOf(n) !== i);
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] > 1) gaps.push(sorted[i - 1] + 1);
  }
  const ok = dupes.length === 0 && gaps.length === 0 && sorted[0] === 1;
  return { ok, detail: `ordinals=${sorted.join(",")} dupes=${dupes.join(",")} gaps=${gaps.join(",")}` };
}

test.describe("seeded regressions", () => {
  test("regression/filename-headings: no raw filenames in corpus titles or work headings", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    annotate(testInfo, "filename-headings");

    const records = parseManifest();
    const badTitles = records.filter((r) => typeof r.title === "string" && isRawFilename(r.title));
    expect(badTitles.map((r) => r.title), "manifest titles that are raw filenames").toEqual([]);

    const slugs = records.filter((r) => r.id).map((r) => r.id).slice(0, 10);
    for (const slug of slugs) {
      await test.step(`/work/${slug}`, async () => {
        await page.goto(`/work/${slug}`);
        const headings = await page.locator("h1, h2, h3, h4").allInnerTexts();
        const tocTexts = await page.locator("nav a, aside a").allInnerTexts();
        const bad = [...headings, ...tocTexts].filter(isRawFilename);
        expect(bad, `raw filename headings on /work/${slug}`).toEqual([]);
      });
    }
  });

  test("regression/part-splitting: multi-volume ordinals are contiguous", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    annotate(testInfo, "part-splitting");

    const records = parseManifest();
    const groups = new Map<string, Record<string, any>[]>();
    for (const r of records) {
      if (!r.group_id) continue;
      groups.set(r.group_id, [...(groups.get(r.group_id) ?? []), r]);
    }
    const failures: string[] = [];
    for (const [groupId, members] of groups) {
      if (members.length < 2) continue;
      const ordinals = members.map((m) => titleOrdinal(String(m.title ?? ""))).filter((n): n is number => n !== null);
      if (ordinals.length !== members.length) continue;
      const { ok, detail } = assertContiguous(ordinals);
      if (!ok) failures.push(`${groupId}: ${detail}`);
    }
    expect(failures, "manifest groups with non-contiguous ordinals").toEqual([]);

    const volumes = [
      { slug: "schaff-encyc01", roman: "I" },
      { slug: "schaff-encyc02", roman: "II" },
      { slug: "schaff-encyc09", roman: "IX" },
    ];
    for (const { slug, roman } of volumes) {
      await test.step(`/work/${slug} volume heading`, async () => {
        await page.goto(`/work/${slug}`);
        await page.waitForTimeout(4_000);
        await page.getByRole("button", { name: /contents/i }).click({ timeout: 10_000 });
        const dialog = page.locator("[role=dialog]").first();
        await expect(dialog).toBeVisible({ timeout: 10_000 });
        const text = (await dialog.innerText()).replace(/\s+/g, " ");
        expect(text, `/work/${slug} Contents missing its own volume heading`).toMatch(
          new RegExp(`Volume\\s+${roman}\\b`)
        );
      });
    }
  });

  test("regression/my-works-clickable: every card on /library/uploads navigates", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    annotate(testInfo, "my-works-clickable");
    test.skip(!hasCreds(), "TEST_EMAIL/TEST_PASSWORD not set; runs in CI with secrets");

    await signIn(page);
    await page.goto("/library/uploads");
    await page.waitForLoadState("networkidle").catch(() => {});
    const cards = page.locator("main a[href]");
    const count = await cards.count();
    expect(count, "no work cards on /library/uploads (upload one for the test account)").toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await test.step(`card ${i + 1} of ${count}`, async () => {
        await cards.nth(i).click();
        await page.waitForLoadState("domcontentloaded");
        expect(new URL(page.url()).pathname, "click did not navigate away from /library/uploads").not.toBe(
          "/library/uploads"
        );
        await page.goBack();
      });
    }
  });

  test("regression/settings-500: /settings renders without crashing", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    annotate(testInfo, "settings-500");

    const obs = observe(page);
    const resp = await page.goto("/settings");
    obs.status = resp?.status() ?? null;
    expect(obs.status, "HTTP status for /settings").toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Reading theme", { exact: false })).toBeVisible();
    expect(obs.errors, "console/page errors on /settings").toEqual([]);
  });

  test("regression/discovery-determinism: same query returns identical citations 3x", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    annotate(testInfo, "discovery-determinism");
    test.skip(!hasCreds(), "TEST_EMAIL/TEST_PASSWORD not set; runs in CI with secrets");

    await signIn(page);
    const question = "Was the Word always with God?";
    const captures: string[] = [];
    for (let run = 1; run <= 3; run++) {
      await test.step(`run ${run}`, async () => {
        await page.goto("/ask");
        const input = page.locator("textarea, input[type=text], [contenteditable=true]").first();
        await expect(input).toBeVisible({ timeout: 30_000 });
        await input.fill(question);
        await input.press("Enter");
        await page.waitForLoadState("networkidle", { timeout: 120_000 }).catch(() => {});
        await page.waitForTimeout(5_000);
        const text = (await page.locator("main").innerText()).replace(/\s+/g, " ").trim();
        expect(text.length, `run ${run} produced no answer text`).toBeGreaterThan(0);
        captures.push(text);
      });
    }
    expect(captures[1], "run 2 differs from run 1").toBe(captures[0]);
    expect(captures[2], "run 3 differs from run 1").toBe(captures[0]);
  });
});
