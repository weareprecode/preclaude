#!/usr/bin/env bash
# Self-test for the QA gates on synthetic clips (needs ffmpeg, and numpy + opencv-python in $PY, default python3).
#   PY=/path/to/venv/python3 bash scripts/tests/qa_selftest.sh [--keep]
# Checks: take_qa.py PASS on a clean clip and FAIL on a one-frame flash; sharpness.py still and scan (a one-frame blur
# is a dip, a gate minimum fails); region_match.py same state vs changed state; frame_patch.py repairs the flash
# (pane patch leaves everything outside its box untouched) and the patched take passes.
set -uo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
PY="${PY:-python3}"
"$PY" -c "import numpy, cv2" 2>/dev/null || { echo "SKIP: $PY lacks numpy/opencv-python"; exit 0; }
command -v ffmpeg >/dev/null || { echo "SKIP: ffmpeg not on PATH"; exit 0; }
T="$(mktemp -d "${TMPDIR:-/tmp}/film-qa-test-XXXXXX")"
FAILS=0
ok() { if [ "$1" = 0 ]; then echo "ok   $2"; else echo "FAIL $2"; FAILS=$((FAILS + 1)); fi; }
ff() { ffmpeg -v error -y "$@"; }

# a still, detailed background with one object gliding across it at constant speed (what a clean capture looks like)
ff -f lavfi -i "smptehdbars=size=640x360:rate=30:duration=4" -f lavfi -i "rgbtestsrc=size=80x60:rate=30:duration=4" \
   -filter_complex "[0][1]overlay=x='40+t*120':y=150:shortest=1" -c:v libx264 -crf 12 -pix_fmt yuv420p "$T/clean.mp4"
ff -i "$T/clean.mp4" -vf "drawbox=x=0:y=0:w=iw:h=ih:color=white:t=fill:enable='eq(n,60)'" -c:v libx264 -crf 12 -pix_fmt yuv420p "$T/flash.mp4"
ff -i "$T/clean.mp4" -vf "gblur=sigma=6:enable='eq(n,45)'" -c:v libx264 -crf 12 -pix_fmt yuv420p "$T/softframe.mp4"

"$PY" -I "$HERE/take_qa.py" "$T/clean.mp4" --out "$T/qa-clean" --no-sheets > "$T/clean.log" 2>&1; rc=$?
v=$("$PY" -c "import json,sys; print(json.load(open(sys.argv[1]))['verdict'])" "$T/qa-clean/verdict.json" 2>/dev/null)
[ "$v" = PASS ] && [ $rc = 0 ]; ok $? "take_qa: clean clip PASS, exit 0 (got $v, $rc)"

"$PY" -I "$HERE/take_qa.py" "$T/flash.mp4" --out "$T/qa-flash" > "$T/flash.log" 2>&1; rc=$?
v=$("$PY" -c "import json,sys; print(json.load(open(sys.argv[1]))['verdict'])" "$T/qa-flash/verdict.json" 2>/dev/null)
[ "$v" = FAIL ] && [ $rc = 1 ] && [ -s "$T/qa-flash/flags.jpg" ] && [ -s "$T/qa-flash/sheet.jpg" ]; ok $? "take_qa: one-frame flash FAIL, exit 1, sheets written (got $v, $rc)"

ff -i "$T/clean.mp4" -vf "select=eq(n\,30)" -frames:v 1 "$T/still.png"
ff -i "$T/still.png" -vf "gblur=sigma=4" "$T/still-soft.png"
ff -i "$T/still.png" -vf "negate" "$T/still-other.png"
s=$("$PY" -I "$HERE/sharpness.py" still "$T/still.png" --box 100 50 540 310 | awk '{print $1}')
b=$("$PY" -I "$HERE/sharpness.py" still "$T/still-soft.png" --box 100 50 540 310 | awk '{print $1}')
"$PY" -c "import sys; sys.exit(0 if float(sys.argv[1]) > 3 * float(sys.argv[2]) else 1)" "$s" "$b"; ok $? "sharpness still: sharp $s against blurred $b"
"$PY" -I "$HERE/sharpness.py" still "$T/still-soft.png" --box 100 50 540 310 --min "$s" > /dev/null; [ $? = 1 ]; ok $? "sharpness still: --min fails a soft still"

"$PY" -I "$HERE/sharpness.py" scan "$T/softframe.mp4" --json "$T/scan.json" > /dev/null
"$PY" -c "import json,sys; r=json.load(open(sys.argv[1])); f=[d['frame'] for d in r['dips']]; sys.exit(0 if 45 in f and len(f) <= 3 else 1)" "$T/scan.json"; ok $? "sharpness scan: the blurred frame 45 is a dip"
"$PY" -I "$HERE/take_qa.py" "$T/softframe.mp4" --out "$T/qa-soft" --sharp-box 0 0 640 360 --no-sheets > /dev/null 2>&1; rc=$?
[ $rc = 3 ] || [ $rc = 1 ]; ok $? "take_qa: a one-frame soften is not a PASS (exit $rc)"
"$PY" -I "$HERE/take_qa.py" "$T/softframe.mp4" --out "$T/qa-soft2" --sharp-box 0 0 640 360 --allow 44-46 --accept jumps --no-sheets > /dev/null 2>&1; rc2=$?
[ $rc2 = 0 ]; ok $? "take_qa: --allow rules the reviewed dip benign (exit $rc2)"

"$PY" -I "$HERE/region_match.py" "$T/still.png" "$T/still.png" --box 100 50 540 310 > /dev/null; ok $? "region_match: same state passes"
"$PY" -I "$HERE/region_match.py" "$T/still-other.png" "$T/still.png" --box 100 50 540 310 > /dev/null; [ $? = 1 ]; ok $? "region_match: changed state fails"

mkdir -p "$T/frames"; ff -i "$T/flash.mp4" -start_number 0 "$T/frames/f%05d.png"
"$PY" -I "$HERE/frame_patch.py" "$T/frames" "$T/patched" --whole 60=59 --pane 30=29:10,10,200,120 > "$T/patch.log"; ok $? "frame_patch: runs"
"$PY" -c "import json,sys; p={x['frame']:x for x in json.load(open(sys.argv[1]))['patches']}; sys.exit(0 if p[30]['max_change_outside']==0 and p[60]['kind']=='whole' else 1)" "$T/patched/patches.json"; ok $? "frame_patch: pane patch leaves pixels outside its box untouched"
n1=$(ls "$T/frames" | grep -c png); n2=$(ls "$T/patched" | grep -c png)
! cmp -s "$T/frames/f00060.png" "$T/patched/f00060.png" && [ "$n1" -eq "$n2" ] && [ "$(stat -f %i "$T/frames/f00061.png" 2>/dev/null || stat -c %i "$T/frames/f00061.png")" = "$(stat -f %i "$T/patched/f00061.png" 2>/dev/null || stat -c %i "$T/patched/f00061.png")" ]; ok $? "frame_patch: patched frame differs, full sequence written ($n1/$n2), unpatched frames hard-linked"
ff -framerate 30 -start_number 0 -i "$T/patched/f%05d.png" -c:v libx264 -crf 12 -pix_fmt yuv420p "$T/patched.mp4"
"$PY" -I "$HERE/take_qa.py" "$T/patched.mp4" --out "$T/qa-patched" --no-sheets > /dev/null 2>&1; rc=$?
# the flash is gone (no FAIL); a whole-frame patch on a MOVING shot shows as a repeat at 60 and a skip at 61 (CHECK)
"$PY" -c "import json,sys; r=json.load(open(sys.argv[1])); sys.exit(0 if not r['fail'] and 60 in r['look_at'] else 1)" "$T/qa-patched/verdict.json"
[ $? = 0 ] && [ $rc = 3 ]; ok $? "take_qa: patched take has no FAIL; the whole-frame patch on motion is flagged CHECK at 60 (exit $rc)"
"$PY" -I "$HERE/take_qa.py" "$T/patched.mp4" --out "$T/qa-patched2" --allow 60-61 --no-sheets > /dev/null 2>&1; ok $? "take_qa: after review, --allow 60-61 gives PASS"

for s in take_qa.py sharpness.py region_match.py frame_patch.py frame_qa.py contact_sheet.py; do
  "$PY" -I "$HERE/$s" --help > /dev/null 2>&1; ok $? "$s --help"
done

if [ "${1:-}" = "--keep" ]; then echo "kept $T"; else rm -rf "$T"; fi
[ $FAILS = 0 ] && echo "all QA checks passed" || echo "$FAILS FAILED"
exit $FAILS
