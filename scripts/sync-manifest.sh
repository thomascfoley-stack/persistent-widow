#!/usr/bin/env bash
set -euo pipefail

SOURCE="${MANIFEST_SOURCE:-$HOME/Documents/Default Project/data}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/corpus"

cp "$SOURCE/manifest.jsonl" "$DEST/manifest.snapshot.jsonl"
cp "$SOURCE/traditions.json" "$DEST/traditions.json"

echo "synced manifest: $(wc -l < "$DEST/manifest.snapshot.jsonl") records from $SOURCE"
