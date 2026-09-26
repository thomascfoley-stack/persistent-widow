# Corpus pipeline guard

Snapshot of the corpus that feeds ancientpaths.app, synced from the corpus repo:

```bash
npm run sync-manifest          # default source: ~/Documents/Default Project/data
MANIFEST_SOURCE=/elsewhere npm run sync-manifest
```

- `manifest.snapshot.jsonl` — canonical index of every work (the app's library count must match this)
- `traditions.json` — controlled vocabularies

The seeded regressions (`filename-headings`, `part-splitting`) assert against this
snapshot on every run: raw-filename titles and non-contiguous multi-volume ordinals
are caught here even before they reach the app.
