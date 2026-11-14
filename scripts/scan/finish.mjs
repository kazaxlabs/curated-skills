#!/usr/bin/env node
// finish.mjs — follow-up to the full model pass (plan docs/plans/skill-security-scan.md, S6 → S7). Run it once
// model-pass.mjs has finished, or with --wait while it still runs. It:
//   1. waits for a running model-pass.mjs (with --wait), otherwise refuses to start a second writer;
//   2. resumes the pass until every skill has a verdict, the budget stops it, or a rerun makes no progress;
//   3. lists skills whose judgement keeps failing (e.g. the model's own safeguard refusals) for a manual read;
//   4. reruns normalize.mjs, then checks its output against the source reports (independent gates);
//   5. writes triage.json and triage.md: the only skills a person needs to read, with masked excerpts.
// It never executes skill content, never changes the library, installs or config.
//
// Usage: node scripts/scan/finish.mjs [--reports <dir>] [--wait] [--max-reruns 2] [--budget-usd 5] [--no-rerun] [--no-normalize]
// Exit: 0 all gates pass, 1 a gate failed (report still written), 2 bad arguments, 3 model pass still running (without --wait).

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const has = (k) => args.includes(k);
const R = resolve(opt('--reports', join(homedir(), '.skillscan', 'reports', '2026-11-02')));
const here = import.meta.dirname;
const MODEL = 'claude-haiku-5-5';
const maxReruns = Number(opt('--max-reruns', 2));
const budget = opt('--budget-usd', '5');
if (!existsSync(join(R, 'full-list.json'))) { console.error(`no full-list.json in ${R}`); process.exit(2); }

const log = (...a) => console.log(...a);
const readJsonl = (f) => (existsSync(f) ? readFileSync(f, 'utf8').split('\n').filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } }) : []);
const posix = (p) => String(p ?? '').replace(/\\/g, '/');
const mask = (s) => String(s ?? '').replace(/(AKIA|ASIA)[A-Z0-9]{8,}/g, (m) => m.slice(0, 6) + '…').replace(/eyJ[A-Za-z0-9_.-]{12,}/g, (m) => m.slice(0, 8) + '…')
  .replace(/(:\/\/[^:/\s]+:)[^@\s]+@/g, '$1***@').replace(/\b[A-Za-z0-9+/_=-]{32,}\b/g, (m) => m.slice(0, 6) + `…(${m.length})`).slice(0, 220);

// ---------- 1. is a model pass still running? ----------
function passRunning() {
  try {
    const out = execFileSync('powershell.exe', ['-NoProfile', '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -match 'model-pass\\.mjs' } | ForEach-Object { \"$($_.ProcessId)`t$($_.CommandLine)\" }"], { encoding: 'utf8' });
    const dir = posix(R).toLowerCase();   // only a pass writing into this reports folder counts
    return out.split(/\r?\n/).filter(Boolean).map((l) => l.split('\t')).filter(([, cmd]) => posix(cmd).toLowerCase().includes(dir)).map(([p]) => Number(p)).filter((p) => p !== process.pid);
  } catch { return []; }
}
let running = passRunning();
if (running.length && !has('--wait')) { log(`model-pass.mjs is still running (pid ${running.join(', ')}). Rerun later, or add --wait.`); process.exit(3); }
while (running.length) {
  const okNow = readJsonl(join(R, 'haiku-full.jsonl')).filter((r) => !r.error).length;
  log(`${new Date().toLocaleTimeString()} waiting for pid ${running.join(', ')}: ${okNow} verdicts so far`);
  spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},60000)']);   // 60 s, without a shell sleep
  running = passRunning();
}

// ---------- 2. resume until complete ----------
const list = JSON.parse(readFileSync(join(R, 'full-list.json'), 'utf8'));
const outFile = join(R, 'haiku-full.jsonl');
const coverage = () => {
  const rows = readJsonl(outFile);
  const ok = new Set(rows.filter((r) => !r.error).map((r) => r.id));
  return { rows, ok, missing: list.filter((x) => !ok.has(x.id)) };
};
let cov = coverage();
for (let i = 0; i < maxReruns && cov.missing.length && !has('--no-rerun'); i++) {
  log(`resume ${i + 1}/${maxReruns}: ${cov.missing.length} skill(s) without a verdict`);
  const before = cov.ok.size;
  spawnSync(process.execPath, [join(here, 'model-pass.mjs'), join(R, 'full-list.json'), outFile, MODEL, '--concurrency', '4', '--budget-usd', budget], { stdio: 'inherit' });
  cov = coverage();
  if (cov.ok.size === before) { log('no progress on this resume (budget reached, or the same skills keep failing): stopping resumes'); break; }
}

// ---------- 3. persistent failures ----------
const lastErr = new Map();
for (const r of cov.rows) if (r.error) lastErr.set(r.id, r.error); else lastErr.delete(r.id);
const manual = cov.missing.map((x) => ({ id: x.id, lastError: (lastErr.get(x.id) ?? 'never attempted').slice(0, 200) }));
const failed = new Set(manual.filter((m) => m.lastError !== 'never attempted').map((m) => m.id));   // attempted, still no verdict
writeFileSync(join(R, 'needs-manual.json'), JSON.stringify(manual, null, 1));

// ---------- 4. normalize, then check it against the sources ----------
if (!has('--no-normalize')) {
  // normalize.mjs reads and writes the folder named in SKILLSCAN_REPORTS, so it always works on R.
  const n = spawnSync(process.execPath, [join(here, 'normalize.mjs')], { encoding: 'utf8', env: { ...process.env, SKILLSCAN_REPORTS: R } });
  log(n.stdout.trim());
  if (n.status !== 0) { console.error(`normalize.mjs failed (exit ${n.status}): ${n.stderr.slice(0, 400)}`); process.exit(1); }
}
const summary = JSON.parse(readFileSync(join(R, 'summary.json'), 'utf8'));
const findings = readJsonl(join(R, 'findings.jsonl'));
const hygiene = JSON.parse(readFileSync(join(R, 'hygiene.json'), 'utf8'));
const cisco = JSON.parse(readFileSync(join(R, 'cisco-static.json'), 'utf8'));
const secrets = JSON.parse(readFileSync(join(R, 'detect-secrets.json'), 'utf8'));
const pilot = readJsonl(join(R, 'pilot-haiku.jsonl')).filter((r) => !r.id.startsWith('fx-'));

const gates = [];
const gate = (name, pass, detail) => { gates.push({ name, pass, detail }); log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };
const ids = summary.map((s) => s.id);
gate('summary covers 1,502 unique skills', ids.length === 1502 && new Set(ids).size === 1502, `${ids.length} rows, ${new Set(ids).size} unique`);
const noVerdict = summary.filter((s) => !s.model?.verdict || s.model.verdict === 'error');
gate('every skill has a model verdict', noVerdict.length === 0, `${noVerdict.length} without (listed in needs-manual.json: ${manual.length})`);
const expected = hygiene.findings.length + cisco.results.reduce((a, r) => a + r.findings.length, 0) + Object.values(secrets.results).reduce((a, v) => a + v.length, 0);
gate('finding count equals the source reports', findings.length === expected, `${findings.length} vs ${expected}`);
const unknown = findings.filter((f) => !f.skill || f.skill === 'unknown').length;
gate('every finding is assigned to a skill', unknown === 0, `${unknown} unassigned`);
// A finding whose file path is absolute or repo-relative must sit inside its skill folder; `includes` matching can assign
// skills/x/foo's file to skills/x/fo.
const wrong = findings.filter((f) => { const p = posix(f.file); const m = p.match(/skills\/.+$/); return m && f.skill !== 'unknown' && !m[0].startsWith(f.skill + '/'); });
gate('every path-bearing finding sits inside its skill folder', wrong.length === 0, `${wrong.length} misassigned${wrong.length ? ', e.g. ' + wrong.slice(0, 2).map((f) => `${f.file} -> ${f.skill}`).join('; ') : ''}`);
const lastOk = new Map(); for (const r of cov.rows) if (!r.error) lastOk.set(r.id, r.verdict);
const byId = new Map(summary.map((s) => [s.id, s]));
const verdictMismatch = [...lastOk].filter(([id, v]) => byId.get(id)?.model?.verdict !== v).length;
gate('summary verdicts equal the model output', verdictMismatch === 0, `${verdictMismatch} differ`);
// Pilot rows carry folder names only; a name used by two skills cannot be mapped safely.
const baseCount = new Map(); for (const s of summary) baseCount.set(s.base, (baseCount.get(s.base) ?? 0) + 1);
const ambiguousPilot = pilot.filter((r) => baseCount.get(r.id.replace(/^(top|rnd):/, '')) > 1).map((r) => r.id);
gate('pilot verdicts map to exactly one skill', ambiguousPilot.length === 0, ambiguousPilot.join(', '));

// ---------- 5. triage ----------
const PINNED = { instagram: 'uploads images anonymously to Imgur (public host) with a hard-coded client id',
  'skill-sentinel': 'whitelists the same Imgur client id, so its own scan does not report it',
  'auri-core': 'SKILL.md damaged at import: "$0" expanded to /usr/bin/bash, one NUL byte',
  evolution: 'pipes a third-party GitHub install.sh into bash' };
const triage = [];
for (const s of summary) {
  const v = s.model?.verdict, c = s.model?.confidence ?? 0, crit = s.counts?.cisco?.CRITICAL ?? 0, hyHigh = s.counts?.hygiene?.high ?? 0;
  const why = [];
  if (v === 'malicious') why.push('model: malicious');
  if (v === 'suspicious') why.push('model: suspicious');
  if ((!v || v === 'error') && failed.has(s.id)) why.push(`no verdict, judging failed: ${(lastErr.get(s.id) ?? '').slice(0, 80)}`);
  if (crit && v === 'benign' && c < 0.8) why.push(`Cisco CRITICAL ×${crit}, model benign at ${c}`);
  if (PINNED[s.base]) why.push(`pilot note: ${PINNED[s.base]}`);
  if (!why.length) continue;
  const score = (v === 'malicious' ? 100 : v === 'suspicious' ? 40 : 0) + (!v || v === 'error' ? 30 : 0) + crit * 5 + hyHigh * 3 + (PINNED[s.base] ? 20 : 0) + Math.round(c * 10);
  const ev = findings.filter((f) => f.skill === s.id && /^(high|critical)$/i.test(f.severity) && f.tool !== 'detect-secrets').slice(0, 5)
    .map((f) => `${f.tool}/${f.rule} ${posix(f.file).split('/').slice(-2).join('/')}:${f.line} | ${mask(f.excerpt)}`);
  triage.push({ id: s.id, score, verdict: v ?? null, confidence: s.model?.confidence ?? null, why, reasons: (s.model?.reasons ?? []).map(mask), evidence: ev });
}
triage.sort((a, b) => b.score - a.score);
writeFileSync(join(R, 'triage.json'), JSON.stringify(triage, null, 1));

const verdicts = {}; for (const s of summary) { const v = s.model?.verdict ?? 'none'; verdicts[v] = (verdicts[v] ?? 0) + 1; }
const allRows = [...pilot, ...cov.rows];
const cost = allRows.reduce((a, r) => a + (r.costUsd ?? 0), 0);
const times = cov.rows.map((r) => Date.parse(r.at)).filter(Boolean).sort((a, b) => a - b);
const minutes = times.length > 1 ? (times.at(-1) - times[0]) / 60000 : 0;
const md = [
  `# Skill scan triage — ${new Date().toISOString().slice(0, 10)}`, '',
  `Library: 1,502 skills (worktree c0ebe21). Model: ${MODEL} via \`claude -p\`. Reports: \`${posix(R)}\`.`, '',
  `| Measure | Value |`, `| :--- | :--- |`,
  ...Object.entries(verdicts).map(([k, n]) => `| verdict ${k} | ${n} |`),
  `| model calls with a cost estimate | ${allRows.length} |`,
  `| summed CLI cost estimate (list price, subscription usage) | $${cost.toFixed(2)} |`,
  `| full-pass wall time (first to last verdict) | ${minutes.toFixed(0)} min |`,
  `| judging failed (read by hand) | ${failed.size} |`,
  `| never attempted (rerun finish.mjs) | ${manual.length - failed.size} |`, '',
  '## Gates (machine checks on normalize.mjs output)', '',
  ...gates.map((g) => `- ${g.pass ? 'PASS' : '**FAIL**'} ${g.name}${g.detail ? ': ' + g.detail : ''}`), '',
  `## Read these ${triage.length} skills (highest first)`, '',
  'Model verdicts are reviews; the owner\'s reading is the gate. Excerpts are masked and cut to 220 characters.', '',
  ...triage.flatMap((t, i) => [`### ${i + 1}. ${t.id}`, `- verdict: ${t.verdict ?? 'none'}${t.confidence != null ? ` (${t.confidence})` : ''}; why listed: ${t.why.join('; ')}`,
    ...t.reasons.map((r) => `- model: ${r}`), ...t.evidence.map((e) => `- \`${e.replace(/`/g, "'")}\``), '']),
];
writeFileSync(join(R, 'triage.md'), md.join('\n'));
log(`\nverdicts ${JSON.stringify(verdicts)} | triage ${triage.length} | needs manual ${manual.length} | est cost $${cost.toFixed(2)} | ${minutes.toFixed(0)} min`);
log(`wrote ${posix(join(R, 'triage.md'))}, triage.json, needs-manual.json`);
process.exit(gates.every((g) => g.pass) ? 0 : 1);
