#!/usr/bin/env node
// hygiene.mjs — deterministic checks the fetched scanners do not claim to cover: hidden unicode, encoded or
// high-entropy blobs, binaries whose bytes do not match their extension, oversize files, duplicates, symlinks,
// pipe-to-shell and download-and-run patterns, and a few prompt-injection phrasings. Pattern matching only:
// a finding is a lead for review, not a verdict. Plan: docs/plans/skill-security-scan.md (S2).
//
// Usage:
//   node scripts/scan/hygiene.mjs [repo]              # git-tracked files under <repo>/skills (default: this repo)
//   node scripts/scan/hygiene.mjs --dir <folder>      # every file under a folder (fixtures, no git)
//   --out <file>   write JSON there (default: stdout)
//   --fail-on <low|medium|high>   exit 1 if any finding is at or above that severity
// Exit: 0 ok, 1 --fail-on threshold reached, 2 bad arguments.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i === -1 ? undefined : args[i + 1]; };
const dirMode = opt('--dir');
const root = resolve(dirMode ?? args.find((a) => !a.startsWith('--') && a !== opt('--out') && a !== opt('--fail-on')) ?? join(import.meta.dirname, '..', '..'));
const failOn = opt('--fail-on');
const RANK = { low: 1, medium: 2, high: 3 };
if (failOn && !RANK[failOn]) { console.error('--fail-on takes low, medium or high'); process.exit(2); }

// ---------- file list ----------
let files;   // [{ rel, mode }]
if (dirMode) {
  files = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push({ rel: relative(root, p).split(sep).join('/'), mode: lstatSync(p).isSymbolicLink() ? '120000' : '100644' });
    }
  })(root);
} else {
  files = execFileSync('git', ['ls-files', '-s', '-z', '--', 'skills'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 })
    .split('\0').filter(Boolean)
    .map((l) => { const [meta, rel] = l.split('\t'); return { rel, mode: meta.split(' ')[0] }; })
    .filter((f) => !f.rel.startsWith('skills/_index/'));
}
const skillOf = (rel) => {
  if (dirMode) return rel.split('/')[0];
  const parts = rel.split('/');
  for (let i = parts.length - 1; i > 0; i--) if (files.some((f) => f.rel === parts.slice(0, i).join('/') + '/SKILL.md')) return parts.slice(0, i).join('/');
  return parts.slice(0, -1).join('/');
};
const skillDirs = new Map();   // rel -> skill folder, computed once
for (const f of files) skillDirs.set(f.rel, skillOf(f.rel));

// ---------- rules ----------
const INVISIBLE = /[­​-‏‪-‮⁠-⁤⁦-⁩﻿]|\uDB40[\uDC00-\uDC7F]/g;
const TEXT_RULES = [
  { rule: 'pipe-to-shell', severity: 'high', re: /\b(curl|wget)\b[^\n|]{0,200}\|\s*(sudo\s+)?(ba|z|da)?sh\b/i },
  { rule: 'pipe-to-shell', severity: 'high', re: /\b(iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^\n|]{0,200}\|\s*(iex|Invoke-Expression)\b/i },
  { rule: 'decode-and-run', severity: 'high', re: /\b(base64\s+(-d|--decode)|FromBase64String|b64decode|atob)\b[^\n]{0,120}(\|\s*(ba)?sh\b|\beval\b|\bexec\b|Invoke-Expression|\biex\b)/i },
  { rule: 'decode-and-run', severity: 'high', re: /\b(eval|exec)\s*\(\s*(base64|codecs|zlib|marshal|bytes\.fromhex|atob|Buffer\.from)/i },
  { rule: 'reverse-shell', severity: 'high', re: /(\/dev\/tcp\/\d|nc(at)?\s+(-e|-c)\s|bash\s+-i\s+>&|socket\.socket\([^)]*\)[\s\S]{0,200}subprocess)/i },
  { rule: 'injection-phrase', severity: 'medium', re: /\b(ignore|disregard|forget)\s+(all\s+|any\s+)?(previous|prior|above|earlier|system)\s+(instructions|prompts?|rules)\b/i },
  { rule: 'injection-phrase', severity: 'medium', re: /\b(do\s+not|don'?t|never)\s+(tell|inform|notify|mention\s+(this\s+)?to)\s+the\s+user\b|\bwithout\s+(telling|informing|asking)\s+the\s+user\b/i },
  { rule: 'secret-path-read', severity: 'medium', re: /(~|\$HOME|%USERPROFILE%)[\\/]\.(ssh|aws|gnupg|docker|kube)[\\/]|\bid_(rsa|ed25519)\b|\.git-credentials\b/i },
  { rule: 'run-at-install', severity: 'medium', re: /"(pre|post)install"\s*:/ },
];
const CODE_EXT = /\.(py|js|mjs|cjs|ts|sh|bash|ps1|psm1|bat|cmd|rb|go|rs|php|pl|lua)$/i;
const NETWORK = /\b(curl|wget|Invoke-WebRequest|iwr|irm|requests\.(get|post)|urllib|http\.client|fetch\(|axios|https?\.request|socket\.)/;
const EXEC = /\b(eval\(|exec\(|subprocess|child_process|os\.system|os\.popen|Invoke-Expression|\biex\b|spawn\(|execSync|ShellExecute)/;
const MEDIA_EXT = /\.(png|jpe?g|gif|webp|ico|bmp|tiff?|ttf|otf|woff2?|eot|mp3|mp4|wav|ogg|webm|mov|pdf)$/i;
const MAGIC = [
  ['executable (PE)', (b) => b[0] === 0x4d && b[1] === 0x5a],
  ['executable (ELF)', (b) => b[0] === 0x7f && b[1] === 0x45 && b[2] === 0x4c && b[3] === 0x46],
  ['executable (Mach-O)', (b) => [0xfeedface, 0xfeedfacf, 0xcefaedfe, 0xcffaedfe].includes(b.readUInt32BE(0))],
  ['archive (zip)', (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04],
  ['archive (gzip)', (b) => b[0] === 0x1f && b[1] === 0x8b],
  ['archive (7z)', (b) => b.subarray(0, 6).equals(Buffer.from([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]))],
  ['python bytecode', (b) => b[2] === 0x0d && b[3] === 0x0a && b.readUInt32LE(4) <= 3],   // magic word + CRLF, then flags 0..3
];
const IMAGE_MAGIC = (b) => (b[0] === 0x89 && b[1] === 0x50) || (b[0] === 0xff && b[1] === 0xd8) || b.subarray(0, 4).toString() === 'GIF8'
  || b.subarray(8, 12).toString() === 'WEBP' || (b[0] === 0 && b[1] === 0 && (b[2] === 1 || b[2] === 2) && b[3] === 0);

const entropy = (s) => { const m = new Map(); for (const c of s) m.set(c, (m.get(c) || 0) + 1); let h = 0; for (const n of m.values()) { const p = n / s.length; h -= p * Math.log2(p); } return h; };
const mask = (s) => (s.length > 12 ? `${s.slice(0, 6)}…(${s.length} chars)` : s);
const show = (s) => s.replace(INVISIBLE, (c) => `\\u{${c.codePointAt(0).toString(16)}}`).replace(/\s+/g, ' ').trim().slice(0, 200);

// ---------- scan ----------
const findings = [];
const add = (rel, line, rule, severity, excerpt) => findings.push({ skill: skillDirs.get(rel), file: rel, line, rule, severity, excerpt });
const hashes = new Map();
let bytes = 0;

for (const { rel, mode } of files) {
  if (mode === '120000') { add(rel, 0, 'symlink', 'high', 'git symlink: target is resolved on checkout'); continue; }
  let b;
  try { b = readFileSync(join(root, rel)); } catch { add(rel, 0, 'unreadable', 'low', 'file listed but not readable'); continue; }
  bytes += b.length;
  const h = createHash('sha1').update(b).digest('hex');
  hashes.set(h, [...(hashes.get(h) || []), rel]);
  if (b.length > 500_000) add(rel, 0, 'oversize', 'low', `${(b.length / 1e6).toFixed(1)} MB`);

  const isBinary = b.subarray(0, 8000).includes(0);
  if (isBinary || MEDIA_EXT.test(rel)) {
    const kind = b.length >= 8 ? MAGIC.find(([, t]) => t(b))?.[0] : undefined;
    if (kind) add(rel, 0, 'binary-payload', kind.startsWith('executable') ? 'high' : 'medium', `${kind} in ${extname(rel) || 'no extension'}`);
    else if (/\.(png|jpe?g|gif|webp|ico)$/i.test(rel) && !IMAGE_MAGIC(b)) add(rel, 0, 'extension-mismatch', 'medium', 'image extension, bytes are not an image');
    else if (isBinary && !MEDIA_EXT.test(rel)) add(rel, 0, 'unknown-binary', 'medium', `binary ${extname(rel) || 'no extension'}, ${b.length} bytes`);
    continue;
  }

  if (b.includes(0)) add(rel, 0, 'nul-byte', 'medium', `${b.filter((x) => x === 0).length} NUL byte(s) in a text file, first at offset ${b.indexOf(0)}`);
  const text = b.toString('utf8');
  if (/\/usr\/bin\/(ba)?sh/.test(text) && /\bR\\?\/usr\/bin|\$\/usr\/bin/.test(text)) add(rel, 0, 'shell-expansion-damage', 'low', 'a "$0" in the source text was expanded to a shell path when the file was written');
  const lines = text.split(/\r?\n/);
  const code = CODE_EXT.test(rel);
  let net = 0, ex = 0;
  lines.forEach((ln, i) => {
    const n = i + 1;
    const inv = ln.match(INVISIBLE);
    if (inv && !(n === 1 && inv.length === 1 && ln.startsWith('﻿'))) {
      const tag = /\uDB40/.test(ln);
      const bidi = /[‪-‮⁦-⁩]/.test(ln);
      add(rel, n, tag ? 'hidden-tag-chars' : bidi ? 'bidi-control' : 'zero-width', tag || bidi ? 'high' : 'medium', show(ln));
    }
    for (const r of TEXT_RULES) if (r.re.test(ln)) add(rel, n, r.rule, r.severity, show(ln));
    for (const m of ln.matchAll(/[A-Za-z0-9+/]{200,}={0,2}/g)) add(rel, n, 'base64-blob', 'medium', mask(m[0]));
    for (const m of ln.matchAll(/\b[0-9a-fA-F]{128,}\b/g)) add(rel, n, 'hex-blob', 'low', mask(m[0]));
    for (const m of ln.matchAll(/[A-Za-z0-9+/=_-]{40,}/g)) if (m[0].length < 200 && entropy(m[0]) > 4.8) add(rel, n, 'high-entropy', 'low', mask(m[0]));
    if (code) { if (NETWORK.test(ln)) net++; if (EXEC.test(ln)) ex++; }
  });
  if (code && net && ex) add(rel, 0, 'network-and-exec', 'low', `${net} network line(s), ${ex} exec line(s): read before running`);
  if (/(^|\/)SKILL\.md$/.test(rel)) {
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const tools = fm?.[1].match(/^allowed-tools:\s*(.*)$/m)?.[1] ?? '';
    if (/(^|[\s,\[])(\*|Bash)(\s*$|[\s,\]])/.test(tools)) add(rel, 0, 'broad-allowed-tools', 'low', `allowed-tools: ${tools.slice(0, 120)}`);
  }
}
for (const group of hashes.values()) {
  if (group.length < 2) continue;
  const skills = new Set(group.map((r) => skillDirs.get(r)));
  for (const rel of group.slice(1)) add(rel, 0, 'duplicate', 'low', `same bytes as ${group[0]}${skills.size > 1 ? ' (other skill)' : ''}`);
}

// ---------- report ----------
const bySkill = {};
for (const f of findings) { const s = (bySkill[f.skill] ||= { high: 0, medium: 0, low: 0 }); s[f.severity]++; }
const commit = dirMode ? null : execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const report = {
  tool: 'hygiene.mjs', root, commit,
  scanned: { files: files.length, skills: new Set(skillDirs.values()).size, bytes },
  totals: { high: findings.filter((f) => f.severity === 'high').length, medium: findings.filter((f) => f.severity === 'medium').length, low: findings.filter((f) => f.severity === 'low').length },
  bySkill, findings,
};
const out = JSON.stringify(report, null, 1);
if (opt('--out')) { writeFileSync(opt('--out'), out); console.log(`hygiene: ${report.scanned.files} files, ${report.scanned.skills} skills; high ${report.totals.high}, medium ${report.totals.medium}, low ${report.totals.low} -> ${opt('--out')}`); }
else console.log(out);
if (failOn && findings.some((f) => RANK[f.severity] >= RANK[failOn])) process.exit(1);
