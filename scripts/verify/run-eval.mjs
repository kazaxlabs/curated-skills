#!/usr/bin/env node
// run-eval.mjs — static gate + `claude plugin eval` for one skill, then a Verification record (plan 5.2, D6b).
//
// Usage: node scripts/verify/run-eval.mjs <skill-name> [--max-cost-usd 3] [--runs N]
//          [--model claude-sonnet-5-5] [--judge-model claude-haiku-5-5] [--threshold 1]
//
// - The report is never published (--no-publish); results stay under .verify/.
// - Models are pinned so the incumbent and a challenger are measured under identical conditions (AGENTS.md §2).
// - Each case runs WITH the skill and WITHOUT it; delta = with - without.
// - `tool_used: Skill` graders are trigger indicators: reported, not scored, in two-arm runs.
// - Writes verifications/<skill>.json: no prompts, no outputs, no client names (D10/U5) — only gate verdicts.
// Exit codes: 0 pass, 1 static gate or eval below threshold, 2 eval partial (cost ceiling or credential rejected).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const CLAUDE = process.platform === 'win32' ? 'claude.exe' : 'claude';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const valueFlags = ['--max-cost-usd', '--runs', '--model', '--judge-model', '--threshold'];
const name = args.find((a, i) => !a.startsWith('--') && !valueFlags.includes(args[i - 1]));
if (!name) { console.error('usage: run-eval.mjs <skill-name> [options]'); process.exit(2); }
const repoRoot = resolve(import.meta.dirname, '..', '..');
const model = opt('--model', 'claude-sonnet-5-5');
const judge = opt('--judge-model', 'claude-haiku-5-5');
const cost = opt('--max-cost-usd', '3');
const threshold = opt('--threshold', '1');
const runs = opt('--runs');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = join(repoRoot, '.verify', 'runs', `${name}-${stamp}`);
mkdirSync(runDir, { recursive: true });

// 1. Static gate (also builds the wrapper with the skill's evals/)
const staticJson = join(runDir, 'static.json');
const w = spawnSync(process.execPath, [join(import.meta.dirname, 'wrap.mjs'), name, '--json', staticJson], { encoding: 'utf8' });
process.stdout.write(w.stdout);
if (w.status !== 0) { console.error(w.stderr); }
const staticResult = existsSync(staticJson) ? JSON.parse(readFileSync(staticJson, 'utf8')) : { static: 'fail' };
const wrapper = join(repoRoot, '.verify', name);
if (!existsSync(join(wrapper, 'evals'))) { console.error(`no evals/ folder for ${name}; static gate only`); process.exit(staticResult.static === 'pass' ? 0 : 1); }

// 2. Eval, both arms, pinned models, local report only
const resultJson = join(runDir, 'eval.json');
const evalArgs = ['plugin', 'eval', wrapper, '--trust-plugin', '--no-publish', '--json', resultJson,
  '--model', model, '--judge-model', judge, '--max-cost-usd', cost, '--threshold', threshold,
  '--output-dir', join(runDir, 'results'), '--report', join(runDir, 'report.html')];
if (runs) evalArgs.push('--runs', runs);
const cli = spawnSync(CLAUDE, ['--version'], { encoding: 'utf8' }).stdout.trim();
console.log(`eval: ${CLAUDE} ${evalArgs.join(' ')}`);
const e = spawnSync(CLAUDE, evalArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
writeFileSync(join(runDir, 'eval.log'), `${e.stdout}\n${e.stderr}`);
console.log((e.stdout || '').split('\n').slice(-25).join('\n'));
if (e.stderr) console.error(e.stderr.split('\n').slice(-10).join('\n'));

// 3. Verification record (public-safe fields only)
let summary = null;
if (existsSync(resultJson)) {
  const r = JSON.parse(readFileSync(resultJson, 'utf8'));
  summary = {
    partial: Boolean(r.partial), reason: r.reason ?? null,
    overallScore: r.aggregates?.overallScore ?? null, meanDelta: r.aggregates?.meanDelta ?? null,
    casesPassed: r.aggregates?.casesPassed ?? null, casesTotal: r.aggregates?.casesTotal ?? null,
    cases: (r.cases ?? []).map((c) => ({ name: c.name, score: c.aggregates?.score ?? null, delta: c.aggregates?.delta ?? null })),
  };
}
const record = {
  skill: name, kind: 'eval', checkedAt: new Date().toISOString(), cli,
  models: { agent: model, judge }, threshold: Number(threshold), maxCostUsd: Number(cost),
  static: staticResult.static, staticGates: Object.fromEntries(Object.entries(staticResult.gates ?? {}).map(([k, g]) => [k, g.ok])),
  evalExit: e.status, eval: summary,
  verdict: staticResult.static === 'pass' && e.status === 0 ? 'pass' : e.status === 2 ? 'incomplete' : 'fail',
};
mkdirSync(join(repoRoot, 'verifications'), { recursive: true });
writeFileSync(join(repoRoot, 'verifications', `${name}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(`verdict: ${record.verdict} (eval exit ${e.status}) -> verifications/${name}.json; run files: ${runDir}`);
process.exit(record.verdict === 'pass' ? 0 : e.status === 2 ? 2 : 1);
