#!/usr/bin/env node
/**
 * Render landing/og-image.html to landing/public/opengraph-image.png.
 *
 * The Open Graph image bakes the command/agent/skill counts into pixels, so it
 * used to go stale every time a command was added. This regenerates it, taking
 * the counts straight from the filesystem so they cannot drift.
 *
 * Usage:
 *   node scripts/build-og-image.mjs           # write the image
 *   node scripts/build-og-image.mjs --check   # verify the counts in the template
 *
 * Needs Playwright's chromium (already present if you have used the dev-browser
 * skill or the Playwright MCP). Install with: npx playwright install chromium
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = join(ROOT, 'landing/og-image.html');
const OUTPUT = join(ROOT, 'landing/public/opengraph-image.png');
const CHECK = process.argv.includes('--check');

const count = (dir, isDir) =>
  readdirSync(join(ROOT, dir)).filter((e) =>
    isDir ? statSync(join(ROOT, dir, e)).isDirectory() : e.endsWith('.md'),
  ).length;

const counts = {
  commands: count('commands', false),
  agents: count('agents', false),
  skills: count('skills', true),
};

// Keep the template honest about the real numbers before rendering it.
let html = readFileSync(TEMPLATE, 'utf8');
const updated = html
  .replace(/<b>\d+<\/b> slash commands/, `<b>${counts.commands}</b> slash commands`)
  .replace(/<b>\d+<\/b> specialist agents/, `<b>${counts.agents}</b> specialist agents`)
  .replace(/<b>\d+<\/b> auto-loading skills/, `<b>${counts.skills}</b> auto-loading skills`);

if (updated !== html) {
  if (CHECK) {
    console.error(
      `\n  ✗ landing/og-image.html is out of date — expected ${counts.commands}/${counts.agents}/${counts.skills}.` +
        `\n    Run: node scripts/build-og-image.mjs\n`,
    );
    process.exit(1);
  }
  writeFileSync(TEMPLATE, updated);
  html = updated;
  console.log(`  · template updated to ${counts.commands}/${counts.agents}/${counts.skills}`);
}

if (CHECK) {
  console.log('  ✓ og-image.html counts are current\n');
  process.exit(0);
}

for (const asset of ['landing/public/og/logo.png', 'landing/public/og/panel.png']) {
  if (!existsSync(join(ROOT, asset))) {
    console.error(`  ✗ missing ${asset} — it is cropped from the original image and must be committed`);
    process.exit(1);
  }
}

const { chromium } = await import('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

await page.goto(pathToFileURL(TEMPLATE).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUTPUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

console.log(`  ✓ ${OUTPUT.slice(ROOT.length + 1)} — ${counts.commands} commands · ${counts.agents} agents · ${counts.skills} skills\n`);
