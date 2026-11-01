#!/usr/bin/env node
// install-core.mjs — install only the Core (core.json) for Claude Code and Antigravity, and remove what the
// old installer and index builder left behind, so every session lists ~24 checked skills instead of ~1,500.
// The rest of the library stays searchable (skills/_index + collab-mcp search_skills), never installed (plan D1).
//
// Usage:
//   node scripts/install-core.mjs                    # preview (default): print what --apply would change
//   node scripts/install-core.mjs --apply            # back up, then make the changes
//   node scripts/install-core.mjs --check            # exit 1 unless the installed state matches core.json
//   node scripts/install-core.mjs --restore <file>   # put back what an --apply removed, from its backup file
//   --home <dir>                                     # user home to act on (default: os.homedir()); for scratch tests
//
// Targets (under --home):
//   .claude/skills/             Claude Code: one link per Core skill
//   .gemini/config/skills       Antigravity: today a link to this repo's whole skills/ folder; becomes a real
//                               folder holding one link per Core skill
//   .gemini/config/skills.json  Antigravity's list of every skill folder (old builder output): removed
//   .claude/commands/*.md       per-skill stubs written by the old builder: removed (also in this repo's .claude/commands)
//
// Rules: real files and folders are never touched; links pointing outside this repo's skills/ are never touched
// (every link into it is managed here, whoever made it); a command file is removed only if it carries the old
// builder's exact signature. --apply writes the backup before changing anything.
// Exit: 0 ok, 1 --check mismatch or unresolved Core skill, 2 bad arguments.

import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, rmdirSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const mode = args.includes('--apply') ? 'apply' : args.includes('--check') ? 'check' : args.includes('--restore') ? 'restore' : 'preview';
const home = resolve(opt('--home', homedir()));
const repoRoot = resolve(import.meta.dirname, '..');
const skillsRoot = join(repoRoot, 'skills');
const norm = (p) => resolve(p.replace(/^\\\\\?\\/, '')).toLowerCase();
const inRepoSkills = (p) => norm(p).startsWith(norm(skillsRoot) + sep);
const isLink = (p) => { try { return lstatSync(p).isSymbolicLink(); } catch { return false; } };
const exists = (p) => { try { lstatSync(p); return true; } catch { return false; } };
const linkTarget = (p) => { try { return readlinkSync(p); } catch { return null; } };
const STUB_SIGNATURE = /^Invoke the \*\*.+\*\* skill \(`\/[^`]+`\) on the user's request:$[\s\S]*Read the canonical skill instructions at `/m;

const claudeSkills = join(home, '.claude', 'skills');
const geminiConfig = join(home, '.gemini', 'config');
const geminiSkills = join(geminiConfig, 'skills');
const geminiJson = join(geminiConfig, 'skills.json');
const commandDirs = [join(home, '.claude', 'commands'), join(repoRoot, '.claude', 'commands')];

if (mode === 'restore') { restore(opt('--restore')); process.exit(0); }

// ---------- Core: name -> skill folder ----------
const core = JSON.parse(readFileSync(join(repoRoot, 'core.json'), 'utf8')).skills.map((s) => s.name);
const byName = new Map();
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '_index' || e.name.startsWith('.')) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name === 'SKILL.md') {
      const m = readFileSync(full, 'utf8').match(/^name:\s*["']?([^"'\r\n]+)/m);
      for (const n of [m?.[1].trim(), dir.split(sep).at(-1)]) if (n && !byName.has(n)) byName.set(n, dir);
    }
  }
})(skillsRoot);
const unresolved = core.filter((n) => !byName.has(n));
if (unresolved.length) { console.error(`Core skills with no folder in ${skillsRoot}: ${unresolved.join(', ')}`); process.exit(1); }
const want = new Map(core.map((n) => [n, byName.get(n)]));

// ---------- plan ----------
const actions = [];   // { kind, path, to?, note }
const notes = [];
function planLinkFolder(folder, label) {
  const present = new Set();
  if (existsSync(folder) && !isLink(folder)) {
    for (const name of readdirSync(folder)) {
      const p = join(folder, name);
      if (!isLink(p)) { if (want.has(name)) { present.add(name); notes.push(`${label}: ${name} is a real folder; left as is`); } continue; }
      const t = linkTarget(p);
      if (!t || !inRepoSkills(t)) continue;               // links elsewhere are not ours
      if (want.has(name) && norm(t) === norm(want.get(name))) { present.add(name); continue; }
      actions.push({ kind: 'unlink', path: p, from: t, note: `${label}: ${want.has(name) ? 're-point' : 'remove'} ${name}` });
    }
  }
  for (const [name, dir] of want) if (!present.has(name)) actions.push({ kind: 'link', path: join(folder, name), to: dir, note: `${label}: add ${name}` });
}

if (existsSync(join(home, '.claude'))) {
  if (!existsSync(claudeSkills)) actions.push({ kind: 'mkdir', path: claudeSkills, note: 'Claude Code: create skills folder' });
  if (isLink(claudeSkills)) { console.error(`${claudeSkills} is itself a link; refusing (expected a folder of per-skill links)`); process.exit(1); }
  planLinkFolder(claudeSkills, 'Claude Code');
}
if (existsSync(geminiConfig)) {
  if (isLink(geminiSkills)) {
    const t = linkTarget(geminiSkills);
    if (!t || (norm(t) !== norm(skillsRoot) && !inRepoSkills(t))) { console.error(`${geminiSkills} links to ${t}, not this repo; refusing`); process.exit(1); }
    actions.push({ kind: 'unlink', path: geminiSkills, from: t, note: 'Antigravity: unlink the whole skills/ folder' });
    actions.push({ kind: 'mkdir', path: geminiSkills, note: 'Antigravity: create skills folder' });
    for (const [name, dir] of want) actions.push({ kind: 'link', path: join(geminiSkills, name), to: dir, note: `Antigravity: add ${name}` });
  } else {
    if (!existsSync(geminiSkills)) actions.push({ kind: 'mkdir', path: geminiSkills, note: 'Antigravity: create skills folder' });
    planLinkFolder(geminiSkills, 'Antigravity');
  }
  if (existsSync(geminiJson)) {
    const txt = readFileSync(geminiJson, 'utf8');
    if (/"entries"/.test(txt) && txt.includes(skillsRoot.replace(/\\/g, '/').split('/').slice(-2).join('/')))
      actions.push({ kind: 'remove', path: geminiJson, content: txt, note: 'Antigravity: remove skills.json (old builder list of every skill folder)' });
    else notes.push(`${geminiJson} exists but is not the old builder's list; left as is`);
  }
}
for (const dir of commandDirs) {
  if (!existsSync(dir)) continue;
  let n = 0;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (!f.endsWith('.md') || isLink(p) || !statSync(p).isFile()) continue;
    const txt = readFileSync(p, 'utf8');
    if (STUB_SIGNATURE.test(txt)) { actions.push({ kind: 'remove', path: p, content: txt, quiet: true }); n++; }
  }
  if (n) actions.push({ kind: 'info', note: `${dir}: remove ${n} generated command stub(s); other commands kept` });
}

// ---------- check ----------
if (mode === 'check') {
  const pending = actions.filter((a) => a.kind !== 'info');
  for (const a of pending.filter((a) => !a.quiet).slice(0, 20)) console.log(`pending: ${a.note}`);
  const stubs = pending.filter((a) => a.quiet).length;
  if (stubs) console.log(`pending: ${stubs} generated command stub(s)`);
  for (const n of notes) console.log(`note: ${n}`);
  console.log(pending.length ? `install-core --check: ${pending.length} change(s) pending` : `install-core --check: ok (${want.size} Core skills installed)`);
  process.exit(pending.length ? 1 : 0);
}

// ---------- preview ----------
const group = (a) => (a.kind === 'link' || a.kind === 'unlink') && /: (add|remove|re-point) /.test(a.note) ? a.note.replace(/ [^ ]+$/, '') : a.note;
const counts = actions.reduce((m, a) => (a.kind === 'info' || a.quiet ? m : m.set(group(a), (m.get(group(a)) || 0) + 1)), new Map());
for (const [k, n] of counts) console.log(`${String(n).padStart(5)}  ${k}`);
for (const a of actions.filter((a) => a.kind === 'info')) console.log(`       ${a.note}`);
for (const n of notes) console.log(`note:  ${n}`);
if (mode === 'preview') { console.log(actions.length ? 'Preview only. Run with --apply to make these changes.' : 'Nothing to change.'); process.exit(0); }

// ---------- apply ----------
if (!actions.length) { console.log('Nothing to change.'); process.exit(0); }
const backupDir = join(home, '.curated-skills-backup');
mkdirSync(backupDir, { recursive: true });
const backupFile = join(backupDir, `install-core-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
writeFileSync(backupFile, JSON.stringify({ at: new Date().toISOString(), repo: repoRoot, actions }, null, 1));
console.log(`backup: ${backupFile}`);
for (const a of actions) {
  if (a.kind === 'unlink') { if (!isLink(a.path)) throw new Error(`not a link, refusing: ${a.path}`); unlinkLink(a.path); }
  else if (a.kind === 'mkdir') mkdirSync(a.path, { recursive: true });
  else if (a.kind === 'link') { if (exists(a.path)) throw new Error(`already exists, refusing: ${a.path}`); symlinkSync(a.to, a.path, 'junction'); }
  else if (a.kind === 'remove') unlinkSync(a.path);
}
console.log(`applied ${actions.filter((a) => a.kind !== 'info').length} change(s). Restore with: node scripts/install-core.mjs --restore "${backupFile}"`);

// A junction to a folder is removed with rmdir on Windows; unlink handles symlinks elsewhere.
function unlinkLink(p) { try { unlinkSync(p); } catch { rmdirSync(p); } }

function restore(file) {
  if (!file || !existsSync(file)) { console.error('--restore needs the backup file written by --apply'); process.exit(2); }
  const { actions } = JSON.parse(readFileSync(file, 'utf8'));
  for (const a of [...actions].reverse()) {
    if (a.kind === 'link' && isLink(a.path)) unlinkLink(a.path);
    else if (a.kind === 'mkdir' && existsSync(a.path) && !isLink(a.path) && !readdirSync(a.path).length) rmdirSync(a.path);
    else if (a.kind === 'unlink' && !exists(a.path)) symlinkSync(a.from, a.path, 'junction');
    else if (a.kind === 'remove' && !exists(a.path)) writeFileSync(a.path, a.content);
  }
  console.log(`restored from ${file}`);
}
