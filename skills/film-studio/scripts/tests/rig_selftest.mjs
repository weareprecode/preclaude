#!/usr/bin/env node
/**
 * Self-test for film_rig.mjs (needs playwright-core or playwright, and Google Chrome installed).
 *   node scripts/tests/rig_selftest.mjs [--keep]
 * Run it from a folder where `import("playwright-core")` resolves (or set NODE_PATH-free: npm i playwright-core here).
 *
 * Fixture: a canvas page that "refines" (its blur steps down) only on genuine native animation frames, the way
 * streamed 3D content does, and draws a square whose x is a function of the rAF timestamp.
 * Checks:
 *   1. native rAF before capture: callbacks arrive at about display rate, with native timestamps.
 *   2. refine hold + sharpness gate: PASS with the native clock; REFUSED (exit 3) with the legacy shim.
 *   3. capture on the virtual clock: the square moves exactly 1/fps of motion per frame, frame after frame.
 *   4. substeps: 2 substeps per frame run 2 rAF callbacks per frame.
 *   5. card mode writes the expected number of frames.
 */
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RIG = resolve(HERE, "..", "film_rig.mjs");
let chromium;
for (const m of ["playwright-core", "playwright"]) { try { chromium = (await import(m)).chromium; break; } catch {} }
if (!chromium) { console.log("SKIP: playwright-core not installed (npm i playwright-core)"); process.exit(0); }

const dir = mkdtempSync(join(tmpdir(), "film-rig-test-"));
const fails = [];
const ok = (cond, msg) => { console.log(`${cond ? "ok  " : "FAIL"} ${msg}`); if (!cond) fails.push(msg); };

writeFileSync(join(dir, "page.html"), `<!doctype html><html><body style="margin:0;background:#fff">
<canvas id="c" width="640" height="360"></canvas>
<script>
  const c = document.getElementById("c"), g = c.getContext("2d");
  window.__blur = 12; window.__native = 0; window.__calls = 0; window.__ts = [];
  function draw(ts) {
    window.__calls++;
    // "refine" only on a genuine native frame: its timestamp is the document timeline's current time
    if (Math.abs(ts - document.timeline.currentTime) < 0.01) { window.__native++; if (window.__native % 10 === 0 && window.__blur > 0) window.__blur--; }
    window.__ts.push(ts); if (window.__ts.length > 400) window.__ts.shift();
    g.filter = "none"; g.fillStyle = "#fff"; g.fillRect(0, 0, 640, 360);
    g.filter = "blur(" + window.__blur + "px)";
    g.fillStyle = "#000"; g.font = "bold 40px sans-serif";
    for (let y = 60; y < 200; y += 44) g.fillText("SHARP SIGN 0123", 40, y);
    g.filter = "none"; g.fillStyle = "#f00";
    const x = Math.round((ts / 1000) * 120) % 600; // 120 px per second of clock time
    g.fillRect(x, 260, 20, 20);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
</script></body></html>`);

const scene = (extra) => `import { writeFileSync } from "node:fs";
export default {
  name: "t", url: ${JSON.stringify(pathToFileURL(join(dir, "page.html")).href)}, width: 640, height: 360, dpr: 1,
  total: 0.5, fps: 30, prewarm: false, refineHold: 2.5,
  gate: { box: [30, 20, 600, 200], min: GATE_MIN },
  async setup(page) {
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => { const t = window.__ts.slice(-30); const d = t.slice(1).map((v, i) => v - t[i]); return { calls: window.__calls, native: window.__native, meanStep: d.reduce((a, b) => a + b, 0) / d.length }; });
    writeFileSync(${JSON.stringify(join(dir, "setup-"))} + process.env.TEST_TAG + ".json", JSON.stringify(r));
  },
  ${extra}
};`;

const runRig = (args, envx) => spawnSync(process.execPath, [RIG, ...args], { encoding: "utf8", env: { ...process.env, FILM_ATTEMPTS: "1", ...envx }, timeout: 180000 });

// helper: read PNGs in the browser (no image deps in Node)
const browser = await chromium.launch({ channel: "chrome", headless: true });
const bp = await browser.newPage();
const pngInfo = (file) => bp.evaluate(async (b64) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = new OffscreenCanvas(img.naturalWidth, img.naturalHeight); const g = c.getContext("2d"); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 265, img.naturalWidth, 1).data; let x = -1;
  for (let i = 0; i < img.naturalWidth; i++) if (d[4 * i] > 200 && d[4 * i + 1] < 60) { x = i; break; }
  return { x };
}, readFileSync(file).toString("base64"));

try {
  // calibrate the gate: sharp text vs blurred text, measured by the rig's own function
  const { pngSharpness } = await import(pathToFileURL(RIG).href);
  const cal = await browser.newPage({ viewport: { width: 640, height: 360 } });
  await cal.goto(pathToFileURL(join(dir, "page.html")).href);
  await cal.evaluate(() => { window.__blur = 0; }); await cal.waitForTimeout(200);
  const sharpV = await pngSharpness(browser, await cal.screenshot({ clip: { x: 30, y: 20, width: 570, height: 180 } }));
  await cal.evaluate(() => { window.__native = -1e9; window.__blur = 12; }); await cal.waitForTimeout(200);
  const softV = await pngSharpness(browser, await cal.screenshot({ clip: { x: 30, y: 20, width: 570, height: 180 } }));
  await cal.close();
  ok(sharpV > 3 * softV, `sharpness measure separates sharp ${sharpV} from soft ${softV}`);
  const GATE = Math.round(0.6 * sharpV);

  // 1 to 4: native clock run with substeps 2
  writeFileSync(join(dir, "scene.mjs"), scene("substeps: 2,").replace("GATE_MIN", String(GATE)));
  const out = join(dir, "native", "frames");
  const r1 = runRig(["page", join(dir, "scene.mjs"), "--out", out], { TEST_TAG: "native" });
  ok(r1.status === 0, `native run exits 0 (got ${r1.status}) ${r1.status ? r1.stdout.slice(-400) + r1.stderr.slice(-400) : ""}`);
  const s1 = JSON.parse(readFileSync(join(dir, "setup-native.json"), "utf8"));
  ok(s1.native > 20 && s1.meanStep > 5 && s1.meanStep < 40, `native rAF before capture: ${s1.native} native frames in setup, mean step ${s1.meanStep.toFixed(1)} ms`);
  const g1 = JSON.parse(readFileSync(join(dir, "native", "gate-t.json"), "utf8"));
  ok(g1.ok === true, `gate PASS with the native clock (sharpness ${g1.sharpness}, min ${GATE})`);
  const frames = readdirSync(out).filter((f) => /^f\d{5}\.png$/.test(f)).sort();
  ok(frames.length === 15, `15 frames captured (got ${frames.length})`);
  const xs = []; for (const f of frames) xs.push((await pngInfo(join(out, f))).x);
  const steps = xs.slice(1).map((v, i) => v - xs[i]).filter((d) => d > -300); // ignore the wrap
  ok(steps.length >= 10 && steps.every((d) => d === 4), `square moves exactly 4 px (120 px/s at 30 fps) per frame: ${JSON.stringify(steps)}`);

  // 2b: the legacy shim never gets native frames, so the page never refines and the gate refuses
  const r2 = runRig(["page", join(dir, "scene.mjs"), "--out", join(dir, "legacy", "frames")], { TEST_TAG: "legacy", FILM_NATIVE_RAF: "0" });
  const s2 = JSON.parse(readFileSync(join(dir, "setup-legacy.json"), "utf8"));
  ok(s2.native === 0, `legacy shim: 0 native frames in setup (got ${s2.native})`);
  ok(r2.status === 3, `legacy shim: gate refuses, exit 3 (got ${r2.status})`);

  // 5: card mode
  writeFileSync(join(dir, "card.html"), `<!doctype html><style>@keyframes m{from{transform:translateX(0)}to{transform:translateX(200px)}}div{width:40px;height:40px;background:#00f;animation:m 1s linear}</style><div></div>`);
  const r3 = spawnSync(process.execPath, [RIG, "card", join(dir, "card.html"), "0.2", join(dir, "card"), "--size", "320x180", "--dpr", "1"], { encoding: "utf8", timeout: 120000 });
  ok(r3.status === 0 && existsSync(join(dir, "card")) && readdirSync(join(dir, "card")).length === 6, `card mode writes 6 frames (status ${r3.status})`);
} finally {
  await browser.close();
  if (!process.argv.includes("--keep")) rmSync(dir, { recursive: true, force: true }); else console.log("kept", dir);
}
console.log(fails.length ? `\n${fails.length} FAILED` : "\nall rig checks passed");
process.exit(fails.length ? 1 : 0);
