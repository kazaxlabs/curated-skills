#!/usr/bin/env node
// sync-contract.mjs — keep the global copy of the agent contract identical to this repo's AGENTS.md.
// AGENTS.md is the one source. Claude Code reads ~/.claude/CLAUDE.md in every project, so that file is a
// generated copy. A hand-edited copy drifts (CLAUDE.md: "A copy drifts"); this script is the only writer.
//
// Usage:
//   node scripts/sync-contract.mjs            # preview (default): say whether each copy matches, change nothing
//   node scripts/sync-contract.mjs --apply    # back up any copy that differs, then overwrite it with AGENTS.md
//   node scripts/sync-contract.mjs --check    # exit 1 if any copy differs from AGENTS.md (drift gate)
//   --home <dir>                              # user home to act on (default: os.homedir()); for scratch tests
//
// Comparison ignores CRLF vs LF only; any other byte difference is drift.
// --apply writes <copy>.bak-<UTC timestamp> before overwriting an existing copy that differs.
// A copy that is a symlink is refused (repo rule: no symlinks on Windows; real files only).
// Exit: 0 ok, 1 drift (--check) or refused target, 2 bad arguments.
// To add a copy (e.g. ~/.gemini/GEMINI.md for Antigravity), add it to COPIES.

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
const source = join(repoRoot, 'AGENTS.md');
const COPIES = [join(home, '.claude', 'CLAUDE.md')];

const lf = (s) => s.replace(/\r\n/g, '\n');
const want = readFileSync(source, 'utf8');
let drift = 0;
let refused = 0;

for (const copy of COPIES) {
  if (existsSync(copy) && lstatSync(copy).isSymbolicLink()) {
    console.error(`REFUSED  ${copy} is a symlink; replace it with a real file first`);
    refused++;
    continue;
  }
  const have = existsSync(copy) ? readFileSync(copy, 'utf8') : null;
  if (have !== null && lf(have) === lf(want)) { console.log(`OK       ${copy}`); continue; }
  drift++;
  const state = have === null ? 'missing' : `differs (${have.length} vs ${want.length} chars)`;
  if (mode !== 'apply') { console.log(`DRIFT    ${copy} ${state}`); continue; }
  mkdirSync(dirname(copy), { recursive: true });
  if (have !== null) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    copyFileSync(copy, `${copy}.bak-${stamp}`);
    console.log(`BACKUP   ${copy}.bak-${stamp}`);
  }
  writeFileSync(copy, want, 'utf8');
  console.log(`WROTE    ${copy} (was ${state})`);
}

if (refused) process.exit(1);
if (mode === 'check' && drift) { console.error(`${drift} copy(ies) differ from AGENTS.md; run: node scripts/sync-contract.mjs --apply`); process.exit(1); }
if (mode === 'preview' && drift) console.log('Preview only; run with --apply to write.');
