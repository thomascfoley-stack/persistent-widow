# The Persistent Widow

> And shall not God avenge his own elect, which cry day and night unto him?
> — Luke 18:7

A self-running UI/UX testing agent for **ancientpaths.app**. She petitions the live
site hourly and nightly, files every finding as a GitHub Issue (the Court), and
delivers root-cause verdicts (the Judge) for the team to fix.

**Report-only:** this system never modifies the app. It observes, tests, and files.

## The three actors

| Actor | Role | Trigger |
|---|---|---|
| **The Widow** (Scout) | Crawls, tests, gathers evidence, files findings | Hourly smoke / nightly sweep |
| **The Court** | GitHub Issues with triage labels + `WIDOW_LOG.md` digest | Continuous |
| **The Judge** (Healer) | Reproduces a finding, root-causes it, posts the verdict | On demand (`/heal #12` / dispatch) |

## Quickstart

```bash
npm ci
npx playwright install --with-deps chromium
npm run smoke        # hourly critical path
npm run sweep        # full suite vs the live site
npm run crawl        # rediscover the route inventory
npm run sync-manifest  # refresh corpus/manifest.snapshot.jsonl from the corpus repo
```

Target site: `BASE_URL` env var, defaults to `https://ancientpaths.app`.

## Secrets (GitHub Actions)

| Secret | Used for |
|---|---|
| `DEEPSEEK_API_KEY` | Text critique + root-cause (milestone 3+) |
| `OPENROUTER_API_KEY` | GLM-4V screenshot critique (milestone 3+) |
| `TEST_EMAIL` / `TEST_PASSWORD` | Authed flows: My Works clickability, Ask determinism |

## Test surface

| Spec | What it tests | Cadence |
|---|---|---|
| `smoke` | 5 critical routes × 3 viewports: 200, render marker, no page/console errors, no failed requests | hourly |
| `sweep` | ~30 routes × 3 viewports, link crawl, 40 manifest-sampled works | nightly |
| `flows` | Reader (verse panel, interlinear, word tap, font size, translations), Ask (suggestions, filters, anonymous gating, history mode), passage search, word study, desk picker + shared links, settings (dark mode, default translation) | nightly |
| `perf` | LCP / CLS / TTFB vs budgets, trended to `test-results/perf.jsonl` | nightly |
| `a11y` | axe-core WCAG A/AA, blocking = critical+serious, details to `test-results/a11y.jsonl` | nightly |
| `visual` | pixel baselines: 7 pages × 3 viewports + dark mode + large text | nightly |
| `integrity` | library shelf-count consistency, lexicon works vs manifest, manifest id/status hygiene | nightly |
| `regressions` | 5 seeded known bugs pinned to issues #1–5 | nightly |
| `auth` (gated) | uploads (txt/paste/docx/pdf), journal privacy, plans, saved verses — run when `TEST_EMAIL`/`TEST_PASSWORD` secrets set | nightly |

Visual baselines are platform-specific (`-darwin` locally, `-linux` in CI). Refresh CI
baselines with the scout workflow's `update_snapshots` dispatch flag after any
intentional design change.

## The Court's open docket (seeded red)

Every known bug is a **named failing spec** pinned to a permanent issue. The Court
opens red on day one:

| Issue | Spec | Known bug |
|---|---|---|
| #1 | `regression/filename-headings` | TOC/headings render raw filenames |
| #2 | `regression/part-splitting` | Multi-volume works split with broken ordinals |
| #3 | `regression/my-works-clickable` | Cards on /library/uploads not clickable |
| #4 | `regression/settings-500` | /settings crashes |
| #5 | `regression/discovery-determinism` | Same Ask query returns different sources run to run |
| #6 | `integrity` | 18 lexicon works served but absent from canonical manifest |
| #7 | `a11y` | Serious color-contrast violations on marketing pages |
| #8 | `perf` | Homepage TTFB ~1.3s, budget 800ms |

When the team fixes one, its spec flips green; two consecutive passing runs close
the issue as `verified`.

## Layout

```
.github/workflows/   smoke.yml (hourly) · scout.yml (nightly) · digest.yml
playwright/          playwright.config.ts
specs/               smoke · sweep · regressions (seeded red)
scripts/             crawl-inventory.mjs · sync-manifest.sh
config/              routes.json · thresholds.json · issues-map.json
corpus/              manifest.snapshot.jsonl (pipeline guard, synced)
WIDOW_LOG.md         the daily digest
```

## Cost

Public repo = unlimited GitHub Actions minutes ($0 compute).
AI layers (DeepSeek + GLM-4V) are anomaly-gated: ~$5–9/month total.
