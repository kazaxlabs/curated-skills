#!/usr/bin/env node
// run-core.mjs — run run-eval.mjs for Core skills in sequence under an overall spend ceiling (plan 5.2).
//
// Usage: node scripts/verify/run-core.mjs [--only a,b,c] [--skip-passed] [--budget-usd 20]
//          [--per-skill-usd 3] [--concurrency 3]
// Before each skill it checks the running total; it stops when the next skill could push the total past
// --budget-usd (worst case: --per-skill-usd). Writes a summary table to .verify/batch-<stamp>.json.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const repoRoot = resolve(import.meta.dirname, '..', '..');
const core = JSON.parse(readFileSync(join(repoRoot, 'core.json'), 'utf8'));
const only = opt('--only')?.split(',').map((s) => s.trim()).filter(Boolean);
const budget = Number(opt('--budget-usd', '20'));
const perSkill = Number(opt('--per-skill-usd', '3'));
const concurrency = opt('--concurrency', '3');

let skills = core.skills.map((s) => s.name);
if (only) skills = skills.filter((s) => only.includes(s));
// --skip-passed skips every skill that has left `provisional` (`passed-review`, or `verified` after the owner's blind sample).
if (args.includes('--skip-passed')) skills = skills.filter((s) => core.skills.find((c) => c.name === s).status === 'provisional');

const latestRun = (skill) => {
  const dir = join(repoRoot, '.verify', 'runs');
  if (!existsSync(dir)) return null;
  const runs = readdirSync(dir).filter((d) => d.startsWith(`${skill}-2`)).map((d) => join(dir, d))
    .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs);
  return runs.at(-1) ?? null;
};

let spent = 0;
const rows = [];
for (const skill of skills) {
  if (spent + perSkill > budget) { rows.push({ skill, verdict: 'not-run (budget)' }); continue; }
  console.log(`\n=== ${skill} (spent so far $${spent.toFixed(2)} of $${budget}) ===`);
  const r = spawnSync(process.execPath, [join(import.meta.dirname, 'run-eval.mjs'), skill,
    '--max-cost-usd', String(perSkill), '--concurrency', concurrency], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const tail = (r.stdout || '').trim().split('\n').slice(-2).join(' | ');
  console.log(tail);
  const recPath = join(repoRoot, 'verifications', `${skill}.json`);
  const rec = existsSync(recPath) ? JSON.parse(readFileSync(recPath, 'utf8')) : null;
  const fresh = rec && Date.now() - Date.parse(rec.checkedAt) < 60 * 60 * 1000;
  const cost = fresh ? (rec.eval?.costUsd ?? 0) : 0;
  spent += cost;
  rows.push({
    skill, verdict: fresh ? rec.verdict : 'no-record', exit: r.status, costUsd: Number(cost.toFixed(3)),
    requirements: fresh ? rec.requirements : null,
    cases: fresh ? rec.eval?.cases?.map((c) => ({ name: c.name, with: c.scoreWith, without: c.scoreWithout, delta: c.delta, firedRuns: c.firedRuns })) : null,
    run: latestRun(skill),
  });
}
mkdirSync(join(repoRoot, '.verify'), { recursive: true });
const out = join(repoRoot, '.verify', `batch-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
writeFileSync(out, JSON.stringify({ budget, spent: Number(spent.toFixed(3)), rows }, null, 2) + '\n');
console.log(`\nspent $${spent.toFixed(2)} of $${budget}; summary: ${out}`);
for (const r of rows) console.log(`${String(r.verdict).padEnd(18)} ${r.skill}`);
