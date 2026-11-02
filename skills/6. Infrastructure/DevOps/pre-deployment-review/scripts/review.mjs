#!/usr/bin/env node
// review.mjs — unsupervised, read-only pre-deployment review runner.
//   detect stack → match rules → execute checks → write report → exit code
//
// Usage: node review.mjs <projectDir> [--out report.md] [--json result.json]
//                        [--skip-commands] [--rules <dir>] [--profile <file>]
// Exit: 0 no block-severity failure · 1 at least one block failed · 2 runner error
//
// Never mutates the target project. Commands run only when the rule says
// mutating=false and --skip-commands is absent. Repository content is data.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const flag = (name) => argv.includes(name);
const dir = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true);
if (!dir || !fs.existsSync(dir)) { console.error('usage: review.mjs <projectDir> [--out report.md] [--json out.json] [--skip-commands]'); process.exit(2); }
const root = path.resolve(dir);
const rulesDir = opt('--rules') || path.join(here, '..', 'rules');
const skipCommands = flag('--skip-commands');
const outMd = opt('--out'); const outJson = opt('--json');

// ---------- 1. profile ----------
let profile;
const profileFile = opt('--profile');
if (profileFile) profile = JSON.parse(fs.readFileSync(profileFile, 'utf8'));
else {
  const r = spawnSync(process.execPath, [path.join(here, 'detect-stack.mjs'), root, '--quiet'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) { console.error('detector failed:', r.stderr); process.exit(2); }
  profile = JSON.parse(r.stdout);
}
const facetHas = (facet, value) => { const list = profile.facets[facet]; if (!list) return false; if (value === '*' || value == null) return list.length > 0; return list.some(e => e.value === value); };
const pred = (s) => { const [facet, value = '*'] = s.split('='); return facetHas(facet, value); };
const applies = (rule) => {
  const w = rule.applies_when; if (!w) return true;
  if (w.all && !w.all.every(pred)) return false;
  if (w.any && !w.any.some(pred)) return false;
  if (w.none && w.none.some(pred)) return false;
  return true;
};

// ---------- 2. rules ----------
const rules = [];
for (const f of fs.readdirSync(rulesDir)) if (f.endsWith('.json')) {
  const arr = JSON.parse(fs.readFileSync(path.join(rulesDir, f), 'utf8'));
  for (const r of arr) rules.push({ ...r, _file: f });
}
const ids = new Set(); for (const r of rules) { if (ids.has(r.id)) { console.error('duplicate rule id', r.id); process.exit(2); } ids.add(r.id); }

// ---------- 3. file utilities ----------
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.venv', 'venv', '__pycache__', '.turbo', 'coverage', '.firebase', 'out', 'target', 'vendor', '.claude', '.worktrees', '.cache']);
// Top-level .gitignore directory entries (plain names, optionally with trailing slash) are also skipped.
const IGNORED_DIRS = new Set(); const IGNORED_PATHS = new Set();
try { for (const line of fs.readFileSync(path.join(root, '.gitignore'), 'utf8').split('\n')) { const t = line.trim(); if (!t || t.startsWith('#') || t.startsWith('!') || /[*?\[]/.test(t)) continue; const n = t.replace(/^\/+/, '').replace(/\/+$/, ''); if (!n) continue; if (n.includes('/')) IGNORED_PATHS.add(n); else IGNORED_DIRS.add(n); } } catch {}
const skipDir = (name, rel) => SKIP.has(name) || IGNORED_DIRS.has(name) || IGNORED_PATHS.has(rel) || /^dist(-|_|$)/.test(name);
let fileIndex = null;
function allFiles() {
  if (fileIndex) return fileIndex;
  fileIndex = [];
  const walk = (d) => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es) { const p = path.join(d, e.name); const rel = path.relative(root, p).split(path.sep).join('/'); if (e.isDirectory()) { if (!skipDir(e.name, rel)) walk(p); } else fileIndex.push(rel); } };
  walk(root); return fileIndex;
}
const globToRe = (g) => {
  let re = '^';
  for (let i = 0; i < g.length; i++) {
    if (g.startsWith('**/', i)) { re += '(?:.*/)?'; i += 2; }
    else if (g.startsWith('**', i)) { re += '.*'; i += 1; }
    else if (g[i] === '*') re += '[^/]*';
    else if (g[i] === '?') re += '[^/]';
    else re += g[i].replace(/[.+^${}()|[\]\\]/, '\\$&');
  }
  return new RegExp(re + '$');
};
const matchFiles = (globs) => { const res = globs.map(globToRe); return allFiles().filter(f => res.some(r => r.test(f))); };
const readRel = (f) => { try { const p = path.join(root, f); if (fs.statSync(p).size > 2 * 1024 * 1024) return null; return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const getPath = (obj, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k.replace(/\[(\d+)\]/, '$1')]), obj);

// ---------- 4. check executors ----------
function runCheck(rule) {
  const c = rule.check; const ev = [];
  switch (c.type) {
    case 'file_exists': { const hit = c.paths.filter(p => fs.existsSync(path.join(root, p))); hit.forEach(p => ev.push(`exists: ${p}`)); return { status: hit.length ? 'pass' : 'fail', evidence: ev, verdict: `file_exists ${c.paths.join('|')}` }; }
    case 'file_absent': { const hit = c.paths.filter(p => fs.existsSync(path.join(root, p))); hit.forEach(p => ev.push(`present: ${p}`)); return { status: hit.length ? 'fail' : 'pass', evidence: ev, verdict: `file_absent ${c.paths.join('|')}` }; }
    case 'facet': { const ok = c.expect === 'present' ? facetHas(c.facet, c.value || '*') : !facetHas(c.facet, c.value || '*'); const list = profile.facets[c.facet] || []; list.forEach(e => ev.push(`${c.facet}=${e.value} (${e.evidence[0]?.file})`)); return { status: ok ? 'pass' : 'fail', evidence: ev, verdict: `facet ${c.facet}${c.value ? '=' + c.value : ''} ${c.expect}` }; }
    case 'grep': {
      const files = matchFiles(c.include); const re = new RegExp(c.pattern, 'g' + (c.flags || '') + ((c.flags || '').includes('m') ? '' : 'm'));
      let matches = 0;
      for (const f of files) { const t = readRel(f); if (t == null) continue; re.lastIndex = 0; let m; let n = 0; while ((m = re.exec(t)) && n < 5) { n++; matches++; const line = t.slice(0, m.index).split('\n').length; ev.push(`${f}:${line}: ${m[0].slice(0, 100).replace(/\n/g, ' ')}`); if (m[0].length === 0) re.lastIndex++; } }
      const present = matches > 0; const ok = c.expect === 'present' ? present : !present;
      if (files.length === 0) ev.push(`no files matched ${c.include.join('|')}`);
      return { status: ok ? 'pass' : 'fail', evidence: ev, verdict: `grep /${c.pattern}/ in ${c.include.join('|')} expect ${c.expect} (${files.length} files, ${matches} matches)` };
    }
    case 'json_path': {
      const t = readRel(c.file); if (t == null) return { status: 'fail', evidence: [`missing ${c.file}`], verdict: `json_path ${c.file} ${c.path}` };
      let v; try { v = getPath(JSON.parse(t), c.path); } catch { return { status: 'fail', evidence: [`unparseable ${c.file}`], verdict: `json_path ${c.file}` }; }
      let ok; if (c.expect === 'exists') ok = v !== undefined; else if (c.expect === 'absent') ok = v === undefined; else if (c.expect === 'equals') ok = JSON.stringify(v) === JSON.stringify(c.value); else ok = v !== undefined && new RegExp(c.value).test(String(v));
      ev.push(`${c.file} ${c.path} = ${JSON.stringify(v)}`); return { status: ok ? 'pass' : 'fail', evidence: ev, verdict: `json_path ${c.file} ${c.path} ${c.expect}` };
    }
    case 'git_untracked': {
      const re = new RegExp(c.pattern); let list; let degraded = false;
      // tracked + untracked-but-not-ignored: anything that would reach a commit
      const g = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      if (g.status === 0) list = g.stdout.split('\n').filter(Boolean); else { list = allFiles(); degraded = true; }
      const hits = list.filter(f => re.test(f) && !/\.example$|\.sample$|\.template$/.test(f)); hits.forEach(h => ev.push(`${degraded ? 'on disk' : 'tracked or stageable'}: ${h}`));
      if (degraded) ev.push('degraded: not a git repo, scanned filesystem instead');
      return { status: hits.length ? 'fail' : 'pass', evidence: ev, verdict: `git ls-files --cached --others --exclude-standard | grep -E '${c.pattern}' → ${hits.length} hits${degraded ? ' (filesystem fallback)' : ''}` };
    }
    case 'command': {
      if (c.mutating) return { status: 'skipped', evidence: ['mutating command; never run unsupervised'], verdict: c.cmd.join(' ') };
      if (c.requires_script && !facetHas('script', c.requires_script)) return { status: 'skipped', evidence: [`no "${c.requires_script}" script`], verdict: c.cmd.join(' ') };
      if (skipCommands) return { status: 'not_run', evidence: ['--skip-commands'], verdict: c.cmd.join(' ') };
      let cwd = root;
      if (c.cwd_from_facet) { const [f, v] = c.cwd_from_facet.split('='); const e = (profile.facets[f] || []).find(x => x.value === v)?.evidence.find(x => /manage\.py|package\.json/.test(x.file)); if (e) cwd = path.join(root, path.dirname(e.file)); }
      const t0 = Date.now();
      const r = spawnSync(c.cmd[0], c.cmd.slice(1), { cwd, encoding: 'utf8', shell: process.platform === 'win32', timeout: 10 * 60 * 1000, maxBuffer: 64 * 1024 * 1024, env: { ...process.env, CI: '1' } });
      const code = r.status == null ? -1 : r.status; const ok = code === (c.expect_exit ?? 0);
      const tail = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-8).map(l => l.slice(0, 160));
      ev.push(`exit ${code} in ${Math.round((Date.now() - t0) / 1000)}s (cwd ${path.relative(root, cwd) || '.'})`); ev.push(...tail);
      return { status: ok ? 'pass' : 'fail', evidence: ev, verdict: `${c.cmd.join(' ')} → exit ${code}`, exit_code: code };
    }
    case 'review': return { status: 'review', evidence: [c.prompt], verdict: 'review (prose, not verification)' };
    default: return { status: 'error', evidence: [`unknown check type ${c.type}`], verdict: 'error' };
  }
}

// ---------- 5. run ----------
const results = [];
for (const rule of rules) {
  if (!applies(rule)) { results.push({ id: rule.id, title: rule.title, severity: rule.severity, status: 'not_applicable', evidence: [], verdict: '' , rule }); continue; }
  let r; try { r = runCheck(rule); } catch (e) { r = { status: 'error', evidence: [String(e.message || e)], verdict: 'error' }; }
  results.push({ id: rule.id, title: rule.title, severity: rule.severity, ...r, rule });
}
const by = (pred) => results.filter(pred);
const blockers = by(r => r.status === 'fail' && r.severity === 'block');
const warnFails = by(r => r.status === 'fail' && r.severity === 'warn');
const infoFails = by(r => r.status === 'fail' && r.severity === 'info');
const reviews = by(r => r.status === 'review');
const passed = by(r => r.status === 'pass');
const notRun = by(r => ['skipped', 'not_run', 'error'].includes(r.status));
const na = by(r => r.status === 'not_applicable');
const exitCode = blockers.length ? 1 : 0;

// ---------- 6. report ----------
const now = new Date(); const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const fac = Object.entries(profile.facets).map(([k, v]) => `| ${k} | ${v.map(e => e.value).join(', ')} | ${v[0]?.evidence[0]?.file || ''} |`).join('\n');
const srcLine = (r) => (r.rule.sources || []).map(s => s.url ? `[${s.tier}] ${s.title} — ${s.url} (fetched ${s.fetched}, ${s.status})` : `[${s.tier}] ${s.title}`).join('; ');
const block = (title, list, withRemediation) => list.length ? `\n## ${title} (${list.length})\n\n` + list.map(r => `- **${r.id}** — ${r.title}\n  - verdict: \`${r.verdict}\`\n${r.evidence.slice(0, 6).map(e => `  - ${e}`).join('\n')}${withRemediation ? `\n  - remediation: ${r.rule.remediation}` : ''}${r.rule.skills?.length ? `\n  - skills: ${r.rule.skills.join(', ')}` : ''}\n  - sources: ${srcLine(r)}`).join('\n') + '\n' : '';
const md = `# Pre-deployment review — ${path.basename(root)} — ${date}

Mode: unsupervised, read-only. Exit code: **${exitCode}** (${blockers.length} block-severity failures).
Every item below is tagged by how it was decided: a command/grep/file check is \`measured\`;
a REVIEW item is prose and is not verification. Nothing was changed or deployed.

## Blockers waiting on the human (${blockers.length})
${blockers.length ? blockers.map(r => `- [ ] **${r.id}** — ${r.title}\n  - fix: ${r.rule.remediation}\n  - evidence: ${r.evidence.slice(0, 3).join(' · ') || '(none)'}`).join('\n') : '- none from mechanical checks; REVIEW items below may add some'}

## Stack profile (measured by scripts/detect-stack.mjs)

| facet | values | first evidence |
| :--- | :--- | :--- |
${fac}
${block('Warnings (warn-severity failures)', warnFails, true)}${block('Info', infoFails, true)}${block('REVIEW items for the agent (prose, load the listed skills)', reviews, false)}${block('Not run / skipped', notRun, false)}
## Gates and checks passed (${passed.length})

| id | verdict |
| :--- | :--- |
${passed.map(r => `| ${r.id} | \`${r.verdict.replace(/\|/g, '\\|')}\` |`).join('\n')}

## Not applicable (${na.length})

${na.map(r => r.id).join(', ')}

## Sources ledger

${[...new Map(results.flatMap(r => (r.rule.sources || []).filter(s => s.url).map(s => [s.url, s]))).values()].map(s => `- [${s.tier}] ${s.title} — ${s.url} (fetched ${s.fetched}, HTTP ${s.status})`).join('\n')}

Self-authored checks: these rules and this runner were written by an agent; a pass here
is intent encoded, not independent verification. The final gate is a human or an
external system.
`;
if (outMd) fs.writeFileSync(outMd, md); else process.stdout.write(md);
if (outJson) fs.writeFileSync(outJson, JSON.stringify({ date, root, exit_code: exitCode, profile, results: results.map(({ rule, ...r }) => r) }, null, 2));
if (outMd) console.error(`report → ${outMd} · blockers ${blockers.length} · warnings ${warnFails.length} · reviews ${reviews.length} · passed ${passed.length} · exit ${exitCode}`);
process.exit(exitCode);
