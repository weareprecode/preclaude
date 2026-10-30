#!/usr/bin/env python3
"""Run one Higgsfield generation job under a hard credit cap, and log it.

Every job goes through the same five steps, so parallel agents can never overspend:
  1. `higgsfield generate cost <same args>`: price the exact job first.
  2. Refuse if spent-so-far + this cost would exceed CAP - RESERVE. The reserve is kept back for judge-requested
     retakes; pass --reserve 0 only for those retakes or to use the last of the cap. CAP is never exceeded.
  3. Reserve the cost in the ledger JSON under a file lock (parallel jobs cannot overshoot).
  4. `higgsfield generate create <args> --wait --json`; save the raw JSON; download the first result untouched.
  5. Append a row to the Markdown job log (time, tag, job id, model, settings, prompt, credits, wall time, result).
A failed job keeps its reservation (conservative). Reconcile against the account balance at the end of the run
(`higgsfield account` or the web dashboard) and write the difference into your notes.

Usage:
  hf_job.py --ledger LEDGER.json --log LOG.md --raw-dir RAW/ --cap 1200 [--reserve 150] \
            --tag A01-D3-i2v --out /abs/MADE-A01.mp4 -- <model> --prompt "..." [--param value ...]

  Everything after `--` is passed verbatim to the Higgsfield CLI (`higgsfield generate cost|create`).
  The tag must be new: a tag that already has raw/<tag>.json is refused (no accidental double spend).
  Name every output MADE-... so generated footage can never be mistaken for a real capture.

Lessons baked in (Oct 2026 films):
  - Image-to-video from a start frame you have already checked passed about 95 % of the time; text-to-video about 29 %.
    Price both, but spend on i2v.
  - The cost command can hang when called in parallel (12 parallel upscale prices hung for 20 minutes), so it has a
    timeout. API outages happen mid-run: a timed-out create is logged as FAILED and keeps its reservation.
  - Never generate an app screen or UI. Leave screens blank and comp real captures on later.
  - An early wrapper read the first URL in the response and saved the START IMAGE as the video. This one reads
    `result_url` first. An undefined shell variable once sent an empty prompt; empty prompts are now refused.
  - The upscaler bills slightly more than its estimate (1.01 against 1.0), so always reconcile against the account.
  - Generators may train on what you upload: send only text prompts and your own generated frames, never screen
    recordings, personal photos or images with real people or number plates.

No dependencies beyond Python 3.9+ and the `higgsfield` CLI on PATH (already signed in). No keys are read or stored here.
"""
import argparse
import datetime
import fcntl
import json
import os
import re
import subprocess
import sys
import urllib.request


def sh(args, timeout=None):
    try:
        p = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return 124, "", f"timed out after {timeout} s"
    except FileNotFoundError:
        return 127, "", f"{args[0]} not found on PATH"
    return p.returncode, p.stdout, p.stderr


def locked_update(path, cap, fn):
    """Open the ledger under an exclusive lock, apply fn(ledger) -> (ledger, result), write it back."""
    with open(path, "a+") as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        try:
            f.seek(0)
            txt = f.read().strip()
            led = json.loads(txt) if txt else {"cap": cap, "spent": 0.0, "jobs": []}
            led, res = fn(led)
            if led is not None:
                f.seek(0)
                f.truncate()
                f.write(json.dumps(led, indent=1))
            return res
        finally:
            fcntl.flock(f, fcntl.LOCK_UN)


def parse():
    argv = sys.argv[1:]
    if "--" in argv:
        i = argv.index("--")
        mine, hf = argv[:i], argv[i + 1:]
    else:
        mine, hf = argv, []
    ap = argparse.ArgumentParser(
        description="Cost-capped Higgsfield job wrapper. Put Higgsfield CLI args after `--`.",
        formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("--ledger", required=True, help="ledger JSON (created if missing): cap, spent, jobs")
    ap.add_argument("--log", required=True, help="Markdown job log to append to (created with a header if missing)")
    ap.add_argument("--raw-dir", required=True, help="folder for the raw CLI JSON of each job (raw/<tag>.json)")
    ap.add_argument("--cap", type=float, required=True, help="hard credit cap for the whole run")
    ap.add_argument("--reserve", type=float, default=150.0, help="credits held back for judge retakes (default 150)")
    ap.add_argument("--tag", required=True, help="unique job tag, e.g. A01-D3-i2v-720")
    ap.add_argument("--out", required=True, help="absolute output path for the downloaded result (name it MADE-...)")
    ap.add_argument("--cost-timeout", type=int, default=180, help="seconds before the cost call is abandoned")
    ap.add_argument("--wait-timeout", default="25m", help="passed to `higgsfield generate create --wait-timeout`")
    ap.add_argument("--dry-run", action="store_true", help="price the job and check the cap, spend nothing")
    a = ap.parse_args(mine)
    if not hf:
        ap.error("no Higgsfield arguments: put `-- <model> --prompt ...` after the wrapper options")
    if "--prompt" in hf:
        i = hf.index("--prompt")
        if i + 1 >= len(hf) or not hf[i + 1].strip():
            # an undefined shell variable once sent a blank prompt silently; never again
            ap.error("empty --prompt (undefined shell variable?). Use `set -u` in job scripts.")
    return a, hf


def main():
    a, hf = parse()
    model = hf[0]
    if "MADE" not in os.path.basename(a.out):
        print(f"[{a.tag}] warning: output name has no MADE marker; generated footage should be labelled", file=sys.stderr)
    raw_json = os.path.join(a.raw_dir, f"{a.tag}.json")
    if os.path.exists(raw_json):
        sys.exit(f"[{a.tag}] already run ({raw_json} exists); use a new tag")

    rc, so, se = sh(["higgsfield", "generate", "cost"] + hf, timeout=a.cost_timeout)
    m = re.search(r"([\d.]+)\s*credits", so + se)
    if rc != 0 or not m:
        sys.exit(f"[{a.tag}] cost command failed (rc {rc}): {so.strip()} {se.strip()}")
    cost = float(m.group(1))
    limit = a.cap - a.reserve

    if a.dry_run:
        def peek(led):
            return None, led["spent"]
        spent = locked_update(a.ledger, a.cap, peek) if os.path.exists(a.ledger) else 0.0
        ok = spent + cost <= limit
        print(f"[{a.tag}] DRY RUN cost {cost}; spent {spent}; limit {limit} (cap {a.cap}, reserve {a.reserve}): "
              f"{'would run' if ok else 'would be REFUSED'}")
        return

    os.makedirs(a.raw_dir, exist_ok=True)
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def reserve(led):
        if led["spent"] + cost > limit:
            return None, (False, led["spent"])
        led["spent"] = round(led["spent"] + cost, 2)
        led["jobs"].append({"tag": a.tag, "model": model, "cost": cost, "status": "reserved", "time": now})
        return led, (True, led["spent"])

    ok, spent = locked_update(a.ledger, a.cap, reserve)
    if not ok:
        sys.exit(f"[{a.tag}] REFUSED by cap: spent {spent} + {cost} > {limit} (cap {a.cap}, reserve {a.reserve})")
    print(f"[{a.tag}] cost {cost} credits; run total now {spent} of {a.cap}", flush=True)

    t0 = datetime.datetime.now()
    rc, so, se = sh(["higgsfield", "generate", "create"] + hf + ["--wait", "--wait-timeout", a.wait_timeout, "--json"])
    t1 = datetime.datetime.now()
    with open(raw_json, "w") as f:
        f.write(so + ("\n--stderr--\n" + se if se else ""))
    urls = (re.findall(r'"result_url"\s*:\s*"(https://[^"]+)"', so)
            or re.findall(r"https://[^\"\s]+\.(?:mp4|png|jpg|jpeg|webp|mov)", so))
    jid = re.search(r'"id"\s*:\s*"([0-9a-f-]{36})"', so)
    status = "ok" if (rc == 0 and urls) else f"FAILED rc={rc}"
    path = ""
    if urls:
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        try:
            urllib.request.urlretrieve(urls[0], a.out)
            path = a.out
        except Exception as e:  # keep the job id so the result can be fetched later
            status = f"DOWNLOAD FAILED ({e.__class__.__name__})"

    def finish(led):
        for j in reversed(led["jobs"]):
            if j["tag"] == a.tag:
                j.update(status=status, job_id=jid.group(1) if jid else None, out=path)
                break
        return led, None

    locked_update(a.ledger, a.cap, finish)

    params, prompt, k = [], "", 1
    while k < len(hf):
        if hf[k] == "--prompt" and k + 1 < len(hf):
            prompt = hf[k + 1]
            k += 2
            continue
        if k + 1 < len(hf) and not hf[k + 1].startswith("--"):
            params.append(f"{hf[k]} {hf[k + 1]}")
            k += 2
        else:
            params.append(hf[k])
            k += 1

    def clean(s):
        return s.replace("|", "/").replace("\n", " ")

    if not os.path.exists(a.log):
        with open(a.log, "w") as f:
            f.write(f"# Higgsfield job log\n\nCap: {a.cap:g} credits, {a.reserve:g} held back for retakes. Credits are the "
                    "cost command's figure, run before each job and reserved in the ledger. Every output is MADE.\n\n"
                    "| Time | Tag | Job id | Model | Settings | Prompt | Credits | Wall time | Status | Result path |\n"
                    "|---|---|---|---|---|---|---|---|---|---|\n")
    with open(a.log, "a") as f:
        f.write(f"| {t0:%Y-%m-%d %H:%M} | {a.tag} | {jid.group(1) if jid else '-'} | {model} | "
                f"{clean('; '.join(params))} | {clean(prompt)} | {cost:g} | {int((t1 - t0).total_seconds())} s | "
                f"{status} | {clean(path) or '-'} |\n")
    print(f"[{a.tag}] {status} in {int((t1 - t0).total_seconds())} s -> {path or (so[-400:] + se[-400:])}", flush=True)
    if not status.startswith("ok"):
        sys.exit(1)


if __name__ == "__main__":
    main()
