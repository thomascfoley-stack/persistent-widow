# WIDOW_LOG.md — the Court's daily digest

And shall not God avenge his own elect, which cry day and night unto him? — Luke 18:7

Every run of the Persistent Widow appends a line here. Open issues carry the
evidence; this log is the running testimony.

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
