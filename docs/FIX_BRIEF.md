# Fix Brief — ancient-roads (for Claude)

> Read this whole file before touching code. It is the contract.

The **Persistent Widow** (repo `thomascfoley-stack/persistent-widow`, public) is a
report-only UI/UX testing agent for `ancientpaths.app`. Each finding below is a
GitHub Issue in that repo, pinned to a named Playwright spec. **A finding is
"done" only when its spec turns green in CI** — there is no other definition of
done, and you do not get to change the spec to make it green.

## The deal

- You are fixing **exactly 7 issues, listed below**. Nothing else.
- The acceptance test for every fix is already written and running nightly.
  Reproduce with `npx playwright test <spec> --project=desktop -g "<name>"` in a
  checkout of `persistent-widow`. Fix the app, not the test.
- After a fix deploys, two consecutive green runs auto-close the issue. You do
  not need to close anything yourself.

## Scope: 7 issues

| # | Title | Spec (`-g` name) | Status |
|---|---|---|---|
| 1 | filename-headings (upload titles) | `filename-headings` | auth-gated; PR #508 + migration 134 in flight |
| 2 | part-splitting (volume headings) | `part-splitting` | **RED now** |
| 3 | my-works-clickable | `my-works-clickable` | auth-gated |
| 4 | settings-500 | `settings-500` | public green; authed path untested |
| 5 | discovery-determinism | `discovery-determinism` | auth-gated |
| 7 | marketing color-contrast | a11y spec | **RED now** |
| 8 | homepage TTFB | perf spec | flaky (cold serverless route) |

Issue #6 (lexicon manifest gap) is **not yours** — it is in the corpus pipeline,
already fixed there. Do not touch it.

---

## Issue-by-issue

### #1 — filename-headings (upload titles render as raw filenames)

**Evidence:** uploaded works keep source-filename titles like
`29-spurgeon_christ_crucified` and `1-john-4.txt`.

**The exact assertion** (spec `regressions.spec.ts`, `filename-headings`):
an uploaded work's title must NOT match any of:
- a file extension (`\.(txt|htm|html|pdf)\b`)
- a leading-digit slug (`^\d+[-_]`)
- literal markdown bold (`^\*\*[^*]+\*\*`)

Sentence case is fine — the spec asserts *absence of raw-filename patterns*, never
a specific casing.

**Known state:** your PR #508 changes new-upload titles, but existing uploads keep
old titles until **migration 134** is applied. Order: db-invariants green → apply
134 → deploy. This issue stays red until both happen *and* the auth-gated spec can
run (needs `TEST_EMAIL`/`TEST_PASSWORD` secrets in the Widow repo — coordinate, do
not disable the spec).

### #2 — part-splitting (multi-volume headings missing)

**Evidence:** `/work/schaff-encyc01` Contents dialog says `...Volume I`, but
`/work/schaff-encyc02` and `/work/schaff-encyc09` have **no** `Volume II` /
`Volume IX` heading. Also a typo: "Encylopedia" (missing `c`) on encyc01.

**The exact assertion** (`part-splitting`): each of
`/work/schaff-encyc01|02|09` must show its own `Volume I|II|IX` heading in the
Contents dialog, and no heading may be a bare roman numeral (`^[IVXLC]+\.$`).

**Known state:** your PR #508 includes part-splitting fixes on the sermon surface
(bare "II." headings, "Part I" coverage). This issue is about the *Schaff-Herzog
encyclopedia volumes* — verify those specifically.

### #3 — my-works-clickable

**Evidence:** cards on `/library/uploads` do not navigate to the work reader.

**The exact assertion** (`my-works-clickable`, auth-gated): every `main a[href]`
card on `/library/uploads` must navigate away from `/library/uploads` when clicked.

### #4 — settings-500

**Evidence:** public `/settings` renders today, so the crash is suspected
authed-only (`/account/settings`) or interaction-triggered (changing default
translation, time zone, etc.).

**The exact assertion** (`settings-500`): `/settings` returns 200, renders the
"Settings" heading and "Reading theme" section, with zero console/page errors.
Extend coverage to `/account/settings` once creds are available — but fix the
underlying crash, don't paper over it.

### #5 — discovery-determinism

**Evidence:** the same Ask query returns *different* sources run to run.

**The exact assertion** (`discovery-determinism`, auth-gated): the fixed query
`Was the Word always with God?` fired 3× in one run must produce identical
citation sets (the spec compares the full answer text across the 3 runs).

### #7 — marketing color-contrast

**Evidence:** axe-core reports serious `color-contrast` violations:
`/` (4 nodes), `/features` (1), `/why` (2), `/about` (1). App pages are clean.

**The exact assertion** (a11y spec): zero critical/serious WCAG A/AA violations
on `/`, `/features`, `/why`, `/about`. Per-node details land in the
`test-results/a11y.jsonl` artifact.

### #8 — homepage TTFB

**Evidence:** `/` TTFB 1328ms vs an 800ms budget (LCP 2264ms, load ~9s).
Other routes: `/ask` 772ms, `/library` 171ms, `/read` 219ms, `/desk` 190ms.

**The exact assertion** (perf spec, `thresholds.json` → `performance.ttfbMs=800`):
TTFB < 800ms on `/`, `/ask`, `/read/jhn/1`, `/library`, `/desk`. This is flaky —
it trips on cold serverless routes. Fix the cold start / warm path, not the budget.

---

## Borders (hard limits — do not cross)

1. **Only the 7 issues above.** No "while I'm here" changes, however tempting.
2. **No new features, refactors, or abstractions.** The fix is the smallest diff
   that makes the pinned spec green. Nothing else.
3. **Do not modify `persistent-widow` specs, thresholds, or fixtures.** They are
   the acceptance criteria. If you believe a spec is wrong, open a comment on the
   issue and stop — do not edit the assertion to pass.
4. **Do not touch the corpus pipeline or `data/manifest.jsonl`.** That is a
   separate repo, owned separately. Issue #6 is already closed there.
5. **No dependency upgrades, no new tooling, no new services, no schema
   migrations beyond what #1 explicitly requires.**
6. **One PR per issue**, each referencing its issue number. Minimal, reviewable
   diffs. No bundled "also fixed X".
7. **Do not rework migrations that are already in flight** (134, PR #508) beyond
   what closes #1/#2. Do not invent additional migrations.
8. **Never disable, skip, or `test.fixme` a Widow spec** to get green. If creds
   are missing for #3/#4/#5, coordinate to add `TEST_EMAIL`/`TEST_PASSWORD`
   secrets — that is the unblock, not disabling the test.

## How to verify before you claim done

```bash
git clone https://github.com/thomascfoley-stack/persistent-widow
cd persistent-widow && npm ci && npx playwright install chromium
npx playwright test regressions.spec.ts --project=desktop   # #1–#5
npx playwright test a11y.spec.ts --project=desktop           # #7
npx playwright test perf.spec.ts --project=desktop           # #8
```

If a spec is green locally against production but red in CI, say so in the issue
with the run link — do not keep "fixing" a green spec.

## Sign-off

A fix is done when its spec is green on two consecutive nightly scout runs.
Nothing else counts.
