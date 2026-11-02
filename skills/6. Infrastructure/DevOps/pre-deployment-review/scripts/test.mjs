#!/usr/bin/env node
// test.mjs — self-authored test harness for pre-deployment-review.
// Declared per AGENTS.md §2: these tests and the code they test were written by the same
// agent; a pass is intent encoded, not capability verified. The external gate is a run
// against a real project the agent did not author.
//
// Checks: rule schema validity · detector facets on fixtures · runner exit codes.
// Exit: 0 all assertions hold · 1 otherwise.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skill = path.join(here, '..');
const fixtures = path.join(skill, 'tests', 'fixtures');
let failures = 0; let checks = 0;
// Fixtures are regenerated every run: some fixture files (lockfiles, .env) are ignored by
// host repositories' .gitignore and would be missing from a clone.
{ const g = spawnSync(process.execPath, [path.join(skill, 'tests', 'make-fixtures.mjs')], { encoding: 'utf8' }); if (g.status !== 0) { console.log('FAIL fixture generation', g.stderr); process.exit(1); } }
const assert = (cond, msg) => { checks++; if (!cond) { failures++; console.log('  FAIL', msg); } else console.log('  ok  ', msg); };

// 1. rule schema
console.log('rules schema');
const SEV = new Set(['block', 'warn', 'info']); const TYPES = new Set(['file_exists', 'file_absent', 'grep', 'json_path', 'git_untracked', 'facet', 'command', 'review']);
const ids = new Set(); let ruleCount = 0;
for (const f of fs.readdirSync(path.join(skill, 'rules'))) if (f.endsWith('.json')) {
  const arr = JSON.parse(fs.readFileSync(path.join(skill, 'rules', f), 'utf8'));
  for (const r of arr) {
    ruleCount++;
    assert(!ids.has(r.id), `${r.id}: unique id`); ids.add(r.id);
    assert(SEV.has(r.severity), `${r.id}: severity valid`);
    assert(TYPES.has(r.check?.type), `${r.id}: check type valid`);
    assert(typeof r.remediation === 'string' && r.remediation.length > 10, `${r.id}: remediation present`);
    assert(Array.isArray(r.sources) && r.sources.length > 0, `${r.id}: sources present`);
    if (r.severity === 'block') {
      const strong = r.sources.some(s => ['standards', 'vendor'].includes(s.tier) && s.status === 200) || r.sources.some(s => /durable principle/i.test(s.title));
      assert(strong, `${r.id}: block severity rests on standards/vendor source fetched 200 or a durable principle`);
    }
    if (r.check.type === 'command') assert(r.check.mutating === false, `${r.id}: command declared non-mutating`);
    if (r.check.type === 'grep') { try { new RegExp(r.check.pattern, r.check.flags || ''); assert(true, `${r.id}: regex compiles`); } catch { assert(false, `${r.id}: regex compiles`); } }
  }
}
console.log(`  ${ruleCount} rules`);

// 2. detector on fixtures
const run = (script, args, extra = {}) => spawnSync(process.execPath, [path.join(here, script), ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...extra });
for (const fx of fs.readdirSync(fixtures)) {
  const dir = path.join(fixtures, fx); const expFile = path.join(dir, 'expected.json');
  if (!fs.existsSync(expFile)) continue;
  const exp = JSON.parse(fs.readFileSync(expFile, 'utf8'));
  console.log(`fixture ${fx}`);
  const d = run('detect-stack.mjs', [dir, '--quiet']);
  assert(d.status === 0, `detector exit 0 (got ${d.status})`);
  let profile = {}; try { profile = JSON.parse(d.stdout); } catch { assert(false, 'detector output parses'); continue; }
  for (const [facet, values] of Object.entries(exp.facets || {})) for (const v of values) assert((profile.facets[facet] || []).some(e => e.value === v), `facet ${facet}=${v}`);
  for (const [facet, values] of Object.entries(exp.facets_absent || {})) for (const v of values) assert(!(profile.facets[facet] || []).some(e => e.value === v), `facet ${facet}!=${v}`);
  const args = [dir, '--json', path.join(dir, '.review-result.json')]; if (exp.skip_commands) args.push('--skip-commands');
  const r = run('review.mjs', args);
  assert(r.status === exp.exit_code, `review exit ${exp.exit_code} (got ${r.status})`);
  let res = { results: [] }; try { res = JSON.parse(fs.readFileSync(path.join(dir, '.review-result.json'), 'utf8')); } catch { assert(false, 'review json written'); }
  const status = Object.fromEntries(res.results.map(x => [x.id, x.status]));
  for (const id of exp.must_fail || []) assert(status[id] === 'fail', `${id} fails (got ${status[id]})`);
  for (const id of exp.must_pass || []) assert(status[id] === 'pass', `${id} passes (got ${status[id]})`);
  for (const id of exp.must_not_apply || []) assert(status[id] === 'not_applicable', `${id} not applicable (got ${status[id]})`);
  try { fs.unlinkSync(path.join(dir, '.review-result.json')); } catch {}
}
console.log(`\n${checks} assertions, ${failures} failures (self-authored tests over self-authored code)`);
process.exit(failures ? 1 : 0);
