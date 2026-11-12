#!/usr/bin/env node
// verifier-secrets.mjs: the workspace's secret and customer-contact scanner.
// Shared by .githooks/pre-commit (--staged) and outils/sauvegarde.mjs (--staged --chemins-stdin).
//
// Rules:
//   everywhere      provider key prefixes, private key blocks, a secret written after a label
//                   (password, token, key...), long high-entropy tokens
//   memoire/ only   email addresses, North American phone numbers, Canadian postal codes, civic addresses
//                   (customer identity never goes in memory). memoire/.autorises lists the business's own
//                   contact lines, which are allowed.
//
// Usage:
//   node outils/verifier-secrets.mjs --staged                  scan the staged version of every staged file
//   node outils/verifier-secrets.mjs --staged --chemins-stdin  same, limited to the NUL-separated paths on stdin
//                                                              (paths relative to the git top level)
//   node outils/verifier-secrets.mjs <fichier> [...]           scan files on disk
// Output: one line per finding, file:line and the rule; the matched value is never printed.
// Exit: 0 clean, 1 findings, 2 usage or git error. Node built-ins only.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BYTES = 5 * 1024 * 1024;
const fwd = (p) => p.replace(/\\/g, '/');
const real = (p) => { try { return realpathSync.native(p); } catch { return p; } };

const hasDigit = (v) => /\d/.test(v);
const hasLetter = (v) => /[A-Za-z]/.test(v);
const isPlaceholder = (v) => /^(?:\[.*\]|<.*>|\$\{.*\}|\{\{.*\}\}|x{6,}|\*{3,}|process\.env\..*|env\..*|your.*|votre.*)$/i.test(v)
  || /(?:\.\.\.|…|REMPLIR|EXAMPLE|EXEMPLE|PLACEHOLDER|CHANGEME|VOTRE[_-]?CLE|YOUR[_-]?KEY)/i.test(v);

// Rules applied to every scanned file. `check` filters out obvious non-secrets.
const KEY_RULES = [
  { id: 'cle-privee', label: 'bloc de clé privée', re: /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/g },
  { id: 'cle-fournisseur', label: 'clé Stripe', re: /\b[rs]k_(?:live|test)_[A-Za-z0-9]{16,}/g, check: hasDigit },
  { id: 'cle-fournisseur', label: 'clé au préfixe « sk- »', re: /\bsk-[A-Za-z0-9_-]{20,}/g, check: (v) => hasDigit(v) && !isPlaceholder(v) },
  { id: 'cle-fournisseur', label: 'clé Brevo', re: /\bx(?:keysib|smtpsib)-[A-Za-z0-9-]{20,}/g, check: hasDigit },
  { id: 'cle-fournisseur', label: 'clé AWS', re: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { id: 'cle-fournisseur', label: 'jeton GitHub', re: /\bgh[pousr]_[A-Za-z0-9]{30,}/g },
  { id: 'cle-fournisseur', label: 'jeton GitHub', re: /\bgithub_pat_[A-Za-z0-9_]{22,}/g },
  { id: 'cle-fournisseur', label: 'jeton Slack', re: /\bxox[abposr]-[A-Za-z0-9-]{10,}/g, check: hasDigit },
  { id: 'cle-fournisseur', label: 'clé Google', re: /\bAIza[0-9A-Za-z_-]{35}/g },
  { id: 'cle-fournisseur', label: 'jeton Meta', re: /\bEAA[A-Za-z0-9]{30,}/g, check: hasDigit },
  { id: 'cle-fournisseur', label: 'clé SendGrid', re: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g },
  {
    id: 'secret-assigne',
    label: 'valeur écrite après « mot de passe », « token », « clé »…',
    re: /(?<![A-Za-z])(?:api[_ -]?key|apikey|secret|token|password|passwd|pwd|mot[_ -]de[_ -]passe|cl[eé][_ -]api|cl[eé] secr[eè]te|jeton)[A-Za-z_ -]{0,20}?["']?\s*[:=]\s*["']?([^\s"'`<>()]{12,})/gi,
    group: 1,
    check: (v) => hasDigit(v) && hasLetter(v) && !isPlaceholder(v) && !looksLikeIdentifier(v),
  },
];

// Long random-looking tokens (keys pasted without a label). URLs and data URIs are removed first so links
// to documents (long ids in a URL path) are not flagged; provider rules above still see the whole line.
const TOKEN_RE = /[A-Za-z0-9+/_-]{32,}={0,2}/g;
// Identifiers such as Campaign_Name-FreeTrial_2024Q1: three or more short parts joined by _ or -.
const looksLikeIdentifier = (v) => {
  const parts = v.split(/[_-]+/).filter(Boolean);
  return parts.length >= 3 && Math.max(...parts.map((p) => p.length)) < 16;
};
// Paths such as owner/repo-name or /r/Forum/comments/abc123/a_long_title: every segment short or an identifier.
const looksLikePath = (v) => v.includes('/')
  && v.split('/').filter(Boolean).every((seg) => seg.length < 16 || looksLikeIdentifier(seg));
function entropy(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
  let e = 0;
  for (const n of counts.values()) {
    const p = n / s.length;
    e -= p * Math.log2(p);
  }
  return e;
}
function highEntropyFindings(line) {
  const out = [];
  const cleaned = line
    .replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s)>\]"'`]+/gi, (m) => ' '.repeat(m.length))
    .replace(/\bdata:[^\s)"'`]+/gi, (m) => ' '.repeat(m.length));
  for (const m of cleaned.matchAll(TOKEN_RE)) {
    const v = m[0];
    const after = cleaned.slice(m.index + v.length);
    if (/^[0-9a-fA-F-]+$/.test(v)) continue; // hashes, commit ids, UUIDs
    if (/^\.[A-Za-z0-9]{1,5}\b/.test(after)) continue; // a file name such as <long id>.mp4
    if (!(/[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v))) continue;
    if (looksLikeIdentifier(v) || looksLikePath(v)) continue;
    if ((v.match(/[a-z]{4,}/g) || []).length >= 3) continue; // CamelCaseWordsJoinedTogether
    if (entropy(v) < 4.2) continue;
    out.push({ id: 'jeton-aleatoire', label: 'longue chaîne aléatoire (clé ou jeton probable)', value: v });
  }
  return out;
}

// Rules applied in memoire/ only.
const CONTACT_RULES = [
  { id: 'courriel', label: 'adresse courriel', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g },
  { id: 'telephone', label: 'numéro de téléphone', re: /(?<![\d-])(?:\+?1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]?[2-9]\d{2}[\s.-]?\d{4}(?![\d-])/g },
  { id: 'code-postal', label: 'code postal', re: /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/gi },
  {
    id: 'adresse',
    label: 'adresse civique',
    re: /\b\d{1,6}[A-Za-z]?,?\s+(?:rue|avenue|av\.|boulevard|boul\.|chemin|ch\.|rang|route|mont[ée]e|place|croissant|impasse|all[ée]e|street|st\.|road|rd\.|drive|lane)\s+[A-Za-zÀ-ÿ0-9]/gi,
  },
];

const norm = (s) => {
  let v = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  if (/^1\d{10}$/.test(v)) v = v.slice(1);
  return v;
};

function loadAllowlist() {
  const file = join(ROOT, 'memoire', '.autorises');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map(norm)
    .filter((v) => v.length >= 4);
}

function allowed(value, allowlist) {
  const v = norm(value);
  if (v.length < 4) return false;
  return allowlist.some((a) => a === v || (v.length >= 6 && a.includes(v)) || (a.length >= 6 && v.includes(a)));
}

/** Scans one text. `rel` is the path relative to the workspace root (forward slashes). */
function scanText(rel, text, allowlist) {
  const findings = [];
  const inMemory = rel.startsWith('memoire/') && !rel.endsWith('/.autorises') && rel !== 'memoire/.autorises';
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (!line) return;
    for (const rule of KEY_RULES) {
      for (const m of line.matchAll(rule.re)) {
        const v = rule.group ? m[rule.group] : m[0];
        if (rule.check && !rule.check(v)) continue;
        findings.push({ file: rel, line: i + 1, id: rule.id, label: rule.label, length: v.length });
      }
    }
    for (const f of highEntropyFindings(line)) {
      if (findings.some((x) => x.line === i + 1 && x.file === rel)) break;
      findings.push({ file: rel, line: i + 1, id: f.id, label: f.label, length: f.value.length });
    }
    if (inMemory) {
      for (const rule of CONTACT_RULES) {
        for (const m of line.matchAll(rule.re)) {
          if (allowed(m[0], allowlist)) continue;
          findings.push({ file: rel, line: i + 1, id: rule.id, label: rule.label, length: m[0].length, contact: true });
        }
      }
    }
  });
  return findings;
}

const isBinary = (buf) => buf.subarray(0, 8192).includes(0);

function git(args, opts = {}) {
  return spawnSync('git', args, { cwd: ROOT, windowsHide: true, maxBuffer: 1024 * 1024 * 1024, ...opts });
}

/** Returns [{ rel, text }] for the staged blobs, `rel` relative to the workspace root. */
function stagedFiles(onlyPaths) {
  const top = git(['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (top.status !== 0) throw new Error('pas un dépôt Git');
  const topDir = top.stdout.trim();
  const prefix = fwd(relative(real(topDir), real(ROOT)));
  const list = git(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], { cwd: topDir, encoding: 'utf8' });
  if (list.status !== 0) throw new Error('git diff a échoué');
  let paths = list.stdout.split('\0').filter(Boolean);
  if (onlyPaths) {
    const wanted = new Set(onlyPaths);
    paths = paths.filter((p) => wanted.has(p));
  }
  paths = paths.filter((p) => !p.includes('\n'));
  if (!paths.length) return [];
  const batch = git(['cat-file', '--batch'], { cwd: topDir, input: paths.map((p) => `:${p}`).join('\n') + '\n' });
  if (batch.status !== 0) throw new Error('git cat-file a échoué');
  const out = [];
  const buf = batch.stdout;
  let pos = 0;
  for (const p of paths) {
    const nl = buf.indexOf(10, pos);
    if (nl === -1) break;
    const header = buf.subarray(pos, nl).toString('utf8');
    pos = nl + 1;
    const m = header.match(/^\S+ (\S+) (\d+)$/);
    if (!m) continue; // "missing"
    const size = Number(m[2]);
    const content = buf.subarray(pos, pos + size);
    pos += size + 1;
    if (m[1] !== 'blob' || size > MAX_BYTES || isBinary(content)) continue;
    const rel = prefix && !prefix.startsWith('..') ? (p.startsWith(prefix + '/') ? p.slice(prefix.length + 1) : `../${p}`) : p;
    out.push({ rel: fwd(rel), shown: p, text: content.toString('utf8') });
  }
  return out;
}

function diskFiles(args) {
  const out = [];
  for (const a of args) {
    const abs = resolve(a);
    if (!existsSync(abs) || !statSync(abs).isFile() || statSync(abs).size > MAX_BYTES) continue;
    const buf = readFileSync(abs);
    if (isBinary(buf)) continue;
    out.push({ rel: fwd(relative(real(ROOT), real(abs))), shown: fwd(a), text: buf.toString('utf8') });
  }
  return out;
}

function report(findings) {
  const n = findings.length;
  console.log(`Vérification des secrets : ${n} problème${n > 1 ? 's' : ''} trouvé${n > 1 ? 's' : ''}. Rien n'a été enregistré.`);
  for (const f of findings) {
    console.log(`- ${f.shown}:${f.line} : ${f.label} [${f.id}, valeur masquée, ${f.length} caractères]`);
  }
  console.log('Retirez ces valeurs, puis réessayez. Un client se nomme par son numéro de dossier ; une clé va dans un coffre de secrets, jamais dans un fichier.');
  if (findings.some((f) => f.contact)) {
    console.log("S'il s'agit d'une coordonnée de l'entreprise elle-même, ajoutez-la à memoire/.autorises.");
  }
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help') || args.includes('-h')) {
    console.error('usage : node outils/verifier-secrets.mjs --staged [--chemins-stdin] | <fichier> [...]');
    return 2;
  }
  const allowlist = loadAllowlist();
  let files;
  try {
    if (args.includes('--staged')) {
      let only = null;
      if (args.includes('--chemins-stdin')) {
        only = readFileSync(0, 'utf8').split('\0').map((s) => s.trim()).filter(Boolean);
        if (!only.length) return 0;
      }
      files = stagedFiles(only);
    } else {
      files = diskFiles(args.filter((a) => !a.startsWith('--')));
    }
  } catch (err) {
    console.error(`Vérification des secrets impossible : ${err.message}.`);
    return 2;
  }
  const findings = [];
  for (const f of files) {
    for (const x of scanText(f.rel, f.text, allowlist)) findings.push({ ...x, shown: f.shown });
  }
  if (!findings.length) return 0;
  report(findings);
  return 1;
}

process.exitCode = main();
