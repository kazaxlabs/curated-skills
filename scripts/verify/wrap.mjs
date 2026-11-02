#!/usr/bin/env node
// wrap.mjs — wrap one skill in a throwaway plugin and run the static gate (plan step 5.2).
//
// Usage: node scripts/verify/wrap.mjs <skill-name> [--out <dir>] [--json <file>] [--no-gate]
// Builds <out>/<skill-name>/ (default out: .verify/) with .claude-plugin/plugin.json, a copy of the skill under
// skills/<skill-name>/ (a copy: `plugin validate` does not follow symlinks) and the skill's own evals/ folder.
//
// Static gate, all three must pass (exit 0), else exit 1:
//  1. frontmatter   strict YAML parse (PyYAML): a mapping with string `name` == folder and string
//                   `description` of 1-1024 chars. Needed because `plugin validate` accepts malformed YAML
//                   (measured 2026-10-31: an unclosed list and a misspelt `name` key passed with success=true).
//  2. validate      `claude plugin validate --json`: no errors or warnings in manifest or contents, except
//                   allowlisted directory-listing checks.
//  3. loads         `claude --plugin-dir <wrapper> plugin details`: exactly one skill loads; the always-on and
//                   on-invoke token estimates are recorded.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ALLOWED = new Set(['ICON_MISSING', 'README_MISSING']);
const CLAUDE = process.platform === 'win32' ? 'claude.exe' : 'claude';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i === -1 ? undefined : args[i + 1]; };
const name = args.find((a, i) => !a.startsWith('--') && !['--out', '--json'].includes(args[i - 1]));
const repoRoot = resolve(import.meta.dirname, '..', '..');
const outRoot = resolve(opt('--out') ?? join(repoRoot, '.verify'));
if (!name) { console.error('usage: wrap.mjs <skill-name> [--out dir] [--json file] [--no-gate]'); process.exit(2); }

function findSkill(skillName) {
  const hits = [];
  const walk = (dir, depth) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (!statSync(p).isDirectory()) continue;
      if (e === skillName && existsSync(join(p, 'SKILL.md'))) hits.push(p);
      if (depth < 4) walk(p, depth + 1);
    }
  };
  walk(join(repoRoot, 'skills'), 1);
  return hits;
}

const hits = findSkill(name);
if (hits.length !== 1) { console.error(`expected one skill folder named ${name}, found ${hits.length}`); process.exit(2); }
const skillDir = hits[0];
const wrapper = join(outRoot, name);
rmSync(wrapper, { recursive: true, force: true });
mkdirSync(join(wrapper, '.claude-plugin'), { recursive: true });
cpSync(skillDir, join(wrapper, 'skills', name), {
  recursive: true,
  filter: (p) => !/^[\\/]evals([\\/]|$)/.test(p.slice(skillDir.length)),
});
if (existsSync(join(skillDir, 'evals'))) {
  cpSync(join(skillDir, 'evals'), join(wrapper, 'evals'), { recursive: true, filter: (p) => !/[\\/]results([\\/]|$)/.test(p) });
}
writeFileSync(join(wrapper, '.claude-plugin', 'plugin.json'), JSON.stringify({
  name, version: '0.0.0', description: `Verification wrapper for the ${name} skill (Curated_Skills)`,
  author: { name: 'kazaxlabs' },
}, null, 2) + '\n');
console.log(`wrapper: ${wrapper}`);
if (args.includes('--no-gate')) process.exit(0);

const record = { skill: name, path: skillDir.slice(repoRoot.length + 1).replace(/\\/g, '/'), checkedAt: new Date().toISOString(), gates: {} };

// 1. strict frontmatter
const py = [
  'import sys, yaml, json',
  't = open(sys.argv[1], encoding="utf-8").read().replace("\\r\\n", "\\n")',
  'if not t.startswith("---\\n"): print(json.dumps({"ok": False, "why": "no frontmatter"})); sys.exit()',
  'end = t.find("\\n---", 4)',
  'try:',
  '    fm = yaml.safe_load(t[4:end])',
  'except Exception as e:',
  '    print(json.dumps({"ok": False, "why": "yaml: " + str(e).splitlines()[0]})); sys.exit()',
  'name, desc = (fm or {}).get("name"), (fm or {}).get("description")',
  'why = []',
  'if not isinstance(fm, dict): why.append("frontmatter is not a mapping")',
  'if not isinstance(name, str) or name != sys.argv[2]: why.append("name %r != folder %r" % (name, sys.argv[2]))',
  'if not isinstance(desc, str) or not (1 <= len(desc.strip()) <= 1024): why.append("description missing or not 1-1024 chars")',
  'print(json.dumps({"ok": not why, "why": "; ".join(why)}))',
].join('\n');
const fmRun = spawnSync('python', ['-I', '-c', py, join(skillDir, 'SKILL.md'), name], { encoding: 'utf8' });
let fm;
try { fm = JSON.parse(fmRun.stdout); } catch { fm = { ok: false, why: (fmRun.stderr || 'python failed').trim() }; }
record.gates.frontmatter = fm;

// 2. plugin validate
const v = spawnSync(CLAUDE, ['plugin', 'validate', '--json', wrapper], { encoding: 'utf8' });
let blocking = [];
try {
  const rep = JSON.parse(v.stdout);
  const all = [...(rep.manifest?.errors ?? []), ...(rep.manifest?.warnings ?? []),
    ...(rep.contents ?? []).flatMap((c) => [...(c.errors ?? []), ...(c.warnings ?? [])])];
  blocking = all.filter((i) => !ALLOWED.has(i.code)).map((i) => `${i.path ?? ''}: ${i.message}`);
  if (!rep.success) blocking.unshift('validate reported success=false');
} catch { blocking = [`validate output unreadable: ${(v.stdout || v.stderr).slice(0, 200)}`]; }
record.gates.validate = { ok: blocking.length === 0, issues: blocking };

// 3. loads under Claude Code, with token estimates
const d = spawnSync(CLAUDE, ['--plugin-dir', wrapper, 'plugin', 'details', name], { encoding: 'utf8' });
const out = `${d.stdout}${d.stderr}`;
const skillsLoaded = Number((/Skills \((\d+)\)/.exec(out) ?? [])[1] ?? 0);
// Table cells look like "~140", "< 20" or "~3.7k" (rounded estimates).
const tok = (s) => { const m = /([\d.,]+)\s*(k?)/i.exec(s ?? ''); return m ? Math.round(Number(m[1].replace(/,/g, '')) * (m[2] ? 1000 : 1)) : null; };
const row = new RegExp(`^\\s*${name.replace(/[-]/g, '\\-')}\\s+((?:<\\s*)?~?[\\d.,]+k?)\\s+((?:<\\s*)?~?[\\d.,]+k?)`, 'mi').exec(out);
record.gates.loads = {
  ok: d.status === 0 && skillsLoaded === 1,
  skillsLoaded,
  alwaysOnTokens: row ? tok(row[1]) : null,
  onInvokeTokens: row ? tok(row[2]) : null,
};

const ok = Object.values(record.gates).every((g) => g.ok);
record.static = ok ? 'pass' : 'fail';
for (const [k, g] of Object.entries(record.gates)) {
  const detail = g.why || (g.issues?.length ? g.issues.join(' | ') : '') || (k === 'loads' ? `always-on ~${g.alwaysOnTokens} tok, on-invoke ~${g.onInvokeTokens} tok` : '');
  console.log(`  ${g.ok ? 'ok  ' : 'FAIL'} ${k.padEnd(12)} ${detail}`);
}
console.log(`static gate: ${record.static}`);
if (opt('--json')) writeFileSync(resolve(opt('--json')), JSON.stringify(record, null, 2) + '\n');
process.exit(ok ? 0 : 1);
