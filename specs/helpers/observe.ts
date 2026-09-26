import type { Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface Observation {
  errors: string[];
  failed: string[];
  noise: string[];
  status: number | null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "config", "expected.json"), "utf-8")
);
const noiseRules: { pattern: string; status: number }[] = config.noise;
const consoleNoiseRules: { pattern: string; requiresNoiseResponse: boolean }[] =
  config.consoleErrorNoise ?? [];

const origin = () => new URL(process.env.BASE_URL || "https://ancientpaths.app").origin;

export function observe(page: Page): Observation {
  const obs: Observation = { errors: [], failed: [], noise: [], status: null };
  page.on("pageerror", (e) => obs.errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const rule = consoleNoiseRules.find((r) => m.text().includes(r.pattern));
    if (rule && (!rule.requiresNoiseResponse || obs.noise.length > 0)) {
      obs.noise.push(m.text());
    } else {
      obs.errors.push(m.text());
    }
  });
  page.on("response", (r) => {
    if (!r.url().startsWith(origin()) || r.status() < 400) return;
    const isNoise = noiseRules.some((n) => r.status() === n.status && r.url().includes(n.pattern));
    if (isNoise) obs.noise.push(`${r.status()} ${r.url()}`);
    else obs.failed.push(`${r.status()} ${r.url()}`);
  });
  return obs;
}
