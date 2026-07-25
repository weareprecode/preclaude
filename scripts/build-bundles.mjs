#!/usr/bin/env node
/**
 * Materialise the à-la-carte plugin bundles from the canonical files.
 *
 * The repo root is the single source of truth. Bundles under bundles/ are
 * generated copies so that `/plugin install preclaude-design@preclaude` works
 * on every platform — symlinks would be neater but do not survive a Windows
 * checkout.
 *
 * Usage:
 *   node scripts/build-bundles.mjs          # write the bundles
 *   node scripts/build-bundles.mjs --check  # fail if they are out of date (CI)
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/** The bundle definitions. Adding a command means adding it to a bundle here. */
export const BUNDLES = [
  {
    name: 'preclaude-design',
    description:
      'Design without the AI look — build a taste library, explore variants side by side, and tune the result live.',
    commands: ['taste', 'variants', 'tweakbar', 'polish'],
    skills: ['design-taste', 'dev-browser'],
    agents: ['ui-designer', 'ux-researcher', 'frontend-developer'],
  },
  {
    name: 'preclaude-build',
    description:
      'Idea to running product — PRDs, project scaffolding, and the Ralph autonomous build loop.',
    commands: ['kickoff', 'prd', 'prd-json', 'full-build', 'build', 'implement', 'research'],
    skills: ['prd', 'prd-to-json', 'ralph', 'project-kickoff', 'better-auth', 'fable-build'],
    agents: [
      'backend-developer',
      'frontend-developer',
      'database-architect',
      'product-analyst',
      'test-engineer',
    ],
  },
  {
    name: 'preclaude-ship',
    description:
      'Everyday engineering — review, tests, refactors, dependencies, deploys, and setup diagnostics.',
    commands: [
      'commit',
      'pr',
      'review',
      'test',
      'debug',
      'status',
      'refactor',
      'migrate',
      'deps',
      'deploy-check',
      'doctor',
    ],
    skills: [],
    agents: ['code-reviewer', 'test-engineer', 'security-auditor', 'devops-engineer', 'performance-engineer'],
  },
  {
    name: 'preclaude-growth',
    description:
      'Direct-response frameworks as commands — offers, value ladders, money models, ads, nurture and email.',
    commands: [
      'offer',
      'valueladder',
      'moneymodel',
      'dream100',
      'adfactory',
      'nurture',
      'webinar',
      'emailseq',
      'copy',
      'marketing',
    ],
    skills: ['marketing-content'],
    agents: ['copywriter', 'data-analyst'],
  },
];

const cp = (from, to) => {
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, readFileSync(from));
};

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((e) => {
        const p = join(dir, e);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];

const version = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf8')).version;
const stale = [];

for (const bundle of BUNDLES) {
  const dir = join(ROOT, 'bundles', bundle.name);
  const wanted = new Map();

  for (const name of bundle.commands) wanted.set(`commands/${name}.md`, `commands/${name}.md`);
  for (const name of bundle.agents) wanted.set(`agents/${name}.md`, `agents/${name}.md`);
  for (const name of bundle.skills) wanted.set(`skills/${name}/SKILL.md`, `skills/${name}/SKILL.md`);

  const manifest =
    JSON.stringify(
      {
        name: bundle.name,
        version,
        description: bundle.description,
        author: { name: 'Precode', url: 'https://precode.co' },
        homepage: 'https://preclaude.com',
        repository: 'https://github.com/weareprecode/preclaude',
        license: 'MIT',
      },
      null,
      2,
    ) + '\n';

  for (const [src] of wanted) {
    if (!existsSync(join(ROOT, src))) {
      console.error(`  ✗ ${bundle.name}: missing source ${src}`);
      process.exit(1);
    }
  }

  if (CHECK) {
    const onDisk = walk(dir).map((p) => p.slice(dir.length + 1).split('\\').join('/'));
    const expected = [...wanted.keys(), '.claude-plugin/plugin.json'].sort();
    if (JSON.stringify(onDisk.sort()) !== JSON.stringify(expected)) {
      stale.push(`${bundle.name}: file list differs from source`);
      continue;
    }
    for (const [src, dest] of wanted) {
      if (readFileSync(join(ROOT, src), 'utf8') !== readFileSync(join(dir, dest), 'utf8'))
        stale.push(`${bundle.name}: ${dest} is out of date`);
    }
    if (readFileSync(join(dir, '.claude-plugin/plugin.json'), 'utf8') !== manifest)
      stale.push(`${bundle.name}: plugin.json is out of date`);
  } else {
    rmSync(dir, { recursive: true, force: true });
    for (const [src, dest] of wanted) cp(join(ROOT, src), join(dir, dest));
    mkdirSync(join(dir, '.claude-plugin'), { recursive: true });
    writeFileSync(join(dir, '.claude-plugin/plugin.json'), manifest);
    console.log(`  ✓ ${bundle.name} — ${wanted.size} files`);
  }
}

if (CHECK) {
  if (stale.length) {
    console.error('\n  Bundles are out of date. Run: node scripts/build-bundles.mjs\n');
    for (const s of stale) console.error(`  ✗ ${s}`);
    console.error('');
    process.exit(1);
  }
  console.log('  ✓ bundles are in sync\n');
}
