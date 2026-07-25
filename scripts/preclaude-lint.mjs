#!/usr/bin/env node
/**
 * Preclaude repo linter.
 *
 * Catches the things that silently drift when a command, agent or skill is
 * added: broken frontmatter, missing docs entries, and — the usual culprit —
 * counts that were updated in four of the seven places that carry them.
 *
 * Usage: node scripts/preclaude-lint.mjs [--quiet]
 * Exits 1 on errors, 0 on warnings only.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUIET = process.argv.includes('--quiet');

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const exists = (p) => existsSync(join(ROOT, p));
const mdFiles = (dir) =>
  existsSync(join(ROOT, dir))
    ? readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.md')).sort()
    : [];

/** Minimal frontmatter parser — flat `key: value` pairs only, which is all we use. */
function frontmatter(text) {
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const body = text.slice(end + 4);
  const fields = {};
  let key = null;
  for (const line of text.slice(4, end).split('\n')) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (m) {
      key = m[1];
      fields[key] = m[2].trim();
    } else if (key && /^\s+\S/.test(line)) {
      fields[key] += ' ' + line.trim();
    }
  }
  return { fields, body };
}

// ---------------------------------------------------------------- inventory

const commands = mdFiles('commands').map((f) => basename(f, '.md'));
const agents = mdFiles('agents').map((f) => basename(f, '.md'));
const skills = existsSync(join(ROOT, 'skills'))
  ? readdirSync(join(ROOT, 'skills'))
      .filter((d) => statSync(join(ROOT, 'skills', d)).isDirectory())
      .sort()
  : [];

const ACTUAL = { commands: commands.length, agents: agents.length, skills: skills.length };

// ------------------------------------------------------------- frontmatter

for (const name of commands) {
  const path = `commands/${name}.md`;
  const fm = frontmatter(read(path));
  if (!fm) {
    err(path, 'missing or malformed YAML frontmatter');
    continue;
  }
  const { description, 'allowed-tools': tools } = fm.fields;
  if (!description) err(path, 'no `description` — the command will be hard to discover');
  else if (description.length > 200)
    warn(path, `description is ${description.length} chars; keep it under ~200`);
  if (!tools) warn(path, 'no `allowed-tools` — the command gets whatever is ambient');
  if (fm.body.length > 12000)
    warn(path, `${(fm.body.length / 1000).toFixed(1)}k chars — long enough to crowd out the task`);
}

for (const name of agents) {
  const path = `agents/${name}.md`;
  const fm = frontmatter(read(path));
  if (!fm) {
    err(path, 'missing or malformed YAML frontmatter');
    continue;
  }
  if (!fm.fields.name) err(path, 'no `name` field');
  else if (fm.fields.name !== name)
    err(path, `frontmatter name "${fm.fields.name}" does not match filename "${name}"`);
  if (!fm.fields.description) err(path, 'no `description` field');
}

for (const name of skills) {
  const path = `skills/${name}/SKILL.md`;
  if (!exists(path)) {
    err(`skills/${name}/`, 'no SKILL.md — the skill will not load');
    continue;
  }
  const fm = frontmatter(read(path));
  if (!fm) {
    err(path, 'missing or malformed YAML frontmatter');
    continue;
  }
  if (fm.fields.name !== name)
    err(path, `frontmatter name "${fm.fields.name ?? '(none)'}" does not match directory "${name}"`);
  const d = fm.fields.description;
  if (!d) err(path, 'no `description` — the model cannot tell when this applies');
  else if (!/\buse when\b|\bwhen\b/i.test(d))
    warn(path, 'description does not say *when* to use the skill');
  else if (d.length > 500) warn(path, `description is ${d.length} chars; keep it under ~500`);
}

// -------------------------------------------------------- duplicate descriptions

const seen = new Map();
for (const name of commands) {
  const fm = frontmatter(read(`commands/${name}.md`));
  const d = fm?.fields.description?.toLowerCase().slice(0, 60);
  if (!d) continue;
  if (seen.has(d)) warn(`commands/${name}.md`, `description collides with /${seen.get(d)}`);
  else seen.set(d, name);
}

// ------------------------------------------------------------- docs coverage

const readme = exists('README.md') ? read('README.md') : '';
const commandsDoc = exists('docs/COMMANDS.md') ? read('docs/COMMANDS.md') : '';
const claudeMd = exists('CLAUDE.md') ? read('CLAUDE.md') : '';

// Listings write commands as `/name`, `/name [args]` or `/name` in a table cell,
// so match the name followed by a boundary rather than an exact string.
const mentions = (text, name) => new RegExp('`/' + name + '[ `\\]]').test(text);

for (const name of commands) {
  if (readme && !mentions(readme, name)) err('README.md', `/${name} is not in the command table`);
  if (commandsDoc && !commandsDoc.includes(`/${name}`))
    err('docs/COMMANDS.md', `/${name} has no entry`);
  if (claudeMd && !mentions(claudeMd, name))
    err('CLAUDE.md', `/${name} is not in the commands list`);
}

for (const name of agents) {
  if (readme && !readme.includes(`@${name}`)) warn('README.md', `@${name} is not mentioned`);
}

// -------------------------------------------------------------- count drift
//
// Every place that hard-codes a count. marketing/*.md are historic launch
// posts and are deliberately left stale, so they are not checked.

const COUNT_FILES = [
  'README.md',
  'CLAUDE.md',
  'CLAUDE.example.md',
  'docs/COMMANDS.md',
  'docs/AGENTS.md',
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  'landing/app/layout.tsx',
  'landing/app/page.tsx',
  // GEO files — what LLMs read about Preclaude, so stale counts here are the
  // ones that propagate furthest.
  'landing/public/llms.txt',
  'landing/public/llms-full.txt',
];

const PATTERNS = [
  [/(\d+)\s+(?:slash\s+)?commands?\b/gi, 'commands'],
  [/Commands Available \((\d+)\)/g, 'commands'],
  [/(\d+)\s+Slash Commands/g, 'commands'],
  // "11 Agent Skills" is a skills count, not an agents one — exclude it here
  // and catch it in the skills patterns below.
  [/(\d+)\s+(?:specialist\s+)?agents?\b(?!\s+skills)/gi, 'agents'],
  [/Agents Available \((\d+)\)/g, 'agents'],
  [/(\d+)\s+(?:auto-loading\s+)?skills?\b/gi, 'skills'],
  [/(\d+)\s+Agent Skills/gi, 'skills'],
];

// Counts also get written out in words ("Eleven packages of expertise..."),
// which slipped past the numeric patterns until it went stale.
const WORDS = {
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};
const WORD_RE = new RegExp(`\\b(${Object.keys(WORDS).join('|')})\\b`, 'gi');
const SUBJECT_RE = /\b(commands?|agents?|skills?)\b/gi;
const WINDOW = 140; // chars either side — the subject often sits in a nearby field

for (const file of COUNT_FILES) {
  if (!exists(file)) continue;
  const text = read(file);

  for (const m of text.matchAll(WORD_RE)) {
    const found = WORDS[m[1].toLowerCase()];
    const context = text.slice(Math.max(0, m.index - WINDOW), m.index + WINDOW);

    // Only flag when the nearby subject is unambiguous — a window mentioning
    // both "commands" and "skills" can't tell us which number was meant.
    const kinds = new Set(
      [...context.matchAll(SUBJECT_RE)].map((s) => `${s[1].toLowerCase().replace(/s$/, '')}s`),
    );
    if (kinds.size !== 1) continue;

    const kind = [...kinds][0];
    if (ACTUAL[kind] !== undefined && found !== ACTUAL[kind]) {
      const line = text.slice(0, m.index).split('\n').length;
      err(`${file}:${line}`, `spells out "${m[1]}" near "${kind}", actual is ${ACTUAL[kind]}`);
    }
  }

  for (const [re, kind] of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const found = Number(m[1]);
      if (found !== ACTUAL[kind]) {
        const line = text.slice(0, m.index).split('\n').length;
        err(`${file}:${line}`, `says ${found} ${kind}, actual is ${ACTUAL[kind]} — "${m[0].trim()}"`);
      }
    }
  }
}

// The OG image bakes the counts into pixels. Check its source template here;
// regenerating the PNG itself needs a browser, so that stays a separate step.
if (exists('landing/og-image.html')) {
  const og = read('landing/og-image.html');
  for (const [re, kind] of [
    [/<b>(\d+)<\/b> slash commands/, 'commands'],
    [/<b>(\d+)<\/b> specialist agents/, 'agents'],
    [/<b>(\d+)<\/b> auto-loading skills/, 'skills'],
  ]) {
    const m = og.match(re);
    if (m && Number(m[1]) !== ACTUAL[kind])
      err(
        'landing/og-image.html',
        `says ${m[1]} ${kind}, actual is ${ACTUAL[kind]} — run: node scripts/build-og-image.mjs`,
      );
  }
}

// -------------------------------------------------------------------- report

const label = (n, s) => `${n} ${s}${n === 1 ? '' : 's'}`;

if (!QUIET) {
  console.log(`\n  Preclaude lint`);
  console.log(`  ${label(ACTUAL.commands, 'command')} · ${label(ACTUAL.agents, 'agent')} · ${label(ACTUAL.skills, 'skill')}\n`);
}

for (const { file, msg } of errors) console.log(`  ✗ ${file}\n    ${msg}`);
if (errors.length && warnings.length) console.log('');
for (const { file, msg } of warnings) console.log(`  ! ${file}\n    ${msg}`);

if (!errors.length && !warnings.length) console.log('  ✓ clean\n');
else console.log(`\n  ${errors.length} error(s), ${warnings.length} warning(s)\n`);

process.exit(errors.length ? 1 : 0);
