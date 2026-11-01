#!/usr/bin/env node
// run-eval.mjs — static gate + `claude plugin eval` for one skill, then a Verification record (plan 5.2, D6b).
//
// Usage: node scripts/verify/run-eval.mjs <skill-name> [--max-cost-usd 3] [--runs N] [--concurrency N]
//          [--model claude-sonnet-5-5] [--judge-model claude-haiku-5-5] [--threshold 1]
//        node scripts/verify/run-eval.mjs <skill-name> --rescore <run-dir>   # recompute the record, no new runs
//
// - The report is never published (--no-publish); run files stay under .verify/runs/.
// - Models are pinned so an incumbent and a challenger are measured under identical conditions (AGENTS.md §2).
// - Each case runs WITH the skill and WITHOUT it; delta = with - without. Runs are isolated by Claude Code:
//   no user skills, settings, CLAUDE.md or MCP servers load (code.claude.com/docs/en/plugin-evals).
// - Writes verifications/<skill>.json: gate verdicts and scores only; no prompts, outputs or client names (D10/U5).
//
// Requirement set v2 (plan D3/D6a):
//   R1 trigger  every grader named `fired` passed in every WITH run; for name-invoked skills, every `invocable`
//               grader of an `explicit` case ('/<skill> ...' prompt) passed in every WITH run;
//   R2 noFire   every grader named `not-fired` passed in every WITH run (the without arm has no skill to fire,
//               so a near-miss case contributes N = runs per arm, 3 by default, not 2N);
//   R3 value    every case tagged `value` has delta > 0 AND its WITH arm passed (all graders) in at least
//               2 of 3 runs (two-thirds of the runs, rounded up, if --runs is not 3);
//   R4 clean    no run ended on an error and the result is not partial.
// Rule change 2026-10-31 (v1 -> v2), written down before any further eval run: v1's R3 was delta > 0 alone, so a
//   skill passed with 1 of 3 WITH runs passing; v2 adds the 2-of-3 floor. v1's R2 also counted the without arm,
//   which reported 0/6 false fires where only 3 runs could have fired. Existing run dirs are rescored under v2 ($0).
// Verdict: passed-review = static gate + R1..R4 all true; trigger-only = R3 untested (no `value` case) and the rest
//          true; incomplete = R4 false; fail = anything else. The eval's --threshold is recorded for information only.
//          The top verdict is `passed-review`, never `verified`: R3 rests on an LLM judge, and a judge is a review
//          (AGENTS.md §3). Only the owner's blind sample is the gate that can promote a skill to `verified` in
//          core.json; this runner never writes that label (relabelled from `pass`, 2026-10-31).
// --rescore keeps the record's checkedAt (when the eval ran) if it rescores the same run, and adds rescoredAt.
// Exit codes: 0 passed-review, 3 trigger-only, 2 incomplete, 1 fail.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const CLAUDE = process.platform === 'win32' ? 'claude.exe' : 'claude';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const valueFlags = ['--max-cost-usd', '--runs', '--model', '--judge-model', '--threshold', '--concurrency', '--rescore'];
const name = args.find((a, i) => !a.startsWith('--') && !valueFlags.includes(args[i - 1]));
if (!name) { console.error('usage: run-eval.mjs <skill-name> [options]'); process.exit(1); }
const repoRoot = resolve(import.meta.dirname, '..', '..');
const wrapper = join(repoRoot, '.verify', name);
const rescore = opt('--rescore');

let runDir, meta;
if (rescore) {
  runDir = resolve(rescore);
  meta = JSON.parse(readFileSync(join(runDir, 'meta.json'), 'utf8'));
} else {
  meta = {
    model: opt('--model', 'claude-sonnet-5-5'), judge: opt('--judge-model', 'claude-haiku-5-5'),
    maxCostUsd: Number(opt('--max-cost-usd', '3')), threshold: Number(opt('--threshold', '1')),
    cli: spawnSync(CLAUDE, ['--version'], { encoding: 'utf8' }).stdout.trim(),
  };
  runDir = join(repoRoot, '.verify', 'runs', `${name}-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  mkdirSync(runDir, { recursive: true });

  // 1. Static gate (also builds the wrapper with the skill's evals/)
  const w = spawnSync(process.execPath, [join(import.meta.dirname, 'wrap.mjs'), name, '--json', join(runDir, 'static.json')], { encoding: 'utf8' });
  process.stdout.write(w.stdout);
  if (w.status !== 0) console.error(w.stderr);
  if (!existsSync(join(wrapper, 'evals'))) { console.error(`no evals/ folder for ${name}; static gate only`); process.exit(w.status === 0 ? 3 : 1); }

  // 2. Eval, both arms, pinned models, local report only
  const evalArgs = ['plugin', 'eval', wrapper, '--trust-plugin', '--no-publish', '--json', join(runDir, 'eval.json'),
    '--model', meta.model, '--judge-model', meta.judge, '--max-cost-usd', String(meta.maxCostUsd), '--threshold', String(meta.threshold),
    '--output-dir', join(runDir, 'results'), '--report', join(runDir, 'report.html')];
  if (opt('--runs')) evalArgs.push('--runs', opt('--runs'));
  if (opt('--concurrency')) evalArgs.push('--concurrency', opt('--concurrency'));
  console.log(`eval: ${CLAUDE} ${evalArgs.join(' ')}`);
  const e = spawnSync(CLAUDE, evalArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  writeFileSync(join(runDir, 'eval.log'), `${e.stdout}\n${e.stderr}`);
  if (e.stderr) console.error(e.stderr.split('\n').slice(-10).join('\n'));
  meta.evalExit = e.status;
  writeFileSync(join(runDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
}

// 3. Score against the requirement set
const staticResult = existsSync(join(runDir, 'static.json')) ? JSON.parse(readFileSync(join(runDir, 'static.json'), 'utf8')) : { static: 'fail' };
const resultJson = join(runDir, 'eval.json');
const tagsOf = (caseName) => {
  const p = join(wrapper, 'evals', caseName, 'prompt.md');
  if (!existsSync(p)) return [];
  const m = /^tags:\s*\[([^\]]*)\]/m.exec(readFileSync(p, 'utf8'));
  return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
};
const REQUIREMENT_SET = 'v2 2026-10-31';
const VALUE_FLOOR = { passed: 2, of: 3 };
const req = { trigger: null, noFire: null, value: null, clean: false };
let summary = null;
if (existsSync(resultJson)) {
  const r = JSON.parse(readFileSync(resultJson, 'utf8'));
  const cases = r.cases ?? [];
  const runsOf = (c, arm) => c.arms?.[arm] ?? [];
  const allRuns = (c) => [...runsOf(c, 'with'), ...runsOf(c, 'without')];
  const graderPass = (run, g) => (run.graders ?? []).filter((x) => x.name === g).every((x) => x.passed);
  const has = (c, g) => allRuns(c).some((run) => (run.graders ?? []).some((x) => x.name === g));
  const firedCases = cases.filter((c) => has(c, 'fired'));
  // Name-invoked skills (core.json invocation: "name"): the case types '/<skill> ...' and its `invocable` grader
  // confirms the command was available in the run; Claude Code expands it without a Skill tool call.
  const explicitCases = cases.filter((c) => tagsOf(c.name).includes('explicit') && has(c, 'invocable'));
  const noFireCases = cases.filter((c) => has(c, 'not-fired'));
  const valueCases = cases.filter((c) => tagsOf(c.name).includes('value'));
  const triggerChecks = [
    ...firedCases.map((c) => runsOf(c, 'with').every((run) => graderPass(run, 'fired'))),
    ...explicitCases.map((c) => runsOf(c, 'with').every((run) => graderPass(run, 'invocable'))),
  ];
  req.trigger = triggerChecks.length ? triggerChecks.every(Boolean) : null;
  req.noFire = noFireCases.length ? noFireCases.every((c) => runsOf(c, 'with').every((run) => graderPass(run, 'not-fired'))) : null;
  const withPassed = (c) => runsOf(c, 'with').filter((run) => run.passed).length;
  const meetsFloor = (c) => runsOf(c, 'with').length > 0 && withPassed(c) * VALUE_FLOOR.of >= VALUE_FLOOR.passed * runsOf(c, 'with').length;
  req.value = valueCases.length ? valueCases.every((c) => (c.aggregates?.delta ?? 0) > 0 && meetsFloor(c)) : null;
  req.clean = !r.partial && cases.length > 0 && cases.every((c) => allRuns(c).every((run) => !run.error));
  summary = {
    partial: Boolean(r.partial), costUsd: r.costUsd ?? null,
    overallScore: r.aggregates?.overallScore ?? null, meanDelta: r.aggregates?.meanDelta ?? null,
    cases: cases.map((c) => ({
      name: c.name, tags: tagsOf(c.name), runsPerArm: runsOf(c, 'with').length,
      scoreWith: c.aggregates?.score ?? null, scoreWithout: c.aggregates?.scoreWithout ?? null, delta: c.aggregates?.delta ?? null,
      ...(has(c, 'fired') ? { firedRuns: runsOf(c, 'with').filter((run) => graderPass(run, 'fired')).length } : {}),
      ...(has(c, 'invocable') ? { invocableRuns: runsOf(c, 'with').filter((run) => graderPass(run, 'invocable')).length } : {}),
      ...(has(c, 'not-fired') ? { falseFireRuns: runsOf(c, 'with').filter((run) => !graderPass(run, 'not-fired')).length } : {}),
      ...(tagsOf(c.name).includes('value') ? { withPassedRuns: withPassed(c) } : {}),
    })),
  };
}
const others = [req.trigger, req.noFire].filter((v) => v !== null);
const verdict = staticResult.static !== 'pass' ? 'fail'
  : !req.clean ? 'incomplete'
  : !others.length || !others.every(Boolean) || req.value === false ? 'fail'
  : req.value === null ? 'trigger-only' : 'passed-review';
const recordPath = join(repoRoot, 'verifications', `${name}.json`);
const previous = existsSync(recordPath) ? JSON.parse(readFileSync(recordPath, 'utf8')) : null;
const sameRun = rescore && previous && summary && previous.eval?.costUsd === summary.costUsd;
const record = {
  skill: name, kind: 'eval', checkedAt: sameRun ? previous.checkedAt : new Date().toISOString(),
  ...(rescore ? { rescoredAt: new Date().toISOString() } : {}), cli: meta.cli,
  requirementSet: REQUIREMENT_SET, models: { agent: meta.model, judge: meta.judge }, maxCostUsd: meta.maxCostUsd, evalThresholdInfo: meta.threshold,
  static: staticResult.static, staticGates: Object.fromEntries(Object.entries(staticResult.gates ?? {}).map(([k, g]) => [k, g.ok])),
  requirements: req, evalExit: meta.evalExit, eval: summary, verdict,
};
mkdirSync(join(repoRoot, 'verifications'), { recursive: true });
writeFileSync(join(repoRoot, 'verifications', `${name}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(`requirements: ${JSON.stringify(req)}`);
console.log(`verdict: ${verdict} -> verifications/${name}.json; run files: ${runDir}`);
process.exit({ 'passed-review': 0, 'trigger-only': 3, incomplete: 2 }[verdict] ?? 1);
