# WIDOW_LOG.md — the Court's daily digest

And shall not God avenge his own elect, which cry day and night unto him? — Luke 18:7

Every run of the Persistent Widow appends a line here. Open issues carry the
evidence; this log is the running testimony.

## 2026-09-26 — full surface sweep added

The whole site surface is now under test (see README): flows, perf, a11y, visual,
integrity. New findings from the first full run:

- **#6 lexicon-manifest gap** — 18 lexicon works served, 0 manifest records (pipeline gap)
- **#7 marketing contrast** — serious color-contrast on /, /features, /why, /about
  (4+1+2+1 nodes); app pages are clean
- **#8 homepage TTFB** — / TTFB 1328ms vs 800ms budget (LCP 2264ms, load 9s);
  /ask 772ms, /library 171ms, /read 219ms, /desk 190ms
- Reader mechanics mapped: verse panel opens via sup "Verse N, read commentary";
  reader-size persisted in localStorage; source filters are aria-pressed toggles;
  anonymous ask gates inline with "Please sign…"; desk picker opens a book dialog
- Ask suggestions run the query (→ "Search the library for these words")
- Visual baselines generated for 7 pages × 3 viewports + dark + large text

## 2026-09-26 — the Widow is commissioned

Seeded five known bugs as named failing specs, each pinned to a Court issue:

- #1 `regression/filename-headings` — raw filenames as TOC/headings
- #2 `regression/part-splitting` — multi-volume ordinals broken
- #3 `regression/my-works-clickable` — /library/uploads cards not clickable
- #4 `regression/settings-500` — /settings crashes
- #5 `regression/discovery-determinism` — same Ask query, different sources run to run

First night's evidence:

- `filename-headings` RED: manifest record with title `"1492"` (raw number as display title)
- `part-splitting` RED: `/work/schaff-encyc02` and `/work/schaff-encyc09` Contents dialogs
  carry no `Volume II` / `Volume IX` heading — only Vol I says "…Volume I"
- `settings-500` GREEN tonight: public `/settings` renders. Crash likely authed-only
  (`/account/settings`) or interaction-triggered; spec stays pinned, extend once creds land
- Pipeline gap: 18 lexicon works served by the app (schaff-encyc*, bdb-lexicon, thayers,
  strongs, easton, smith, isbe, naves, hitchcock, liddell, wace, schaff-dictionarybible)
  have **no records in the canonical manifest snapshot** — app serves works the index
  doesn't know. Candidate data-integrity spec for milestone 2
- Typo on site: `/work/schaff-encyc01` heading reads "The New Schaff-Herzog **Encylopedia**"
  (missing 'c')
- Noise recorded: `/api/annotations?book=43&chapter=1` returns 401 for anonymous readers
- Prayer journal discovered at `/prayers`; reading plans at `/plans` (both need auth checks)

## 2026-09-26 scout
- workflow: scout
- conclusion: failure
- commit: 84d673d

## 2026-09-26 scout
- workflow: scout
- conclusion: failure
- commit: 5177c2f

## 2026-09-27 smoke
- workflow: smoke
- conclusion: success
- commit: 6c9a9d6

## 2026-09-27 smoke
- workflow: smoke
- conclusion: success
- commit: 7eecd52

## 2026-09-27 smoke
- workflow: smoke
- conclusion: success
- commit: 870f4e9

## 2026-09-27 scout
- workflow: scout
- conclusion: failure
- commit: 350a327

## 2026-09-27 smoke
- workflow: smoke
- conclusion: success
- commit: a41d243

## 2026-09-27 smoke
- workflow: smoke
- conclusion: success
- commit: 1a212c0

## 2026-09-28 smoke
- workflow: smoke
- conclusion: success
- commit: 279e5fe

## 2026-09-28 smoke
- workflow: smoke
- conclusion: success
- commit: 160c54a

## 2026-09-28 smoke
- workflow: smoke
- conclusion: success
- commit: a4246a7

## 2026-09-28 scout
- workflow: scout
- conclusion: failure
- commit: 6907499

## 2026-09-28 smoke
- workflow: smoke
- conclusion: success
- commit: 05abe51

## 2026-09-29 smoke
- workflow: smoke
- conclusion: success
- commit: 8abeb88

## 2026-09-29 smoke
- workflow: smoke
- conclusion: success
- commit: 6360f70

## 2026-09-29 scout
- workflow: scout
- conclusion: failure
- commit: f7f685b

## 2026-09-29 smoke
- workflow: smoke
- conclusion: success
- commit: 573822d

## 2026-09-29 smoke
- workflow: smoke
- conclusion: success
- commit: f7149f7

## 2026-09-30 smoke
- workflow: smoke
- conclusion: success
- commit: 7f531d6

## 2026-09-30 smoke
- workflow: smoke
- conclusion: success
- commit: 6fcd6aa

## 2026-09-30 smoke
- workflow: smoke
- conclusion: success
- commit: e5824b1

## 2026-09-30 scout
- workflow: scout
- conclusion: failure
- commit: e493b13

## 2026-09-30 smoke
- workflow: smoke
- conclusion: success
- commit: 6f58307

## 2026-09-30 smoke
- workflow: smoke
- conclusion: success
- commit: e4d0fb8

## 2026-10-01 smoke
- workflow: smoke
- conclusion: failure
- commit: 153edae

## 2026-10-01 smoke
- workflow: smoke
- conclusion: success
- commit: 59150ec

## 2026-10-01 scout
- workflow: scout
- conclusion: failure
- commit: 55e4c59

## 2026-10-01 smoke
- workflow: smoke
- conclusion: success
- commit: c019b8e

## 2026-10-01 smoke
- workflow: smoke
- conclusion: success
- commit: a2ec912

## 2026-10-02 smoke
- workflow: smoke
- conclusion: success
- commit: 24ee9ef

## 2026-10-02 smoke
- workflow: smoke
- conclusion: success
- commit: 96e6413

## 2026-10-02 scout
- workflow: scout
- conclusion: failure
- commit: 372892b

## 2026-10-02 smoke
- workflow: smoke
- conclusion: success
- commit: 5e1bf5d

## 2026-10-02 smoke
- workflow: smoke
- conclusion: success
- commit: 6e7507f

## 2026-10-03 smoke
- workflow: smoke
- conclusion: success
- commit: 9908d77

## 2026-10-03 smoke
- workflow: smoke
- conclusion: success
- commit: 0e5b9c4

## 2026-10-03 smoke
- workflow: smoke
- conclusion: success
- commit: 9a529e9

## 2026-10-03 scout
- workflow: scout
- conclusion: failure
- commit: 3593202

## 2026-10-03 smoke
- workflow: smoke
- conclusion: success
- commit: 9044849

## 2026-10-03 smoke
- workflow: smoke
- conclusion: success
- commit: bfa5e4c

## 2026-10-03 smoke
- workflow: smoke
- conclusion: success
- commit: 30ed553

## 2026-10-04 smoke
- workflow: smoke
- conclusion: success
- commit: c6a0dc6

## 2026-10-04 smoke
- workflow: smoke
- conclusion: success
- commit: 5ca22e3

## 2026-10-04 scout
- workflow: scout
- conclusion: failure
- commit: 9150ea8

## 2026-10-04 smoke
- workflow: smoke
- conclusion: success
- commit: f5a5af2

## 2026-10-04 smoke
- workflow: smoke
- conclusion: success
- commit: f1f51db

## 2026-10-05 smoke
- workflow: smoke
- conclusion: success
- commit: de7515a

## 2026-10-05 smoke
- workflow: smoke
- conclusion: success
- commit: 8988757

## 2026-10-05 smoke
- workflow: smoke
- conclusion: success
- commit: 0549ab3

## 2026-10-05 scout
- workflow: scout
- conclusion: failure
- commit: 726e205

## 2026-10-05 smoke
- workflow: smoke
- conclusion: success
- commit: 2f0ae48

## 2026-10-06 smoke
- workflow: smoke
- conclusion: success
- commit: 6cc747b

## 2026-10-06 smoke
- workflow: smoke
- conclusion: success
- commit: ed9b79d

## 2026-10-06 scout
- workflow: scout
- conclusion: failure
- commit: 424a152

## 2026-10-06 smoke
- workflow: smoke
- conclusion: success
- commit: 9bc7177

## 2026-10-06 smoke
- workflow: smoke
- conclusion: success
- commit: 1c63fcc

## 2026-10-07 smoke
- workflow: smoke
- conclusion: success
- commit: 796d39a

## 2026-10-07 smoke
- workflow: smoke
- conclusion: success
- commit: 8e35a66

## 2026-10-07 smoke
- workflow: smoke
- conclusion: success
- commit: a9a49a8

## 2026-10-07 smoke
- workflow: smoke
- conclusion: success
- commit: 9da9d2f

## 2026-10-08 smoke
- workflow: smoke
- conclusion: success
- commit: b067577

## 2026-10-08 smoke
- workflow: smoke
- conclusion: success
- commit: 5f446b9

## 2026-10-08 scout
- workflow: scout
- conclusion: failure
- commit: 8fe7ffd

## 2026-10-08 smoke
- workflow: smoke
- conclusion: success
- commit: 05efdee

## 2026-10-08 smoke
- workflow: smoke
- conclusion: success
- commit: f270b12

## 2026-10-09 smoke
- workflow: smoke
- conclusion: success
- commit: 77ba50e

## 2026-10-09 smoke
- workflow: smoke
- conclusion: success
- commit: e8c1c01

## 2026-10-09 scout
- workflow: scout
- conclusion: failure
- commit: eb037ee

## 2026-10-09 smoke
- workflow: smoke
- conclusion: success
- commit: 2f25b89

## 2026-10-09 smoke
- workflow: smoke
- conclusion: failure
- commit: 8e9b6f9

## 2026-10-10 smoke
- workflow: smoke
- conclusion: failure
- commit: eca126f

## 2026-10-10 smoke
- workflow: smoke
- conclusion: failure
- commit: 10628d4

## 2026-10-10 smoke
- workflow: smoke
- conclusion: failure
- commit: 2e9d513

## 2026-10-10 scout
- workflow: scout
- conclusion: failure
- commit: f6b32a1

## 2026-10-10 smoke
- workflow: smoke
- conclusion: failure
- commit: 5a659ce

## 2026-10-10 smoke
- workflow: smoke
- conclusion: failure
- commit: 158c99c

## 2026-10-11 smoke
- workflow: smoke
- conclusion: failure
- commit: e52aa72

## 2026-10-11 smoke
- workflow: smoke
- conclusion: failure
- commit: 93e1442

## 2026-10-11 scout
- workflow: scout
- conclusion: failure
- commit: 377a8ee

## 2026-10-11 smoke
- workflow: smoke
- conclusion: failure
- commit: fe7bab3

## 2026-10-11 smoke
- workflow: smoke
- conclusion: failure
- commit: 03816db

## 2026-10-12 smoke
- workflow: smoke
- conclusion: failure
- commit: 506dfcc

## 2026-10-12 smoke
- workflow: smoke
- conclusion: failure
- commit: 86d4da4

## 2026-10-12 scout
- workflow: scout
- conclusion: failure
- commit: 20ddb34

## 2026-10-12 smoke
- workflow: smoke
- conclusion: failure
- commit: 14949db

## 2026-10-13 smoke
- workflow: smoke
- conclusion: failure
- commit: b1ac024

## 2026-10-13 smoke
- workflow: smoke
- conclusion: failure
- commit: 18e4375

## 2026-10-13 scout
- workflow: scout
- conclusion: failure
- commit: 70f2789

## 2026-10-13 smoke
- workflow: smoke
- conclusion: failure
- commit: 1b6ed33

## 2026-10-13 smoke
- workflow: smoke
- conclusion: failure
- commit: 5f0ddfb

## 2026-10-14 smoke
- workflow: smoke
- conclusion: failure
- commit: 3c5c213

## 2026-10-14 smoke
- workflow: smoke
- conclusion: failure
- commit: 4eb1f77

## 2026-10-14 smoke
- workflow: smoke
- conclusion: failure
- commit: f1a63a1

## 2026-10-14 scout
- workflow: scout
- conclusion: failure
- commit: b3c7530

## 2026-10-14 smoke
- workflow: smoke
- conclusion: failure
- commit: 8b97891

## 2026-10-14 smoke
- workflow: smoke
- conclusion: failure
- commit: d90a3ec

## 2026-10-15 smoke
- workflow: smoke
- conclusion: failure
- commit: 894c6a5

## 2026-10-15 smoke
- workflow: smoke
- conclusion: failure
- commit: f1f9b40

## 2026-10-15 smoke
- workflow: smoke
- conclusion: failure
- commit: 1e16fbb

## 2026-10-15 scout
- workflow: scout
- conclusion: failure
- commit: c7721d7

## 2026-10-15 smoke
- workflow: smoke
- conclusion: failure
- commit: 223504d

## 2026-10-15 smoke
- workflow: smoke
- conclusion: failure
- commit: deefca0

## 2026-10-16 smoke
- workflow: smoke
- conclusion: failure
- commit: 9a86906

## 2026-10-16 smoke
- workflow: smoke
- conclusion: failure
- commit: 7b1ed0d

## 2026-10-16 smoke
- workflow: smoke
- conclusion: failure
- commit: c8433da

## 2026-10-16 scout
- workflow: scout
- conclusion: failure
- commit: e8db70d

## 2026-10-16 smoke
- workflow: smoke
- conclusion: failure
- commit: c559ad5

## 2026-10-16 smoke
- workflow: smoke
- conclusion: failure
- commit: 3ec283b

## 2026-10-16 smoke
- workflow: smoke
- conclusion: failure
- commit: 1aba4e1

## 2026-10-17 smoke
- workflow: smoke
- conclusion: failure
- commit: 28ce6d4

## 2026-10-17 smoke
- workflow: smoke
- conclusion: failure
- commit: 2258313

## 2026-10-17 scout
- workflow: scout
- conclusion: failure
- commit: 5e8e18d

## 2026-10-17 smoke
- workflow: smoke
- conclusion: failure
- commit: d8a85d6

## 2026-10-17 smoke
- workflow: smoke
- conclusion: failure
- commit: 68521c8

## 2026-10-17 smoke
- workflow: smoke
- conclusion: failure
- commit: 2670b7b

## 2026-10-17 smoke
- workflow: smoke
- conclusion: failure
- commit: 490a2a5

## 2026-10-18 smoke
- workflow: smoke
- conclusion: failure
- commit: 51ebcd9

## 2026-10-18 smoke
- workflow: smoke
- conclusion: failure
- commit: 680cd7e

## 2026-10-18 smoke
- workflow: smoke
- conclusion: failure
- commit: 20f4dec

## 2026-10-18 scout
- workflow: scout
- conclusion: failure
- commit: af6aca6

## 2026-10-18 smoke
- workflow: smoke
- conclusion: failure
- commit: e83c88d

## 2026-10-18 smoke
- workflow: smoke
- conclusion: failure
- commit: e70fcb0

## 2026-10-18 smoke
- workflow: smoke
- conclusion: failure
- commit: 6b58f8e

## 2026-10-18 smoke
- workflow: smoke
- conclusion: failure
- commit: 7e46d75

## 2026-10-19 smoke
- workflow: smoke
- conclusion: failure
- commit: c40ecb7

## 2026-10-19 smoke
- workflow: smoke
- conclusion: failure
- commit: 9b73d71

## 2026-10-19 smoke
- workflow: smoke
- conclusion: failure
- commit: 1e4ffab

## 2026-10-19 scout
- workflow: scout
- conclusion: failure
- commit: e304496

## 2026-10-19 smoke
- workflow: smoke
- conclusion: failure
- commit: a7febfb

## 2026-10-20 smoke
- workflow: smoke
- conclusion: failure
- commit: 4b5f5c9

## 2026-10-20 smoke
- workflow: smoke
- conclusion: failure
- commit: c8039cf

## 2026-10-20 smoke
- workflow: smoke
- conclusion: failure
- commit: 959fa32

## 2026-10-20 scout
- workflow: scout
- conclusion: failure
- commit: 2f5e968

## 2026-10-20 smoke
- workflow: smoke
- conclusion: failure
- commit: 25c24d0

## 2026-10-20 smoke
- workflow: smoke
- conclusion: failure
- commit: 25cc8f6

## 2026-10-20 smoke
- workflow: smoke
- conclusion: failure
- commit: 1b0c483

## 2026-10-21 smoke
- workflow: smoke
- conclusion: failure
- commit: 792bb87

## 2026-10-21 smoke
- workflow: smoke
- conclusion: failure
- commit: a012cc1
