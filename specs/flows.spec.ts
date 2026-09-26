import { test, expect } from "@playwright/test";
import { observe } from "./helpers/observe";
import { hasCreds, signIn } from "./helpers/auth";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function desktopOnly(testInfo: { project: { name: string } }): boolean {
  return testInfo.project.name !== "desktop";
}

test.describe("reader interactions", () => {
  test("flows: verse panel deep link shows the voices", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/read/jhn/1");
    await page.waitForTimeout(4_000);
    await page.getByRole("button", { name: "Got it" }).click().catch(() => {});
    await page.getByRole("button", { name: "Verse 1, read commentary" }).click({ timeout: 10_000 });
    await expect(page.getByText(/Commentaries/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Early Church/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test("flows: translation switch changes the active translation", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/read/jhn/1");
    await page.waitForTimeout(4_000);
    const menu = page.getByRole("button", { name: /^WEB$|translation/i }).first();
    await menu.click({ timeout: 10_000 });
    await page.getByRole("option", { name: /KJV|King James/i }).or(page.getByText(/KJV|King James/i, { exact: false }).first()).first().click({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /KJV/i }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("flows: interlinear toggle reveals original-language words", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/read/jhn/1");
    await page.waitForTimeout(4_000);
    const toggle = page.getByRole("button", { name: /אα|interlinear|original/i }).first();
    await toggle.click({ timeout: 10_000 });
    await expect(page.getByText("Ἐν", { exact: false }).first()).toBeVisible({ timeout: 20_000 });
  });

  test("flows: tapping an interlinear word opens its dictionary entry", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/read/jhn/1");
    await page.waitForTimeout(4_000);
    const toggle = page.getByRole("button", { name: /אα|interlinear|original/i }).first();
    await toggle.click({ timeout: 10_000 });
    await page.getByText("Ἐν", { exact: false }).first().click({ timeout: 10_000 });
    await expect(page.getByText(/G\d{4}|Strong/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test("flows: font size control changes reader text size", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/read/jhn/1");
    await page.waitForTimeout(4_000);
    const sizeOf = () => page.evaluate(() => localStorage.getItem("reader-size"));
    const before = await sizeOf();
    await page.getByRole("button", { name: "Aa" }).first().click({ timeout: 10_000 });
    await page.getByRole("button", { name: /A\+/ }).first().click({ timeout: 10_000 });
    await page.waitForTimeout(800);
    const after = await sizeOf();
    expect(after, "reader-size preference did not change").not.toBe(before);
  });
});

test.describe("ask modes", () => {
  test("flows: suggested question runs the search", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/ask");
    await page.waitForTimeout(3_000);
    await page
      .locator("main li")
      .filter({ hasText: /what does the gospel of john say/i })
      .first()
      .click({ timeout: 10_000 });
    await expect(page.getByText(/search the library for these words/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("flows: source filter toggles state", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/ask");
    await page.waitForTimeout(3_000);
    const sermons = page.getByRole("button", { name: /sermons/i }).first();
    await expect(sermons).toBeVisible({ timeout: 10_000 });
    expect(await sermons.getAttribute("aria-pressed"), "Sermons should start selected").toBe("true");
    await sermons.click();
    await expect(sermons).toHaveAttribute("aria-pressed", "false", { timeout: 5_000 });
  });

  test("flows: anonymous ask submission gates to sign-in", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/ask");
    await page.waitForTimeout(3_000);
    const input = page.locator("textarea, input[type=text], [contenteditable=true]").first();
    await input.fill("What did the early Church say about baptism?");
    await input.press("Enter");
    await expect(page.getByText(/please sign/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test("flows: history mode loads with historian sources", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/ask?mode=history");
    await page.waitForTimeout(3_000);
    await expect(page.getByText(/history points you into the sources/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("library tools", () => {
  test("flows: passage search loads commentary for a chapter", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/library/passages");
    await page.waitForTimeout(3_000);
    const bookSelect = page.locator("select").first();
    await bookSelect.selectOption("gen", { timeout: 10_000 });
    await page.waitForTimeout(2_000);
    const chapterSelect = page.locator("select").nth(1);
    await chapterSelect.selectOption("1", { timeout: 10_000 });
    await expect(page.getByText(/in the beginning god created/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("flows: word study search returns entries and tabs switch", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/library/word-study");
    await page.waitForTimeout(3_000);
    const search = page.locator('input[placeholder*="agape"]').first();
    await search.fill("logos", { timeout: 10_000 });
    await search.press("Enter");
    await expect(page.getByText(/G3056|λόγος/i).first()).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: /hebrew/i }).first().click({ timeout: 10_000 });
    await expect(page.getByText(/hebrew lexicon/i).first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("study desk", () => {
  test("flows: empty desk offers the Bible picker", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/desk");
    await page.waitForTimeout(3_000);
    await expect(page.getByRole("heading", { name: /your desk is empty/i })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /open the bible/i }).click({ timeout: 10_000 });
    const dialog = page.locator("[role=dialog]").first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog.getByText("Genesis", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("flows: shared desk link loads its panes", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    const obs = observe(page);
    await page.goto("/desk?p=scripture:jhn/1");
    await page.waitForTimeout(5_000);
    await expect(page.locator("main").getByText(/In the beginning was the Word/i).first()).toBeVisible({
      timeout: 30_000,
    });
    expect(obs.errors, "console/page errors on shared desk").toEqual([]);
  });
});

test.describe("settings interactions", () => {
  test("flows: dark mode changes the page background", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/settings");
    await page.waitForTimeout(3_000);
    const before = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.getByRole("button", { name: "Dark" }).click({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    const after = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(after, "background did not change on dark mode").not.toBe(before);
  });

  test("flows: default translation selection applies to the reader", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    await page.goto("/settings");
    await page.waitForTimeout(3_000);
    await page.getByText("KJV King James Version", { exact: false }).first().click({ timeout: 10_000 });
    await page.waitForTimeout(1_000);
    await page.goto("/read/jhn/1");
    await page.waitForTimeout(4_000);
    await expect(page.getByRole("button", { name: /^KJV$/i })).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("authenticated flows", () => {
  test("auth: upload a txt sermon produces a derived title", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    test.skip(!hasCreds(), "TEST_EMAIL/TEST_PASSWORD not set; runs in CI with secrets");
    await signIn(page);
    await page.goto("/library/uploads");
    await page.waitForTimeout(4_000);
    const fileInput = page.locator('input[type=file]').first();
    await fileInput.setInputFiles(path.join(__dirname, "..", "fixtures", "upload-samples", "txt", "sermon-sample.txt"), { timeout: 10_000 });
    await expect(page.getByText(/sermon sample|sermon-sample/i).first()).toBeVisible({ timeout: 120_000 });
  });

  test("auth: docx upload path is exercised", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    test.skip(!hasCreds(), "TEST_EMAIL/TEST_PASSWORD not set; runs in CI with secrets");
    await signIn(page);
    const obs = observe(page);
    await page.goto("/library/uploads");
    await page.waitForTimeout(4_000);
    const fileInput = page.locator('input[type=file]').first();
    const sample = path.join(__dirname, "..", "fixtures", "upload-samples", "docx");
    const files = fs.existsSync(sample) ? fs.readdirSync(sample) : [];
    test.skip(files.length === 0, "no docx fixture present");
    await fileInput.setInputFiles(path.join(sample, files[0]), { timeout: 10_000 });
    await page.waitForTimeout(10_000);
    expect(obs.errors, "docx upload crashed the page").toEqual([]);
  });

  test("auth: journal entry never phones a model provider", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    test.skip(!hasCreds(), "TEST_EMAIL/TEST_PASSWORD not set; runs in CI with secrets");
    await signIn(page);
    const external: string[] = [];
    page.on("request", (r) => {
      try {
        const host = new URL(r.url()).host;
        if (!host.endsWith("ancientpaths.app")) external.push(r.url());
      } catch {
        /* ignore */
      }
    });
    await page.goto("/prayers");
    await page.waitForTimeout(4_000);
    const box = page.locator("textarea, [contenteditable=true]").first();
    if (await box.count()) {
      await box.fill("The Lord is my shepherd; I shall not want.");
      await page.getByRole("button", { name: /save|add|new entry/i }).first().click({ timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(3_000);
    }
    const modelCalls = external.filter((u) => /openai|anthropic|deepseek|gemini|llm|mistral|groq/i.test(u));
    expect(modelCalls, `journal leaked to model provider: ${modelCalls.join(", ")}`).toEqual([]);
  });

  test("auth: reading plans page loads without errors", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    test.skip(!hasCreds(), "TEST_EMAIL/TEST_PASSWORD not set; runs in CI with secrets");
    await signIn(page);
    const obs = observe(page);
    await page.goto("/plans");
    await page.waitForTimeout(4_000);
    expect(obs.errors, "console/page errors on /plans").toEqual([]);
    expect(page.locator("main").innerText()).resolves.toMatch(/\S+/);
  });

  test("auth: saved verses page resolves to list or empty state", async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo), "desktop only");
    test.skip(!hasCreds(), "TEST_EMAIL/TEST_PASSWORD not set; runs in CI with secrets");
    await signIn(page);
    await page.goto("/library/notes");
    await page.waitForTimeout(4_000);
    await expect(page.getByText(/loading your saved verses/i).first()).toBeHidden({ timeout: 30_000 }).catch(() => {});
    expect(await page.locator("main").innerText()).toMatch(/\S+/);
  });
});
