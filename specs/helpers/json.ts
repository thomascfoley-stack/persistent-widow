import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", rel), "utf-8")) as T;
}
