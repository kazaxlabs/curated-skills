#!/usr/bin/env node
// usage-report.mjs — measured skill demand from local Claude Code transcripts (plan D3, step 5.1).
//
// Counts Skill-tool invocations in ~/.claude/projects/**/*.jsonl, per skill: total, distinct projects,
// first and last date. Output stays local: project folder names identify clients, so never commit it.
//
// Usage: node scripts/verify/usage-report.mjs [--since YYYY-MM-DD] [--until YYYY-MM-DD]
//                                             [--raw] [--json <file>] [--core core.json]
//   --raw   report skill names exactly as invoked (no alias folding)
//   --core  also print, for each Core entry, whether it meets the demand rule in core.json
// Caveats: Antigravity sessions are not in these files; skills read by path instead of the Skill tool
// are not counted.

import { createReadStream, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i === -1 ? undefined : args[i + 1]; };
const since = opt('--since');
const until = opt('--until');
const raw = args.includes('--raw');
const jsonOut = opt('--json');
const corePath = opt('--core');

const repoRoot = resolve(import.meta.dirname, '..', '..');
const aliasFile = join(repoRoot, 'aliases.json');
const aliases = !raw && existsSync(aliasFile) ? JSON.parse(readFileSync(aliasFile, 'utf8')) : {};
const projectsRoot = join(homedir(), '.claude', 'projects');

function normalize(name) {
  if (raw) return name;
  const m = /^(.+) \((.+)\)$/.exec(name); // "folder-name (skill-name)" as listed by the harness
  const base = m ? m[2] : name;
  return aliases[base] ?? base;
}

function* jsonlFiles(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) { if (e !== 'memory') yield* jsonlFiles(p); }
    else if (e.endsWith('.jsonl')) yield p;
  }
}

const stats = new Map();
let files = 0;
for (const file of jsonlFiles(projectsRoot)) {
  files++;
  const project = relative(projectsRoot, file).split(sep)[0];
  const rl = createInterface({ input: createReadStream(file, { encoding: 'utf8' }), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.includes('"Skill"')) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    const content = obj?.message?.content;
    if (!Array.isArray(content)) continue;
    const day = (obj.timestamp ?? '').slice(0, 10);
    if ((since && day && day < since) || (until && day && day > until)) continue;
    for (const block of content) {
      if (block?.type !== 'tool_use' || block?.name !== 'Skill') continue;
      const skill = block?.input?.skill;
      if (!skill) continue;
      const key = normalize(skill);
      const s = stats.get(key) ?? { skill: key, invocations: 0, projects: new Set(), first: null, last: null };
      s.invocations++;
      s.projects.add(project);
      if (day) {
        if (!s.first || day < s.first) s.first = day;
        if (!s.last || day > s.last) s.last = day;
      }
      stats.set(key, s);
    }
  }
}

const rows = [...stats.values()]
  .map((s) => ({ ...s, projects: s.projects.size }))
  .sort((a, b) => b.invocations - a.invocations || a.skill.localeCompare(b.skill));
const total = rows.reduce((n, r) => n + r.invocations, 0);
console.log(`transcripts=${files} distinct_skills=${rows.length} invocations=${total} window=${since ?? 'start'}..${until ?? 'now'} ${raw ? '(raw names)' : '(aliases folded)'}`);
for (const r of rows) console.log(`${String(r.invocations).padStart(4)}  ${r.skill.padEnd(46)} projects=${String(r.projects).padStart(2)}  ${r.first}..${r.last}`);

if (corePath) {
  const core = JSON.parse(readFileSync(resolve(corePath), 'utf8'));
  const { minInvocations, minProjects } = core.rules.demand;
  console.log(`\nCore demand check (>= ${minInvocations} invocations across >= ${minProjects} projects, nominated entries exempt):`);
  for (const c of core.skills) {
    const r = rows.find((x) => x.skill === c.name);
    const meets = r && r.invocations >= minInvocations && r.projects >= minProjects;
    const nominated = c.basis?.startsWith('nominated');
    console.log(`  ${meets ? 'meets  ' : nominated ? 'nominee' : 'BELOW  '} ${c.name.padEnd(46)} ${r ? `${r.invocations} inv / ${r.projects} proj` : 'no recorded use'}`);
  }
}

if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ files, total, rows, since, until, raw }, null, 2));
