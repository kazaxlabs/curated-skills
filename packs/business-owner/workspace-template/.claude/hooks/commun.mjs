// commun.mjs: helpers shared by the workspace hooks. Node built-ins only; nothing here throws on a missing file.
// The workspace root is found from this file's location (.claude/hooks/ -> root), so the hooks work whatever
// directory Claude Code starts them from.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CACHE_DIR = join(ROOT, '.claude', 'cache');
export const SESSION_FILE = join(CACHE_DIR, 'session.json');
export const SAVE_STATE_FILE = join(CACHE_DIR, 'sauvegarde.json');
export const ETAT_FILE = join(ROOT, 'memoire', 'etat-en-cours.md');
export const PASSATION_FILE = join(ROOT, 'memoire', 'passation.md');
export const PROFIL_FILE = join(ROOT, 'profil-entreprise.md');
export const SAUVEGARDE = join(ROOT, 'outils', 'sauvegarde.mjs');
/** Line the PreCompact hook writes in etat-en-cours.md; ignored when checking whether the agent updated the file. */
export const STAMP_PREFIX = 'Dernier résumé automatique :';
/** Paths the auto-save commits; a change under them means "memory changed". */
export const MEMORY_PATHS = ['memoire', 'registre-des-decisions.md', 'projets', 'connaissances', 'profil-entreprise.md', '.claude/skills'];

/** Reads the hook's JSON input from stdin. Never throws; returns {} on empty or invalid input. */
export async function readInput() {
  if (process.stdin.isTTY) return {};
  const raw = await new Promise((done) => {
    let data = '';
    const timer = setTimeout(() => {
      try { process.stdin.destroy(); } catch { /* already closed */ }
      done(data);
    }, 3000);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => { clearTimeout(timer); done(data); });
    process.stdin.on('error', () => { clearTimeout(timer); done(data); });
  });
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function readText(file) {
  try {
    return readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    return null;
  }
}

export function readJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(file, value) {
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(value, null, 1));
    return true;
  } catch {
    return false;
  }
}

/** Removes HTML comments and YAML front matter, trims trailing spaces. */
export function clean(text) {
  return (text || '')
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n');
}

/** Cuts text to `max` characters on a line boundary when possible and adds a pointer to the full file. */
export function clip(text, max, pointer) {
  if (text.length <= max) return text;
  const room = Math.max(0, max - pointer.length - 2);
  let cut = text.slice(0, room);
  const nl = cut.lastIndexOf('\n');
  if (nl > room * 0.6) cut = cut.slice(0, nl);
  return `${cut.trimEnd()}\n${pointer}`;
}

export function git(args, opts = {}) {
  return spawnSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    windowsHide: true,
    timeout: 15000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    ...opts,
  });
}

export function isGitRepo() {
  const r = git(['rev-parse', '--is-inside-work-tree']);
  return r.status === 0 && r.stdout.trim() === 'true';
}

/** Hash of etat-en-cours.md without the PreCompact stamp line, so a stamp alone never counts as an update. */
export function etatHash() {
  const text = readText(ETAT_FILE) ?? '';
  const body = text
    .split('\n')
    .filter((l) => !l.startsWith(STAMP_PREFIX))
    .join('\n')
    .trim();
  return createHash('sha256').update(body).digest('hex');
}

/** True when a file outside memoire/ (and outside .git, node_modules, .claude/cache) changed after `sinceMs`. */
export function workChangedSince(sinceMs, limit = 20000) {
  let seen = 0;
  const skip = new Set(['.git', 'node_modules']);
  const stack = [ROOT];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (++seen > limit) return false;
      const full = join(dir, e.name);
      const rel = relative(ROOT, full).replace(/\\/g, '/');
      if (e.isDirectory()) {
        if (skip.has(e.name) || rel === 'memoire' || rel === '.claude/cache') continue;
        stack.push(full);
      } else if (e.isFile()) {
        try {
          if (statSync(full).mtimeMs > sinceMs) return true;
        } catch {
          // vanished while walking
        }
      }
    }
  }
  return false;
}

/** Local time as 2026-01-31T14:05:00-05:00. */
export function isoLocal(date = new Date()) {
  const pad = (n) => String(Math.abs(n)).padStart(2, '0');
  const off = -date.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${pad(Math.trunc(off / 60))}:${pad(off % 60)}`;
}

/** Writes `text` (if any) to stdout, waits for it to flush, then exits 0. */
export function finish(text) {
  const done = () => process.exit(0);
  try {
    if (text) process.stdout.write(text, done);
    else done();
  } catch {
    done();
  }
}

export { existsSync };
