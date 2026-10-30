#!/usr/bin/env node
/**
 * film_rig.mjs: deterministic, frame-stepped capture of a web page or an HTML card on a VIRTUAL CLOCK.
 *
 * Why: recording a live page in real time, or screenshotting it against wall time, makes every page animation
 * (route dashes, pulses, map fades, feed refreshes) alias into a strobe that never shows in a live browser. Here the
 * clock advances exactly 1/fps per captured frame. Production result: 0 blinks, against 164 and 209 blink blobs per
 * shot with real timers.
 *
 * CLOCK MODEL (v2, Oct 2026). The rig only takes the clock over while it captures:
 *   1. Load, setup, prewarm, refine hold and gate run on the browser's OWN clock: native requestAnimationFrame (real
 *      vsync) and the native performance.now timeline (Date.now stays consistent with it).
 *   2. When the first frame is about to be shot, the rig "steps": performance.now and Date.now freeze to a virtual
 *      time that advances exactly 1/fps per frame, and requestAnimationFrame callbacks queue and run only when the rig
 *      advances. A native callback still pending at that moment is moved onto the queue, so it too sees virtual time.
 *   Lessons behind this (Oct 2026 twin films, measured):
 *   - Replacing requestAnimationFrame from page load (v1 of this rig) stopped a streamed photoreal mesh refining past
 *     its first detail level: crop sharpness 29.8 against 116 on the plain page. Every take was soft.
 *   - An idle 8 ms flush loop running alongside native rAF left the page in a settled state the plain product never
 *     shows (a tree row drawn as bare branches, a water layer drawn across a roof). v2 runs no idle loop unless the
 *     legacy shim or virtual timers need it.
 *   - Streamed content (3D tiles, photoreal meshes, splats, progressive images) can keep refining 15 to 45 s AFTER
 *     the page reports loaded. A ready expression cannot see this: hold on the real clock (refineHold) and gate on
 *     measured sharpness before the first frame.
 *   - Views first reached under the stepped clock stay at whatever detail is cached. Every pose a take shows must be
 *     visited on the real clock first (prewarm, which now runs on the real clock).
 *   - A crashed take resumed in a new browser session restarts page simulations (particles, trails): a visible splice.
 *     For takes like that set FILM_ATTEMPTS=1 and retry the whole take instead.
 *
 * Usage:
 *   node film_rig.mjs page <scene.mjs> [--from 0] [--to N] [--out DIR]
 *   node film_rig.mjs card <file.html|url>[?query] <seconds> <outdir> [--fps 30] [--size 1280x720] [--dpr 2]
 *                     [--alpha] [--t0 0]
 *
 * page mode: <scene.mjs> default-exports (defaults after "=")
 *   { name, url, width, height, dpr=1, total (seconds), fps=30, colorScheme='light', chromeArgs=[],
 *     virtualTimers=false,   // also put page setTimeout/setInterval on the virtual clock (live feeds poll at film pace)
 *     nativeRaf=true,        // false = legacy v1 shim: rAF queued from page load (only for pages that need it)
 *     init: "js string",     // extra init script (runs before page scripts), e.g. log feed polls
 *     css: "...",            // injected after load and again after setup (hide chrome, cookie bars, carets)
 *     setup: async (page, state) => {},       // wait for readiness, hide layers, set fade durations to 0
 *     frame: async (page, t, i, state) => {}, // put the page in its state for time t; i = -1 during prewarm
 *     ready: "js expression",  // true when the frame is fully drawn, e.g. "map.loaded() && map.areTilesLoaded()"
 *     diag: "js expression",   // logged when a settle is capped (first 5, then every 20th): say WHY it was not ready
 *     verify: "js expression", // false after a screenshot = the page moved under it: settle and re-shoot (up to 3)
 *     prewarm=true,            // visit poses on the REAL clock before capture (default every prewarmStep seconds)
 *     prewarmStep=0.5, prewarmTimes=[...seconds], prewarmHold=0 (s of real time per pose after ready),
 *     refineHold=0,            // s of real time at the first frame's pose before capture (45 to 75 s for streamed 3D)
 *     refineReady: "js expression", // optional: end the refine hold early once this is true (after refineMin s)
 *     refineMin=0,
 *     gate: { box: [x0, y0, x1, y1], min: 90 } | async (page, state, tools) => ({ ok, ...metrics }),
 *                              // sharpness gate on a still at the first pose; box in screenshot (device) pixels
 *     substeps=1,              // advance the clock in N equal steps per shot frame, each with its own rAF flush
 *                              // (a 60 Hz simulation shot at 30 fps: substeps 2, no frame blending)
 *     minFlushes=2, maxSettle=160 (polls of 25 ms per frame), prewarmSettle=maxSettle }
 *   Frames land in DIR/f00000.png ... Existing frames are skipped, so a crashed run resumes (see the splice warning).
 *   The rig logs how many settles ended "loaded" against "capped", so QA can say how many frames were fully drawn.
 *   Gate stills and results are written next to DIR as gate-<name>-a<attempt>.png and gate-<name>.json.
 *
 * Environment (overrides the scene; defaults in brackets):
 *   FILM_NATIVE_RAF [1]        0 = legacy v1 shim (rAF queued from page load). Only to reproduce old takes.
 *   FILM_REFINE_HOLD [scene]   seconds of real-clock hold at the first pose before capture.
 *   FILM_GATE_BOX [scene]      x0,y0,x1,y1 in screenshot pixels for the sharpness gate.
 *   FILM_GATE_MIN [scene]      minimum sharpness (Laplacian variance of luma in the box). A refused gate fails the
 *                              attempt, so the next attempt reloads the page (some loads settle in a bad state).
 *   FILM_ATTEMPTS [6]          attempts per run. Use 1 for takes whose page state cannot be spliced, and retry whole.
 *   FILM_SHOT_TIMEOUT [300000] screenshot timeout in ms (4K frames of heavy pages can take minutes under load).
 *   FILM_HEADLESS [1]          0 = show the browser (debugging only; never capture a take headed).
 *   FILM_DIAG [unset]          1 = log the scene's diag expression on slow settles and the time each screenshot took.
 *
 * Calibrating the gate: shoot the plain page (no rig, same viewport and pose) after a 75 s real-clock hold, measure
 * the box with `sharpness.py still`, and set min to about 80 % of that. Pick a box with fine fixed detail (a sign,
 * text on a roof, a facade) that no UI or animation crosses. The rig and sharpness.py use the same measure.
 *
 * card mode: renders an HTML card as a pure function of time. The page either exposes window.render(t) (seconds), or
 *   uses CSS/Web Animations, which are all paused and set to currentTime = t. Waits for document.fonts.ready. Animate
 *   transform and opacity only; no Date.now, timers, CSS transitions or unseeded random in cards.
 *
 * Capture rules that go with this rig:
 *   - route lines: film-owned layers with CONSTANT paint; reveal by slicing source geometry, never by animating paint;
 *     no dash arrays on solid lines; source tolerance 0 for growing lines; subpixel/translate3d for DOM overlays.
 *   - hide or retake anything that animates by itself (pulse rings, blinking carets, cross-dissolving layers).
 *   - line up live-feed refreshes OUTSIDE the shot (advance the clock without filming until the next poll is due).
 *   - run one live-page capture at a time: GPU contention caused timeouts and remounts (22 to 86 render seconds per
 *     film second under load). Check each layer still has data at capture time; save a per-shot data-check JSON.
 *   - on macOS, chromeArgs ["--use-angle=metal"] gave the most stable WebGL captures.
 *   - then run take_qa.py on the encoded take (frame QA, sharpness scan, contact sheet, one verdict).
 *
 * Needs Node 18+ and playwright-core (or playwright) with Google Chrome installed: npm i playwright-core
 */
import { mkdirSync, existsSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const HELP = `usage:
  node film_rig.mjs page <scene.mjs> [--from 0] [--to N] [--out DIR]
  node film_rig.mjs card <file.html|url>[?query] <seconds> <outdir> [--fps 30] [--size 1280x720] [--dpr 2] [--alpha] [--t0 0]
env: FILM_NATIVE_RAF=1 FILM_REFINE_HOLD=<s> FILM_GATE_BOX=x0,y0,x1,y1 FILM_GATE_MIN=<n> FILM_ATTEMPTS=6
     FILM_SHOT_TIMEOUT=300000 FILM_HEADLESS=1 FILM_DIAG=
(see the header of this file for the clock model, the scene module format and the capture rules)`;
const flag = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const env = (k, d) => (process.env[k] === undefined || process.env[k] === "" ? d : process.env[k]);

async function chromium() {
  for (const m of ["playwright-core", "playwright"]) {
    try { return (await import(m)).chromium; } catch {}
  }
  console.error("needs playwright-core or playwright: npm i playwright-core"); process.exit(2);
}

// Injected before any page script. Native clock until __film.step(); virtual clock after it.
export const CLOCK = `(() => {
  if (window.__film) return;
  let vt = 0, stepping = false;
  const realNow = performance.now.bind(performance);
  // Before stepping, performance.now IS the browser's own timeline (no offset), so it agrees with native rAF timestamps.
  const dateBase = Date.now() - realNow();
  performance.now = () => stepping ? vt : (vt = realNow());
  Date.now = () => Math.round(dateBase + performance.now());
  const LEGACY = window.__filmNativeRaf === false;
  const nRAF = window.requestAnimationFrame.bind(window), nCAF = window.cancelAnimationFrame.bind(window);
  let q = [], id = 0;
  const moved = new Map(); // native id -> queue id, for callbacks still pending when stepping started
  window.requestAnimationFrame = (cb) => {
    if (!stepping && !LEGACY) {
      let nid = 0;
      nid = nRAF((ts) => {
        if (!stepping) { cb(ts); return; }
        const vid = ++id; moved.set(nid, vid); q.push([vid, cb]);
      });
      return -nid; // native ids are negated so cancelAnimationFrame can tell them apart
    }
    q.push([++id, cb]); return id;
  };
  window.cancelAnimationFrame = (i) => {
    if (i < 0) { const vid = moved.get(-i); if (vid) { q = q.filter((c) => c[0] !== vid); moved.delete(-i); } else nCAF(-i); }
    else q = q.filter((c) => c[0] !== i);
  };
  const flush = () => { const run = q; q = []; const now = performance.now(); for (const [, cb] of run) { try { cb(now); } catch (e) { console.error(e); } } };
  const rSI = window.setInterval.bind(window);
  const timers = new Map(); let tid = 1e7;
  const VT = !!window.__filmVirtualTimers;
  if (VT) {
    window.setTimeout = (fn, d, ...a) => { const i = ++tid; timers.set(i, { fn, a, due: performance.now() + Math.max(0, +d || 0), every: 0 }); return i; };
    window.setInterval = (fn, d, ...a) => { const i = ++tid; const e = Math.max(4, +d || 0); timers.set(i, { fn, a, due: performance.now() + e, every: e }); return i; };
    window.clearTimeout = window.clearInterval = (i) => { timers.delete(i); };
  }
  const runTimers = () => {
    if (!VT) return;
    const now = performance.now();
    for (let g = 0; g < 2000; g++) {
      let bi = null, bt = null;
      for (const [i, t] of timers) if (t.due <= now && (!bt || t.due < bt.due)) { bi = i; bt = t; }
      if (!bt) break;
      if (bt.every) { bt.due += bt.every; if (bt.due <= now) bt.due = now + bt.every; } else timers.delete(bi);
      try { typeof bt.fn === "function" ? bt.fn(...bt.a) : (0, eval)(String(bt.fn)); } catch (e) { console.error(e); }
    }
  };
  // No idle loop with native rAF: it changed how streamed content settled. Only the legacy shim (whose queue would
  // otherwise never drain) and virtual timers (which must fire before stepping) need one.
  if (LEGACY || VT) rSI(() => { if (!stepping) { runTimers(); flush(); } }, 8);
  window.__film = {
    step() { if (!stepping) { vt = realNow(); stepping = true; } },
    stepping() { return stepping; },
    advance(ms) { if (stepping) vt += ms; runTimers(); flush(); return q.length; },
    now() { return performance.now(); },
    pending() { return q.length; },
    timers() { return timers.size; },
    mode() { return LEGACY ? "legacy" : "native"; },
  };
})();`;

// Variance of the 4-neighbour Laplacian of BT.601 luma, over the whole PNG. Same measure as sharpness.py.
export async function pngSharpness(browser, png) {
  const p = await browser.newPage();
  try {
    return await p.evaluate(async (b64) => {
      const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
      const w = img.naturalWidth, h = img.naturalHeight;
      const c = new OffscreenCanvas(w, h); const g = c.getContext("2d", { willReadFrequently: true, colorSpace: "srgb" });
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, w, h).data;
      const Y = new Float64Array(w * h);
      for (let i = 0; i < w * h; i++) Y[i] = 0.299 * d[4 * i] + 0.587 * d[4 * i + 1] + 0.114 * d[4 * i + 2];
      let s = 0, s2 = 0, n = 0;
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x; const L = Y[i - 1] + Y[i + 1] + Y[i - w] + Y[i + w] - 4 * Y[i]; s += L; s2 += L * L; n++;
      }
      const m = s / n; return Math.round((s2 / n - m * m) * 10) / 10;
    }, png.toString("base64"));
  } finally { await p.close(); }
}

async function pageMode() {
  const scene = (await import(pathToFileURL(resolve(argv[1])).href)).default;
  const FPS = scene.fps ?? 30, FRAMES = Math.round(scene.total * FPS);
  const from = Number(flag("from", 0)), to = Number(flag("to", FRAMES));
  const outDir = resolve(flag("out", join("captures", scene.name, "frames")));
  mkdirSync(outDir, { recursive: true });
  const gateDir = dirname(outDir);
  const ready = scene.ready ?? "true";
  const nativeRaf = env("FILM_NATIVE_RAF", scene.nativeRaf === false ? "0" : "1") !== "0";
  const refineHold = Number(env("FILM_REFINE_HOLD", scene.refineHold ?? 0));
  const SUB = Math.max(1, Math.round(scene.substeps ?? 1));
  const MIN_FLUSH = scene.minFlushes ?? 2;
  const SHOT_TIMEOUT = Number(env("FILM_SHOT_TIMEOUT", 300000));
  const ATTEMPTS = Math.max(1, Number(env("FILM_ATTEMPTS", 6)));
  const DIAG = !!process.env.FILM_DIAG;
  let gate = scene.gate;
  if (process.env.FILM_GATE_BOX || process.env.FILM_GATE_MIN) {
    if (typeof gate === "function") { console.error("FILM_GATE_BOX/MIN cannot override a gate function"); process.exit(2); }
    const box = process.env.FILM_GATE_BOX ? process.env.FILM_GATE_BOX.split(",").map(Number) : gate?.box;
    const min = process.env.FILM_GATE_MIN ? Number(process.env.FILM_GATE_MIN) : gate?.min;
    if (!box || box.length !== 4 || box.some((v) => !Number.isFinite(v)) || !Number.isFinite(min)) {
      console.error("the sharpness gate needs both a box (x0,y0,x1,y1) and a min"); process.exit(2);
    }
    gate = { box, min };
  }
  const existing = readdirSync(outDir).filter((f) => /^f\d{5}\.png$/.test(f)).length;
  if (existing) console.log(`[${scene.name}] resuming: ${existing} frames already in ${outDir}. A new session restarts page simulations; check the join, or retake whole.`);
  console.log(`[${scene.name}] clock ${nativeRaf ? "native until capture" : "LEGACY shim from load"}, refine hold ${refineHold} s, substeps ${SUB}, gate ${gate ? (typeof gate === "function" ? "scene function" : `box ${gate.box} min ${gate.min}`) : "none"}`);
  const chrome = await chromium();
  let browser;
  const run = async (attempt) => {
    browser = await chrome.launch({ channel: "chrome", headless: env("FILM_HEADLESS", "1") !== "0",
      args: ["--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars", "--mute-audio", ...(scene.chromeArgs ?? [])] });
    const ctx = await browser.newContext({ viewport: { width: scene.width, height: scene.height },
      deviceScaleFactor: scene.dpr ?? 1, colorScheme: scene.colorScheme ?? "light", reducedMotion: "no-preference" });
    if (scene.virtualTimers) await ctx.addInitScript("window.__filmVirtualTimers = true;");
    if (!nativeRaf) await ctx.addInitScript("window.__filmNativeRaf = false;");
    if (scene.clock !== false) await ctx.addInitScript(CLOCK);
    if (scene.init) await ctx.addInitScript(scene.init);
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.error("[pageerror]", e.message));
    page.on("crash", () => console.error("[crash] renderer crashed"));
    console.log(`[${scene.name}] open ${scene.url}`);
    await page.goto(scene.url, { waitUntil: "domcontentloaded", timeout: 120000 });
    if (scene.css) await page.addStyleTag({ content: scene.css });
    const state = {};
    await scene.setup?.(page, state);
    if (scene.css) await page.addStyleTag({ content: scene.css });
    const evalBool = (expr) => page.evaluate((e) => { try { return !!(0, eval)(e); } catch { return false; } }, expr);
    const stats = { loaded: 0, capped: 0 };
    let cap = scene.prewarmSettle ?? scene.maxSettle ?? 160;
    const settle = async () => {
      let ok = false;
      for (let k = 0; k < cap; k++) {
        const done = await page.evaluate((expr) => { window.__film?.advance(0); try { return !!(0, eval)(expr); } catch { return false; } }, ready);
        if (done && k >= MIN_FLUSH) { ok = true; break; }
        if (k === 40 && DIAG && scene.diag) console.log("[diag]", JSON.stringify(await page.evaluate((e) => { try { return (0, eval)(e); } catch (x) { return String(x); } }, scene.diag)));
        await page.waitForTimeout(25);
      }
      stats[ok ? "loaded" : "capped"]++;
      if (!ok && scene.diag && (stats.capped <= 5 || stats.capped % 20 === 0))
        console.log("[capped]", stats.capped, JSON.stringify(await page.evaluate((e) => { try { return (0, eval)(e); } catch (x) { return String(x); } }, scene.diag)));
      await page.evaluate(() => window.__film?.advance(0));
    };

    // 1. Prewarm on the REAL clock: visit every pose the take will show, so streamed detail is cached and refined.
    if (scene.prewarm !== false && scene.frame) {
      const times = scene.prewarmTimes ?? (() => { const ts = []; for (let t = 0; t <= scene.total + 1e-9; t += scene.prewarmStep ?? 0.5) ts.push(Math.min(t, scene.total)); return ts; })();
      for (const t of times) {
        await scene.frame(page, t, -1, state);
        await settle();
        if (scene.prewarmHold) await page.waitForTimeout(scene.prewarmHold * 1000);
      }
      console.log(`[${scene.name}] prewarm (real clock, ${times.length} poses) settles ${JSON.stringify(stats)}`);
    }
    // 2. Back to the first frame's pose and hold on the real clock while streamed content refines.
    if (scene.frame) { await scene.frame(page, from / FPS, -1, state); await settle(); }
    if (refineHold > 0) {
      const t0 = Date.now(), min = (scene.refineMin ?? 0) * 1000;
      while (Date.now() - t0 < refineHold * 1000) {
        await page.waitForTimeout(500);
        if (scene.refineReady && Date.now() - t0 >= min && await evalBool(scene.refineReady)) break;
      }
      console.log(`[${scene.name}] refine hold ${((Date.now() - t0) / 1000).toFixed(1)} s (real clock)`);
    }
    // 3. Gate: refuse the take (and let the next attempt reload) if the first pose is not sharp enough.
    if (gate) {
      const still = join(gateDir, `gate-${scene.name}-a${attempt}.png`);
      await page.screenshot({ path: still, timeout: SHOT_TIMEOUT });
      let res;
      if (typeof gate === "function") {
        res = await gate(page, state, { sharpness: async (box) => {
          const dpr = scene.dpr ?? 1, [x0, y0, x1, y1] = box;
          return pngSharpness(browser, await page.screenshot({ clip: { x: x0 / dpr, y: y0 / dpr, width: (x1 - x0) / dpr, height: (y1 - y0) / dpr }, timeout: SHOT_TIMEOUT }));
        }, still });
      } else {
        const dpr = scene.dpr ?? 1, [x0, y0, x1, y1] = gate.box;
        const crop = await page.screenshot({ clip: { x: x0 / dpr, y: y0 / dpr, width: (x1 - x0) / dpr, height: (y1 - y0) / dpr }, timeout: SHOT_TIMEOUT });
        const sharpness = await pngSharpness(browser, crop);
        res = { ok: sharpness >= gate.min, sharpness, min: gate.min, box: gate.box };
      }
      res = { ...res, attempt, still, at: new Date().toISOString() };
      writeFileSync(join(gateDir, `gate-${scene.name}.json`), JSON.stringify(res, null, 1));
      console.log(`[${scene.name}] gate ${res.ok ? "PASS" : "REFUSED"} ${JSON.stringify(res)}`);
      if (!res.ok) throw new Error(`gate refused (${JSON.stringify(res)})`);
    }
    // 4. Capture: from here the page runs on the virtual clock.
    await page.evaluate(() => window.__film?.step());
    stats.loaded = 0; stats.capped = 0; cap = scene.maxSettle ?? 160;
    const t0 = Date.now();
    for (let i = from; i < to; i++) {
      const f = join(outDir, `f${String(i).padStart(5, "0")}.png`);
      if (existsSync(f)) continue;
      if (page.isClosed()) throw new Error("page closed");
      await scene.frame?.(page, i / FPS, i, state);
      for (let k = 0; k < SUB; k++) await page.evaluate((ms) => window.__film?.advance(ms), 1000 / FPS / SUB);
      await settle();
      const tShot = Date.now();
      await page.screenshot({ path: f, timeout: SHOT_TIMEOUT });
      if (DIAG) console.log("[shot ms]", Date.now() - tShot);
      for (let r = 0; r < 3 && scene.verify && !(await page.evaluate((e) => { try { return !!(0, eval)(e); } catch { return true; } }, scene.verify)); r++) {
        stats.reshot = (stats.reshot ?? 0) + 1;
        await settle();
        await page.screenshot({ path: f, timeout: SHOT_TIMEOUT });
      }
      if (i % 30 === 0) console.log(`[${scene.name}] ${i}/${FRAMES} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    console.log(`[${scene.name}] capture settles ${JSON.stringify(stats)} (capped = frames shot before the ready test passed)`);
    await browser.close();
  };
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try { await run(attempt); return; }
    catch (e) {
      try { await browser?.close(); } catch {}
      console.error(`[${scene.name}] attempt ${attempt}/${ATTEMPTS} failed: ${String(e.message).split("\n")[0]}`);
      if (attempt === ATTEMPTS) process.exit(String(e.message).startsWith("gate refused") ? 3 : 1);
    }
  }
}

async function cardMode() {
  const [src, secs, out] = argv.slice(1, 4);
  if (!src || !secs || !out) { console.log(HELP); process.exit(2); }
  const FPS = +flag("fps", 30), T0 = +flag("t0", 0), N = Math.round(+secs * FPS);
  const [VW, VH] = flag("size", "1280x720").split("x").map(Number);
  const DPR = +flag("dpr", 2), alpha = argv.includes("--alpha");
  mkdirSync(out, { recursive: true });
  const [file, query] = src.split("?");
  const url = /^https?:/.test(file) ? src : pathToFileURL(resolve(file)).href + (query ? "?" + query : "");
  const chrome = await chromium();
  const browser = await chrome.launch({ channel: "chrome", headless: env("FILM_HEADLESS", "1") !== "0", args: ["--allow-file-access-from-files", "--disable-gpu"] });
  const page = await (await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR })).newPage();
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  for (let i = 0; i < N; i++) {
    await page.evaluate((ms) => {
      if (window.render) window.render(ms / 1000);
      for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; }
    }, T0 * 1000 + (i * 1000) / FPS);
    await page.screenshot({ path: join(out, `f${String(i).padStart(5, "0")}.png`), omitBackground: alpha });
  }
  await browser.close();
  console.log(`${N} frames -> ${out}`);
}

// Run only as a script (the self-test imports CLOCK and pngSharpness). realpath: the skill is often reached by symlink.
const isMain = (() => { try { return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } })();
if (isMain) {
  if (!argv.length || argv.includes("--help") || argv.includes("-h")) { console.log(HELP); process.exit(0); }
  if (argv[0] === "page") await pageMode();
  else if (argv[0] === "card") await cardMode();
  else { console.log(HELP); process.exit(2); }
}
