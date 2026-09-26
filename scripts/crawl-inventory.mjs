import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.BASE_URL || "https://ancientpaths.app";
const origin = new URL(base).origin;
const routesPath = path.join(__dirname, "..", "config", "routes.json");

const SEEDS = ["/", "/features", "/library", "/read/jhn/1", "/settings", "/home", "/ask", "/desk"];
const CATEGORY_RULES = [
  { key: "marketing", re: /^\/(features|why|about|privacy|terms)?$/ },
  { key: "auth", re: /^\/(auth|account)(\/|$)/ },
  { key: "library", re: /^\/library(\/|$)/ },
  { key: "app", re: /^\/(home|read|ask|desk|settings|prayers|plans|journal|prayer)(\/|\?|$)/ },
  { key: "works", re: /^\/work\// },
];

const links = new Map();

const browser = await chromium.launch();
const page = await browser.newPage();

for (const seed of SEEDS) {
  try {
    await page.goto(`${base}${seed}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(4_000);
  } catch (e) {
    console.error(`seed ${seed} failed: ${e.message}`);
    continue;
  }
  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href]")).map((a) => ({
      href: a.getAttribute("href") ?? "",
      text: (a.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
    }))
  );
  for (const { href, text } of found) {
    try {
      const url = new URL(href, base);
      if (url.origin !== origin) continue;
      const key = url.pathname + url.search;
      if (!links.has(key)) links.set(key, { path: url.pathname, query: url.search, text });
    } catch {
      /* malformed */
    }
  }
}

let sitemapUrls = [];
try {
  const resp = await page.request.get(`${base}/sitemap.xml`);
  if (resp.ok()) {
    const xml = await resp.text();
    sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
      try {
        return new URL(m[1]);
      } catch {
        return null;
      }
    }).filter(Boolean);
  }
} catch {
  /* no sitemap */
}
for (const url of sitemapUrls) {
  if (url.origin === origin && !links.has(url.pathname + url.search)) {
    links.set(url.pathname + url.search, { path: url.pathname, query: url.search, text: "(sitemap)" });
  }
}

const categorized = { marketing: [], auth: [], app: [], library: [], works: [], other: [] };
for (const { path: p, query, text } of links.values()) {
  const full = query ? `${p}${query}` : p;
  const rule = CATEGORY_RULES.find((r) => r.re.test(p));
  categorized[rule ? rule.key : "other"].push({ full, text });
}
for (const key of Object.keys(categorized)) {
  categorized[key].sort((a, b) => a.full.localeCompare(b.full));
}

const journalHits = [...links.entries()]
  .filter(([, v]) => /journal|prayer/i.test(`${v.text} ${v.path}`))
  .map(([k, v]) => `${k} (${v.text})`);

const current = JSON.parse(fs.readFileSync(routesPath, "utf-8"));
const next = {
  ...current,
  marketing: [...new Set([...current.marketing, ...categorized.marketing.map((x) => x.full)])].sort(),
  auth: [...new Set([...current.auth, ...categorized.auth.map((x) => x.full)])].sort(),
  app: [...new Set([...current.app, ...categorized.app.map((x) => x.full)])].sort(),
  library: [...new Set([...current.library, ...categorized.library.map((x) => x.full)])].sort(),
  works: [...new Set([...current.works, ...categorized.works.map((x) => x.full)])].sort(),
  discovered: {
    lastCrawl: new Date().toISOString(),
    journalRoute: journalHits.length ? journalHits[0].split(" ")[0] : null,
    journalHits,
  },
};
fs.writeFileSync(routesPath, JSON.stringify(next, null, 2) + "\n");

await browser.close();

console.log(`crawled ${links.size} same-origin links`);
console.log(`marketing: ${next.marketing.length}  app: ${next.app.length}  library: ${next.library.length}  auth: ${next.auth.length}  works: ${next.works.length}`);
if (journalHits.length) {
  console.log("journal/prayer candidates:");
  for (const h of journalHits) console.log(`  ${h}`);
} else {
  console.log("no journal/prayer route found unauthenticated");
}
