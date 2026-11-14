// pack-common.mjs: shared code for scripts/pack-skills.mjs, scripts/install-pack.mjs and scripts/validate-pack.mjs.
// Node built-ins only. It reads a pack's pack.json and noms-fr.json, builds one packaged copy of a skill (French folder
// name, normalised frontmatter, transforms), and offers the checks and the ZIP listing the three scripts share.
//
// Packaged copy of a skill (identical for every target):
//   - folder = French name from noms-fr.json; frontmatter `name` and `description` from noms-fr.json;
//   - frontmatter keeps only name, description, license, allowed-tools, metadata, compatibility (Agent Skills spec,
//     https://agentskills.io/specification); every other key moves into `metadata`, values as strings (the spec defines
//     metadata as a map of string to string); a YAML list in allowed-tools becomes a space-separated string;
//   - metadata gets `original-name` (the repo name) and `pack`;
//   - transforms from pack.json are applied; originals under skills/ are never written.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative, resolve, sep } from 'node:path';

export const repoRoot = resolve(import.meta.dirname, '..', '..');
export const ALLOWED_KEYS = ['name', 'description', 'license', 'allowed-tools', 'metadata', 'compatibility'];
export const NAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
export const TARGETS = ['claudeai', 'workspace', 'computer'];
const fwd = (p) => p.split(sep).join('/');

// ---------- pack loading ----------
export function loadPack(packName, root = repoRoot) {
  const packDir = join(root, 'packs', packName);
  const packFile = join(packDir, 'pack.json');
  const nomsFile = join(packDir, 'noms-fr.json');
  if (!existsSync(packFile)) throw new Error(`no pack.json at ${packFile}`);
  const pack = JSON.parse(readFileSync(packFile, 'utf8'));
  const noms = existsSync(nomsFile) ? JSON.parse(readFileSync(nomsFile, 'utf8')) : {};
  return { pack, noms, packDir, packFile, nomsFile };
}

export function gitCommit(root = repoRoot) {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
}

// ---------- frontmatter (the YAML subset SKILL.md files use) ----------
// Returns { data: Map(key -> value), body, hasFrontmatter }. Values: string, array of strings, plain object (one level),
// or null. Handles plain, quoted, folded/literal block scalars, multi-line plain scalars, flow and block lists, and one
// level of nested mapping (metadata).
export function parseFrontmatter(text) {
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!src.startsWith('---\n')) return { data: new Map(), body: src, hasFrontmatter: false };
  const end = src.indexOf('\n---', 3);
  if (end === -1) return { data: new Map(), body: src, hasFrontmatter: false };
  const fmText = src.slice(4, end);
  let bodyStart = end + 4;
  if (src[bodyStart] === '\n') bodyStart += 1;
  const body = src.slice(bodyStart);
  const lines = fmText.split('\n');
  const data = new Map();
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z0-9_][A-Za-z0-9_.-]*):(?:\s+(.*)|\s*)$/);
    if (!m) { i++; continue; }
    const key = m[1];
    const rest = (m[2] ?? '').trim();
    i++;
    // gather the indented continuation lines that belong to this key
    const block = [];
    while (i < lines.length && (lines[i] === '' || /^\s/.test(lines[i]))) { block.push(lines[i]); i++; }
    while (block.length && block[block.length - 1].trim() === '') block.pop();
    data.set(key, parseValue(rest, block));
  }
  return { data, body, hasFrontmatter: true };
}

function unquote(s) {
  const t = s.trim();
  if (t.startsWith('"') && t.endsWith('"') && t.length >= 2) {
    try { return JSON.parse(t); } catch { return t.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\'); }
  }
  if (t.startsWith("'") && t.endsWith("'") && t.length >= 2) return t.slice(1, -1).replace(/''/g, "'");
  return t;
}

function parseValue(rest, block) {
  if (/^[>|][-+]?$/.test(rest)) {
    const lines = block.map((l) => l.trim());
    if (rest.startsWith('|')) return lines.join('\n').trim();
    // folded: join lines with spaces, blank lines become newlines
    return lines.reduce((acc, l) => (l === '' ? acc + '\n' : acc + (acc && !acc.endsWith('\n') ? ' ' : '') + l), '').trim();
  }
  if (rest.startsWith('[') && rest.endsWith(']')) {
    return rest.slice(1, -1).split(',').map((s) => unquote(s)).filter((s) => s !== '');
  }
  if (rest === '') {
    const items = block.filter((l) => l.trim() !== '');
    if (!items.length) return null;
    if (items.every((l) => /^\s*-\s+/.test(l) || /^\s*-$/.test(l))) return items.map((l) => unquote(l.replace(/^\s*-\s*/, '')));
    const obj = {};
    for (const l of items) {
      const mm = l.match(/^\s+([A-Za-z0-9_][A-Za-z0-9_.-]*):\s*(.*)$/);
      if (mm) obj[mm[1]] = mm[2].trim() === '' ? '' : unquote(mm[2]);
    }
    return obj;
  }
  // plain or quoted scalar, possibly continued on indented lines
  if (block.length && !/^["']/.test(rest)) return [rest, ...block.map((l) => l.trim())].filter(Boolean).join(' ');
  return unquote(rest);
}

export function frontmatterKeys(text) { return [...parseFrontmatter(text).data.keys()]; }

const toStr = (v) => (v == null ? '' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v));

// Build the normalised frontmatter object for a packaged copy.
export function normaliseFrontmatter(data, { name, description, repoName, packName, changes }) {
  const out = { name, description };
  if (data.has('license') && data.get('license') != null) out.license = toStr(data.get('license'));
  if (data.has('compatibility') && data.get('compatibility')) out.compatibility = toStr(data.get('compatibility'));
  if (data.has('allowed-tools') && data.get('allowed-tools') != null) {
    const v = data.get('allowed-tools');
    out['allowed-tools'] = Array.isArray(v) ? v.join(' ') : toStr(v);
  }
  const metadata = {};
  const existing = data.get('metadata');
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    for (const [k, v] of Object.entries(existing)) if (toStr(v) !== '') metadata[k] = toStr(v);
  } else if (existing != null && toStr(existing) !== '') metadata['metadata'] = toStr(existing);
  for (const [k, v] of data) {
    if (ALLOWED_KEYS.includes(k)) continue;
    const s = toStr(v);
    if (s === '') continue;
    metadata[k in metadata ? `original-${k}` : k] = s;
  }
  metadata['original-name'] = repoName;
  metadata.pack = packName;
  // A visible change notice in every packaged copy (Apache-2.0 §4(b) asks modified files to say they were changed).
  if (changes) metadata['pack-changes'] = changes;
  out.metadata = metadata;
  return out;
}

const q = (s) => JSON.stringify(String(s)); // a JSON string is a valid YAML double-quoted scalar

export function emitFrontmatter(fm) {
  const lines = ['---', `name: ${fm.name}`, `description: ${q(fm.description)}`];
  if (fm.license !== undefined) lines.push(`license: ${q(fm.license)}`);
  if (fm.compatibility !== undefined) lines.push(`compatibility: ${q(fm.compatibility)}`);
  if (fm['allowed-tools'] !== undefined) lines.push(`allowed-tools: ${q(fm['allowed-tools'])}`);
  const meta = Object.entries(fm.metadata || {});
  if (meta.length) {
    lines.push('metadata:');
    for (const [k, v] of meta) lines.push(`  ${/^[A-Za-z0-9_-]+$/.test(k) ? k : q(k)}: ${q(v)}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

// ---------- markdown helpers ----------
// Lines inside fenced code blocks are ignored by link checks and section removal.
function fenceMask(lines) {
  const mask = [];
  let fence = null;
  for (const l of lines) {
    const m = l.match(/^\s*(```+|~~~+)/);
    if (fence) { mask.push(true); if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null; continue; }
    if (m) { fence = m[1]; mask.push(true); continue; }
    mask.push(false);
  }
  return mask;
}

// Remove a section: the heading line that matches exactly (trimmed) and everything up to the next heading of the
// same or a higher level outside code fences. Returns { text, removed }.
export function removeSection(text, heading) {
  const lines = text.split('\n');
  const mask = fenceMask(lines);
  const level = (heading.match(/^#+/) || [''])[0].length;
  const start = lines.findIndex((l, i) => !mask[i] && l.trim() === heading.trim());
  if (start === -1 || !level) return { text, removed: false };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = !mask[i] && lines[i].match(/^(#+)\s/);
    if (m && m[1].length <= level) { end = i; break; }
  }
  // also drop a horizontal rule that only separated the removed section from the previous one
  let s = start;
  while (s > 0 && lines[s - 1].trim() === '') s--;
  if (s > 0 && /^-{3,}\s*$/.test(lines[s - 1]) && end === lines.length) s--;
  const out = [...lines.slice(0, s), ...lines.slice(end)];
  return { text: out.join('\n').replace(/\n{3,}$/, '\n\n').replace(/\s*$/, '\n'), removed: true };
}

// Relative markdown links ([text](path) and reference definitions), outside code fences and inline code.
export function relativeLinks(text) {
  const lines = text.split('\n');
  const mask = fenceMask(lines);
  const out = [];
  lines.forEach((line, i) => {
    if (mask[i]) return;
    const l = line.replace(/`[^`]*`/g, '');
    for (const m of l.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) out.push({ target: m[1], line: i + 1 });
    const ref = l.match(/^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)/);
    if (ref) out.push({ target: ref[1], line: i + 1 });
  });
  return out.filter(({ target }) => !/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target) && !target.startsWith('/'));
}

export function stripLink(text, target) {
  let n = 0;
  const esc = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(!?)\\[([^\\]]*)\\]\\(\\s*<?${esc}>?(?:\\s+"[^"]*")?\\s*\\)`, 'g');
  const outText = text.replace(re, (_, bang, label) => { n++; return bang ? '' : label; });
  return { text: outText, count: n };
}

// ---------- files ----------
export function walkFiles(dir) {
  const out = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p); else out.push(p);
    }
  })(dir);
  return out;
}

function isExcluded(rel, patterns) {
  const r = fwd(rel);
  return patterns.some((p) => (p.endsWith('/') ? r === p.slice(0, -1) || r.startsWith(p) : r === p));
}

// ---------- build one packaged skill ----------
// entry: one item of pack.json `skills`. Returns { nom, dir, files, bytes, notes }.
export function buildSkill({ entry, noms, pack, destParent, root = repoRoot }) {
  const map = noms[entry.name];
  if (!map || !map.nom) throw new Error(`no French name for ${entry.name}`);
  const src = join(root, entry.source);
  const srcSkill = join(src, 'SKILL.md');
  if (!existsSync(srcSkill)) throw new Error(`source has no SKILL.md: ${entry.source}`);
  const dest = join(destParent, map.nom);
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  const transforms = entry.transforms || [];
  const exclude = [...(pack.defaults?.exclude || []), ...transforms.filter((t) => t.type === 'exclude').flatMap((t) => t.paths)];
  for (const file of walkFiles(src)) {
    const rel = relative(src, file);
    if (isExcluded(rel, exclude) || fwd(rel).split('/').some((seg) => seg === '.git')) continue;
    mkdirSync(dirname(join(dest, rel)), { recursive: true });
    cpSync(file, join(dest, rel));
  }
  const notes = [];
  // SKILL.md: frontmatter + transforms on the body
  const { data, body } = parseFrontmatter(readFileSync(srcSkill, 'utf8'));
  let newBody = body;
  for (const t of transforms) {
    if (t.type === 'remove-section') {
      const r = removeSection(newBody, t.heading);
      if (!r.removed) throw new Error(`${entry.name}: section not found for remove-section: ${t.heading}`);
      newBody = r.text; notes.push(`removed section "${t.heading}"`);
    }
  }
  const changes = ['packaged copy: name and description replaced by the French ones in noms-fr.json', 'other frontmatter keys moved into metadata'];
  for (const t of transforms) {
    if (t.type === 'remove-section') changes.push(`section "${t.heading.replace(/^#+\s*/, '')}" removed`);
    else if (t.type === 'strip-link') changes.push(`dead link ${t.target} reduced to its text`);
  }
  for (const p of exclude) if (existsSync(join(src, p))) changes.push(`${p} left out`);
  const fm = normaliseFrontmatter(data, { name: map.nom, description: map.description, repoName: entry.name, packName: pack.pack, changes: changes.join('; ') });
  writeFileSync(join(dest, 'SKILL.md'), emitFrontmatter(fm) + newBody, 'utf8');
  // strip-link applies to every markdown file of the packaged copy
  for (const t of transforms.filter((x) => x.type === 'strip-link')) {
    let total = 0;
    for (const f of walkFiles(dest).filter((p) => p.endsWith('.md'))) {
      const r = stripLink(readFileSync(f, 'utf8'), t.target);
      if (r.count) { writeFileSync(f, r.text, 'utf8'); total += r.count; }
    }
    if (!total) throw new Error(`${entry.name}: no link to strip for target ${t.target}`);
    notes.push(`stripped ${total} link(s) to ${t.target}`);
  }
  const files = walkFiles(dest);
  const bytes = files.reduce((s, f) => s + statSync(f).size, 0);
  return { nom: map.nom, dir: dest, files: files.length, bytes, notes };
}

// ---------- ZIP ----------
// The system tar writes the archive. On Windows the built-in bsdtar (%SystemRoot%\System32\tar.exe, Windows 10+) is
// called by full path, because Git Bash puts GNU tar (no ZIP support) first on PATH. Elsewhere: `zip` if present,
// then bsdtar (`tar -a`, macOS), then Python's zipfile module.
export function zipFolder(parentDir, folderName, zipPath) {
  mkdirSync(dirname(zipPath), { recursive: true });
  if (existsSync(zipPath)) rmSync(zipPath);
  const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  if (process.platform === 'win32') {
    const bsdtar = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
    run(bsdtar, ['-a', '-c', '-f', zipPath, '-C', parentDir, folderName]);
    return 'bsdtar';
  }
  const has = (cmd) => { try { execFileSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' }); return true; } catch { return false; } };
  if (has('zip')) { run('zip', ['-r', '-q', '-X', zipPath, folderName], parentDir); return 'zip'; }
  if (has('bsdtar')) { run('bsdtar', ['-a', '-c', '-f', zipPath, '-C', parentDir, folderName]); return 'bsdtar'; }
  if (process.platform === 'darwin') { run('tar', ['-a', '-c', '-f', zipPath, '-C', parentDir, folderName]); return 'tar'; }
  for (const py of ['python3', 'python']) if (has(py)) { run(py, ['-m', 'zipfile', '-c', zipPath, folderName], parentDir); return py; }
  throw new Error('no ZIP tool found: install zip (or bsdtar, or Python 3)');
}

// List the entry names of a ZIP file by reading its central directory (no extraction, Node built-ins only).
export function listZip(zipPath) {
  const buf = readFileSync(zipPath);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd === -1) throw new Error(`not a ZIP file: ${zipPath}`);
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const names = [];
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error(`bad central directory in ${zipPath}`);
    const nameLen = buf.readUInt16LE(p + 28), extraLen = buf.readUInt16LE(p + 30), commentLen = buf.readUInt16LE(p + 32);
    names.push(buf.toString('utf8', p + 46, p + 46 + nameLen).replace(/\\/g, '/'));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return names;
}

// ---------- checks on a packaged skill folder ----------
export function checkPackagedSkill(dir, { sizeLimits = false } = {}) {
  const problems = [];
  const folder = dir.split(sep).pop();
  const skillFile = join(dir, 'SKILL.md');
  if (!existsSync(skillFile)) return [`${folder}: no SKILL.md`];
  const text = readFileSync(skillFile, 'utf8');
  const { data, hasFrontmatter } = parseFrontmatter(text);
  if (!hasFrontmatter) problems.push(`${folder}: no frontmatter`);
  for (const k of data.keys()) if (!ALLOWED_KEYS.includes(k)) problems.push(`${folder}: frontmatter key not allowed: ${k}`);
  const name = data.get('name');
  if (typeof name !== 'string' || !NAME_RE.test(name)) problems.push(`${folder}: name "${name}" does not match ${NAME_RE}`);
  else if (name.includes('--')) problems.push(`${folder}: name "${name}" has consecutive hyphens`);
  if (name !== folder) problems.push(`${folder}: folder name differs from frontmatter name "${name}"`);
  const desc = data.get('description');
  if (typeof desc !== 'string' || desc.length < 1 || desc.length > 1024) problems.push(`${folder}: description must be 1-1024 characters (has ${typeof desc === 'string' ? desc.length : 'none'})`);
  else if (/[<>]/.test(desc)) problems.push(`${folder}: description contains < or >`);
  const meta = data.get('metadata');
  if (meta != null && (typeof meta !== 'object' || Array.isArray(meta))) problems.push(`${folder}: metadata is not a mapping`);
  const comp = data.get('compatibility');
  if (comp != null && (typeof comp !== 'string' || comp.length > 500)) problems.push(`${folder}: compatibility must be a string of at most 500 characters`);
  const at = data.get('allowed-tools');
  if (at != null && typeof at !== 'string') problems.push(`${folder}: allowed-tools must be a space-separated string`);
  const files = walkFiles(dir);
  for (const f of files.filter((p) => p.toLowerCase().endsWith('.md'))) {
    const t = readFileSync(f, 'utf8');
    for (const { target, line } of relativeLinks(t)) {
      let decoded = target;
      try { decoded = decodeURIComponent(target); } catch { /* keep raw */ }
      const resolved = resolve(dirname(f), decoded.split('#')[0]);
      if (!existsSync(resolved)) problems.push(`${folder}: dead link ${target} in ${fwd(relative(dir, f))}:${line}`);
      else if (!fwd(resolved).startsWith(fwd(dir) + '/') && fwd(resolved) !== fwd(dir)) problems.push(`${folder}: link leaves the skill folder: ${target} in ${fwd(relative(dir, f))}:${line}`);
    }
  }
  if (sizeLimits) {
    const bytes = files.reduce((s, f) => s + statSync(f).size, 0);
    if (files.length > 20) problems.push(`${folder}: ${files.length} files (limit 20)`);
    if (bytes > 2 * 1024 * 1024) problems.push(`${folder}: ${bytes} bytes (limit 2 MB)`);
  }
  return problems;
}

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { args[key] = next; i++; } else args[key] = true;
    } else args._.push(a);
  }
  return args;
}
