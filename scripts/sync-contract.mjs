#!/usr/bin/env node
// sync-contract.mjs — keep every derived copy of the agent contract in step with this repo's AGENTS.md.
// AGENTS.md is the one source. This script is the only writer of the files below; hand edits to them drift
// (CLAUDE.md: "A copy drifts").
//
// Targets (relative to --home, default os.homedir()):
//   .claude/CLAUDE.md            full copy: Claude Code loads it in every project
//   .gemini/config/GEMINI.md     full copy: Antigravity's global rules file. Antigravity-only instructions live in
//                                .gemini/config/rules/*.md (e.g. brain-tracker.md), never in this copy.
//   .claude/hooks/evidence.json  generated from the [EG-n] rules in AGENTS.md section 2: the text that
//                                ~/.claude/hooks/evidence_reinject.py injects ({short, full, rules}).
//
// Usage:
//   node scripts/sync-contract.mjs            # preview (default): say whether each target matches, change nothing
//   node scripts/sync-contract.mjs --apply    # back up any target that differs, then overwrite it
//   node scripts/sync-contract.mjs --check    # exit 1 if any target differs (drift gate)
//   --home <dir>                              # user home to act on (default: os.homedir()); for scratch tests
//
// Comparison ignores CRLF vs LF only; any other byte difference is drift.
// --apply writes <target>.bak-<UTC timestamp> before overwriting an existing target that differs.
// A target that is a symlink is refused (repo rule: no symlinks on Windows; real files only).
// Exit: 0 ok, 1 drift (--check), refused target or unparseable source, 2 bad arguments.

import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const known = new Set(['--apply', '--check', '--home']);
for (const [i, a] of args.entries()) {
  if (a.startsWith('--') && !known.has(a)) { console.error(`Unknown option: ${a}`); process.exit(2); }
  if (a === '--home' && !args[i + 1]) { console.error('--home needs a directory'); process.exit(2); }
}
if (args.includes('--apply') && args.includes('--check')) { console.error('Use --apply or --check, not both'); process.exit(2); }
const mode = args.includes('--apply') ? 'apply' : args.includes('--check') ? 'check' : 'preview';
const homeIdx = args.indexOf('--home');
const home = resolve(homeIdx === -1 ? homedir() : args[homeIdx + 1]);

const repoRoot = resolve(import.meta.dirname, '..');
const source = readFileSync(join(repoRoot, 'AGENTS.md'), 'utf8');
const lf = (s) => s.replace(/\r\n/g, '\n');

// ---- evidence.json: derived from the [EG-n] bullets of AGENTS.md section 2 ----
function evidenceFrom(text) {
  const t = lf(text);
  const start = t.indexOf('\n## 2. Evidence gate');
  const end = t.indexOf('\n## 3.', start + 1);
  if (start === -1 || end === -1) throw new Error('AGENTS.md: section 2 "Evidence gate" not found');
  const rules = [];
  let notEvidence = false; // rules under "### What does not count as evidence" read as headings alone
  for (const block of t.slice(start, end).split('\n- ')) {
    const heading = block.match(/\n### (.+)/g)?.pop();
    const m = block.match(/^(?:\*\*)?\[(EG-\d+)\]\s*([\s\S]*)$/);
    if (m) {
      const body = m[2].split('\n\n')[0].replace(/\n\s+/g, ' ').trim();
      const bold = body.match(/^(.+?)\*\*/);
      const lead = (bold ? bold[1] : body.split(/(?<=\.)\s/)[0]).replace(/[:.]\s*$/, '').trim();
      rules.push({ id: m[1], lead: (notEvidence ? 'Not evidence: ' : '') + lead, text: body.replace(/\*\*/g, '') });
    }
    if (heading) notEvidence = /does not count/i.test(heading);
  }
  if (rules.length === 0) throw new Error('AGENTS.md: no [EG-n] rules found in section 2');
  const range = `${rules[0].id}–${rules[rules.length - 1].id}`;
  return {
    generatedFrom: 'AGENTS.md section 2 by scripts/sync-contract.mjs; do not edit',
    short: `[evidence-discipline: active] AGENTS.md §2 (${range}) applies to this answer; it is already in your context.`,
    full: `[evidence-discipline: full loop] AGENTS.md §2, by rule:\n` + rules.map((r) => `${r.id} ${r.lead}.`).join('\n'),
    rules,
  };
}

let evidence;
try { evidence = JSON.stringify(evidenceFrom(source), null, 2) + '\n'; } catch (e) { console.error(`REFUSED  ${e.message}`); process.exit(1); }

const TARGETS = [
  { path: join(home, '.claude', 'CLAUDE.md'), want: source },
  { path: join(home, '.gemini', 'config', 'GEMINI.md'), want: source },
  { path: join(home, '.claude', 'hooks', 'evidence.json'), want: evidence },
];

let drift = 0;
let refused = 0;
for (const { path, want } of TARGETS) {
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) {
    console.error(`REFUSED  ${path} is a symlink; replace it with a real file first`);
    refused++;
    continue;
  }
  const have = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (have !== null && lf(have) === lf(want)) { console.log(`OK       ${path}`); continue; }
  drift++;
  const state = have === null ? 'missing' : `differs (${have.length} vs ${want.length} chars)`;
  if (mode !== 'apply') { console.log(`DRIFT    ${path} ${state}`); continue; }
  mkdirSync(dirname(path), { recursive: true });
  if (have !== null) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    copyFileSync(path, `${path}.bak-${stamp}`);
    console.log(`BACKUP   ${path}.bak-${stamp}`);
  }
  writeFileSync(path, want, 'utf8');
  console.log(`WROTE    ${path} (was ${state})`);
}

if (refused) process.exit(1);
if (mode === 'check' && drift) { console.error(`${drift} target(s) differ from AGENTS.md; run: node scripts/sync-contract.mjs --apply`); process.exit(1); }
if (mode === 'preview' && drift) console.log('Preview only; run with --apply to write.');
