#!/usr/bin/env bash
# ocr_gate.sh: local OCR text gate for generated (MADE) footage. macOS only (Apple Vision via ocr.swift).
#
# Usage:
#   ocr_gate.sh [--every N] [--tile-every M] [--min-conf 0.5] [--keep-frames] <out_dir> <video> [<video> ...]
#
# Two passes per video:
#   A  every Nth frame (default 2) at native resolution
#   B  every Mth frame (default 6), cut into 2x2 overlapping tiles (60 % each) and scaled up 2x: what a viewer sees
#      after a pinch-zoom on a phone
# Writes <out_dir>/ocr-native.tsv and <out_dir>/ocr-tiles2x.tsv (file, confidence, text, box) and a summary of hits at or
# above --min-conf. Exit status 1 if any hit is found, so it can gate a pipeline.
#
# What to do with hits: crop every hit and look at it at 3x. Legible text in a MADE shot is a fail unless it is real and
# correct: invented plates (may match a real car), van liveries, shop fascias, brand marks, near-readable gibberish.
# Fix by trimming, blurring at the source frame, or killing the shot. Re-run the gate after any paint-out or blur, and
# on your own "Made with AI" tag (it must READ on every frame: one run's tag vanished on bright roofs).
# Caught in Oct 2026: a plate read "XR3 UKF" at confidence 1.0, and van livery earlier in a clip than a human noted.
# Never upload frames to third-party OCR or AI detectors: clips can contain unreleased product screens.
#
# Needs: ffmpeg, swiftc (Xcode command line tools). Builds ./ocr next to this script on first run.
set -euo pipefail

usage() { sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'; }
EVERY=2; TILE=6; MINC=0.5; KEEP=0
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --every) EVERY="$2"; shift 2 ;;
    --tile-every) TILE="$2"; shift 2 ;;
    --min-conf) MINC="$2"; shift 2 ;;
    --keep-frames) KEEP=1; shift ;;
    --) shift; break ;;
    -*) echo "unknown option $1" >&2; usage; exit 2 ;;
    *) break ;;
  esac
done
[ $# -ge 2 ] || { usage; exit 2; }
OUT="$1"; shift
HERE="$(cd "$(dirname "$0")" && pwd)"
OCR="$HERE/ocr"
if [ ! -x "$OCR" ] || [ "$HERE/ocr.swift" -nt "$OCR" ]; then
  command -v swiftc >/dev/null || { echo "swiftc not found (install Xcode command line tools)" >&2; exit 2; }
  swiftc -O "$HERE/ocr.swift" -o "$OCR"
fi
mkdir -p "$OUT"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/ocrgate.XXXX")"
: > "$OUT/ocr-native.tsv"; : > "$OUT/ocr-tiles2x.tsv"
for v in "$@"; do
  n="$(basename "${v%.*}")"
  d="$WORK/$n"; mkdir -p "$d/a" "$d/b"
  ffmpeg -v error -i "$v" -vf "select='not(mod(n\,$EVERY))'" -fps_mode passthrough -start_number 0 "$d/a/${n}-a%04d.png"
  ls "$d/a"/*.png >/dev/null 2>&1 && "$OCR" "$d/a"/*.png | sed "s/^/${n}\t/" >> "$OUT/ocr-native.tsv" || true
  ffmpeg -v error -i "$v" -filter_complex "[0:v]select='not(mod(n\,$TILE))',split=4[a][b][c][d];\
[a]crop=iw*0.6:ih*0.6:0:0,scale=iw*2:ih*2:flags=lanczos[a1];[b]crop=iw*0.6:ih*0.6:iw*0.4:0,scale=iw*2:ih*2:flags=lanczos[b1];\
[c]crop=iw*0.6:ih*0.6:0:ih*0.4,scale=iw*2:ih*2:flags=lanczos[c1];[d]crop=iw*0.6:ih*0.6:iw*0.4:ih*0.4,scale=iw*2:ih*2:flags=lanczos[d1]" \
    -map "[a1]" -fps_mode passthrough "$d/b/${n}-TL-%04d.png" -map "[b1]" -fps_mode passthrough "$d/b/${n}-TR-%04d.png" \
    -map "[c1]" -fps_mode passthrough "$d/b/${n}-BL-%04d.png" -map "[d1]" -fps_mode passthrough "$d/b/${n}-BR-%04d.png"
  ls "$d/b"/*.png >/dev/null 2>&1 && "$OCR" "$d/b"/*.png | sed "s/^/${n}\t/" >> "$OUT/ocr-tiles2x.tsv" || true
  if [ "$KEEP" = 1 ]; then mkdir -p "$OUT/frames"; mv "$d" "$OUT/frames/"; else rm -rf "$d"; fi
  echo "$n: OCR done"
done
rm -rf "$WORK"
# Frame numbers: pass A image index i = source frame i*EVERY; pass B index i = source frame i*TILE.
HITS="$(awk -F'\t' -v m="$MINC" '$3+0 >= m' "$OUT/ocr-native.tsv" "$OUT/ocr-tiles2x.tsv" | sort -u)"
if [ -n "$HITS" ]; then
  printf '%s\n' "$HITS" > "$OUT/ocr-hits.tsv"
  echo "OCR GATE: $(printf '%s\n' "$HITS" | wc -l | tr -d ' ') hits at confidence >= $MINC -> $OUT/ocr-hits.tsv (check each at 3x)"
  exit 1
fi
echo "OCR GATE: no text at confidence >= $MINC"
