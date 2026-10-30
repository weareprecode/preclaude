#!/usr/bin/env node
/**
 * film_rig.mjs: deterministic, frame-stepped capture of a web page or an HTML card on a VIRTUAL CLOCK.
 *
 * Why: recording a live page in real time, or screenshotting it against wall time, makes every page animation
 * (route dashes, pulses, map fades, feed refreshes) alias into a strobe that never shows in a live browser. Here
 * performance.now, Date.now and requestAnimationFrame (and optionally setTimeout/setInterval) are replaced BEFORE any
 * page script runs, and the clock advances exactly 1/fps per captured frame. Production result: 0 blinks, against 164 and
 * 209 blink blobs per bus shot with real timers.
 *
 * Usage:
 *   node film_rig.mjs page <scene.mjs> [--from 0] [--to N] [--out DIR]
 *   node film_rig.mjs card <file.html|url>[?query] <seconds> <outdir> [--fps 30] [--size 1280x720] [--dpr 2]
 *                     [--alpha] [--t0 0]
 *
 * page mode: <scene.mjs> default-exports
 *   { name, url, width, height, dpr=1, total (seconds), fps=30, colorScheme='light',
 *     virtualTimers=false,      // put page setTimeout/setInterval on the virtual clock (live feeds poll at viewer pace)
 *     init: "js string",        // extra init script (runs before page scripts), e.g. log feed polls
 *     css: "...",               // injected after load and again after setup (hide chrome, cookie bars, carets)
 *     setup: async (page, state) => {},   // wait for readiness, hide layers, set fade durations to 0
 *     frame: async (page, t, i, state) => {},  // put the page in its state for time t (camera, reveal); i=-1 in prewarm
 *     ready: "js expression",   // true when the frame is fully drawn, e.g. "window.map.loaded() && window.map.areTilesLoaded()"
 *     prewarm=true, prewarmStep=0.5, prewarmSettle=160, maxSettle=160 }
 *   Frames land in DIR/f00000.png ... Existing frames are skipped, so a crashed run resumes. Up to 6 attempts.
 *   It logs how many settles ended "loaded" against "capped", so QA can say how many frames had every tile loaded.
 *
 * card mode: renders an HTML card as a pure function of time. The page either exposes window.render(t) (seconds), or
 *   uses CSS/Web Animations, which are all paused and set to currentTime = t. Waits for document.fonts.ready. Animate
 *   transform and opacity only; no Date.now, timers, CSS transitions or unseeded random in cards.
 *
 * Capture rules that go with this rig (Oct 2026 films):
 *   - route lines: film-owned layers with CONSTANT paint; reveal by slicing source geometry, never by animating paint;
 *     no dash arrays on solid lines; source tolerance 0 for growing lines; subpixel/translate3d for DOM overlays.
 *   - hide or retake anything that animates by itself (pulse rings, blinking carets, cross-dissolving layers).
 *   - line up live-feed refreshes OUTSIDE the shot (advance the clock without filming until the next poll is due).
 *   - run one live-page capture at a time: GPU contention caused timeouts and remounts (22 to 86 render seconds per
 *     film second under load). Check each layer still has data at capture time; save a per-shot data-check JSON.
 *   - then run frame_qa.py on the encoded clip (alternation, flashes, glitches).
 *
 * Needs Node 18+ and playwright-core (or playwright) with Chrome installed: npm i playwright-core
 */
import { mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const HELP = `usage:
  node film_rig.mjs page <scene.mjs> [--from 0] [--to N] [--out DIR]
  node film_rig.mjs card <file.html|url>[?query] <seconds> <outdir> [--fps 30] [--size 1280x720] [--dpr 2] [--alpha] [--t0 0]
(see the header of this file for the scene module format and the capture rules)`;
if (!argv.length || argv.includes("--help") || argv.includes("-h")) { console.log(HELP); process.exit(0); }
const flag = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };

async function chromium() {
  for (const m of ["playwright-core", "playwright"]) {
    try { return (await import(m)).chromium; } catch {}
  }
  console.error("needs playwright-core or playwright: npm i playwright-core"); process.exit(2);
}

const CLOCK = `(() => {
  let vt = 0, stepping = false;
  const realNow = performance.now.bind(performance);
  const t0 = realNow(), dateBase = Date.now();
  performance.now = () => stepping ? vt : (vt = realNow() - t0);
  Date.now = () => dateBase + performance.now();
  let q = [], id = 0;
  window.requestAnimationFrame = (cb) => { q.push([++id, cb]); return id; };
  window.cancelAnimationFrame = (i) => { q = q.filter((c) => c[0] !== i); };
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
  rSI(() => { if (!stepping) { runTimers(); flush(); } }, 8);
  window.__film = {
    step() { stepping = true; },
    advance(ms) { vt += ms; runTimers(); flush(); return q.length; },
    now() { return performance.now(); },
    timers() { return timers.size; },
  };
})();`;

async function pageMode() {
  const scene = (await import(pathToFileURL(resolve(argv[1])).href)).default;
  const FPS = scene.fps ?? 30, FRAMES = Math.round(scene.total * FPS);
  const from = Number(flag("from", 0)), to = Number(flag("to", FRAMES));
  const outDir = resolve(flag("out", join("captures", scene.name, "frames")));
  mkdirSync(outDir, { recursive: true });
  const ready = scene.ready ?? "true";
  const chrome = await chromium();
  let browser;
  const run = async () => {
    browser = await chrome.launch({ channel: "chrome", headless: true,
      args: ["--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars", "--mute-audio", ...(scene.chromeArgs ?? [])] });
    const ctx = await browser.newContext({ viewport: { width: scene.width, height: scene.height },
      deviceScaleFactor: scene.dpr ?? 1, colorScheme: scene.colorScheme ?? "light", reducedMotion: "no-preference" });
    if (scene.virtualTimers) await ctx.addInitScript("window.__filmVirtualTimers = true;");
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
    const stats = { loaded: 0, capped: 0 };
    let cap = scene.prewarmSettle ?? scene.maxSettle ?? 160;
    const settle = async () => {
      let ok = false;
      for (let k = 0; k < cap; k++) {
        const done = await page.evaluate((expr) => { window.__film?.advance(0); try { return !!(0, eval)(expr); } catch { return false; } }, ready);
        if (done && k >= 2) { ok = true; break; }
        await page.waitForTimeout(25);
      }
      stats[ok ? "loaded" : "capped"]++;
      await page.evaluate(() => window.__film?.advance(0));
    };
    await page.evaluate(() => window.__film?.step());
    if (scene.prewarm !== false && scene.frame) {
      for (let t = 0; t <= scene.total; t += scene.prewarmStep ?? 0.5) {
        await scene.frame(page, Math.min(t, scene.total), -1, state);
        await settle();
      }
      console.log(`[${scene.name}] prewarm settles ${JSON.stringify(stats)}`);
    }
    stats.loaded = 0; stats.capped = 0; cap = scene.maxSettle ?? 160;
    const t0 = Date.now();
    for (let i = from; i < to; i++) {
      const f = join(outDir, `f${String(i).padStart(5, "0")}.png`);
      if (existsSync(f)) continue;
      if (page.isClosed()) throw new Error("page closed");
      await scene.frame?.(page, i / FPS, i, state);
      await page.evaluate((ms) => window.__film?.advance(ms), 1000 / FPS);
      await settle();
      await page.screenshot({ path: f });
      if (i % 30 === 0) console.log(`[${scene.name}] ${i}/${FRAMES} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    console.log(`[${scene.name}] capture settles ${JSON.stringify(stats)} (capped = frames shot before every tile loaded)`);
    await browser.close();
  };
  for (let attempt = 1; attempt <= 6; attempt++) {
    try { await run(); return; }
    catch (e) { try { await browser?.close(); } catch {} console.error(`[${scene.name}] attempt ${attempt} failed: ${String(e.message).split("\n")[0]}`); if (attempt === 6) process.exit(1); }
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
  const browser = await chrome.launch({ channel: "chrome", headless: true, args: ["--allow-file-access-from-files", "--disable-gpu"] });
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

if (argv[0] === "page") await pageMode();
else if (argv[0] === "card") await cardMode();
else { console.log(HELP); process.exit(2); }
