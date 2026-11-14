#!/usr/bin/env node
// sauvegarde.mjs: commits the workspace's memory paths and pushes them to the current branch's upstream.
// Run by the Stop hook (memory changed, last save older than 10 minutes) and the SessionEnd hook; the owner or
// the agent can also run it: node outils/sauvegarde.mjs
//
// - Paths: ALLOWED below. Each changed file under them is staged by name; never `git add -A`.
// - Before committing, runs outils/verifier-secrets.mjs on exactly those staged files. On a finding: nothing is
//   committed, the files are unstaged again, and a short French message names the file and the rule (never the value).
// - Commits only those paths (`git commit --only`), message `sauvegarde: <ISO date>`. Anything else the index holds
//   stays staged and out of the commit.
// - Pushes to the current branch's upstream when one exists (never forced). No upstream: no push, no message.
//   Push failure: one French line, exit 0. A later run retries a pending push when the last commit is a sauvegarde.
// - Off when memoire/.sauvegarde-desactivee exists. No-op when nothing changed.
//
// Flags: --hook (always exit 0), --json (one JSON status line, for the Stop hook).
// Exit: 0 saved, nothing to save, disabled, or push skipped/failed; 1 blocked by the secret check; 3 other failure.
// Node built-ins and git only.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED = ['memoire', 'registre-des-decisions.md', 'projets', 'connaissances', 'profil-entreprise.md', '.claude/skills'];
const OFF_SWITCH = join(ROOT, 'memoire', '.sauvegarde-desactivee');
const STATE_FILE = join(ROOT, '.claude', 'cache', 'sauvegarde.json');
const VERIFIER = join(ROOT, 'outils', 'verifier-secrets.mjs');

const args = process.argv.slice(2);
const HOOK = args.includes('--hook');
const JSON_OUT = args.includes('--json');

const real = (p) => { try { return realpathSync.native(p); } catch { return p; } };
const fwd = (p) => p.replace(/\\/g, '/');

// Never wait for a password prompt: the hooks must not hang.
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never', GIT_LITERAL_PATHSPECS: '1' };

function git(gitArgs, opts = {}) {
  return spawnSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8', windowsHide: true, env: GIT_ENV, timeout: 60000, maxBuffer: 256 * 1024 * 1024, ...opts });
}

function finish(etat, message, extra = {}) {
  const codes = { bloquee: 1, erreur: 3 };
  if (JSON_OUT) console.log(JSON.stringify({ etat, message, ...extra }));
  else if (message) console.log(message);
  return HOOK ? 0 : codes[etat] || 0;
}

function upstreamTarget(top) {
  const branch = git(['symbolic-ref', '--quiet', '--short', 'HEAD'], { cwd: top });
  if (branch.status !== 0) return null; // detached HEAD
  const name = branch.stdout.trim();
  const remote = git(['config', '--get', `branch.${name}.remote`], { cwd: top }).stdout.trim();
  const merge = git(['config', '--get', `branch.${name}.merge`], { cwd: top }).stdout.trim();
  if (!remote || !merge || remote === '.') return null;
  return { remote, merge };
}

function push(top, target) {
  const r = git(['push', '--quiet', target.remote, `HEAD:${target.merge}`], { cwd: top, timeout: 30000 });
  return r.status === 0;
}

function pendingSauvegardePush(top) {
  const ahead = git(['rev-list', '--count', '@{upstream}..HEAD'], { cwd: top });
  if (ahead.status !== 0 || Number(ahead.stdout.trim()) === 0) return false;
  const subject = git(['log', '-1', '--format=%s'], { cwd: top }).stdout.trim();
  return subject.startsWith('sauvegarde:');
}

/**
 * Parses `git status --porcelain=v1 -z` into { all, toAdd }: `all` is every changed path (both sides of a rename),
 * the commit's pathspec; `toAdd` leaves out paths whose deletion is already staged, which `git add` would reject.
 */
function changedPaths(top, specs) {
  const r = git(['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', ...specs], { cwd: top });
  if (r.status !== 0) return null;
  const fields = r.stdout.split('\0');
  const all = [];
  const toAdd = [];
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (f.length < 4) continue;
    const xy = f.slice(0, 2);
    const path = f.slice(3);
    all.push(path);
    if (xy[0] !== 'D') toAdd.push(path);
    if (xy[0] === 'R' || xy[0] === 'C') all.push(fields[++i]); // the original path follows; its removal is staged
  }
  return { all: [...new Set(all.filter(Boolean))], toAdd: [...new Set(toAdd.filter(Boolean))] };
}

function withPathspecFile(gitArgs, top, paths) {
  return git([...gitArgs, '--pathspec-from-file=-', '--pathspec-file-nul'], { cwd: top, input: paths.join('\0') });
}

function isoNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function main() {
  if (existsSync(OFF_SWITCH)) {
    return finish('desactivee', HOOK ? '' : 'Sauvegarde automatique désactivée (memoire/.sauvegarde-desactivee existe).');
  }
  const topRes = git(['rev-parse', '--show-toplevel']);
  if (topRes.status !== 0) return finish('pas-de-depot', HOOK ? '' : "Sauvegarde impossible : ce dossier n'est pas un dépôt Git.");
  const top = topRes.stdout.trim();

  for (const marker of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply']) {
    const p = git(['rev-parse', '--git-path', marker], { cwd: top }).stdout.trim();
    if (p && existsSync(resolve(top, p))) {
      return finish('en-attente', 'Sauvegarde reportée : une opération Git est en cours (fusion ou rebasage).');
    }
  }

  const prefix = fwd(relative(real(top), real(ROOT)));
  const specs = ALLOWED.map((a) => (prefix ? `${prefix}/${a}` : a));
  const changed = changedPaths(top, specs);
  if (changed === null) return finish('erreur', "Sauvegarde impossible : Git n'a pas pu lire l'état des fichiers.");
  const paths = changed.all;
  const target = upstreamTarget(top);

  if (!paths.length) {
    if (target && pendingSauvegardePush(top)) {
      const ok = push(top, target);
      return finish('rien', ok ? 'Sauvegarde précédente envoyée.' : '', { poussee: ok });
    }
    return finish('rien', HOOK ? '' : 'Rien à sauvegarder.', { poussee: null });
  }

  const add = changed.toAdd.length ? withPathspecFile(['add'], top, changed.toAdd) : { status: 0 };
  if (add.status !== 0) {
    withPathspecFile(['reset', '-q'], top, paths);
    return finish('erreur', "Sauvegarde impossible : Git n'a pas pu préparer les fichiers.");
  }

  const check = spawnSync(process.execPath, [VERIFIER, '--staged', '--chemins-stdin'], {
    cwd: top, encoding: 'utf8', windowsHide: true, input: paths.join('\0'), env: GIT_ENV, timeout: 120000,
  });
  if (check.status !== 0) {
    withPathspecFile(['reset', '-q'], top, paths);
    const details = (check.stdout || '').trim() || 'La vérification des secrets n\'a pas pu se faire.';
    const etat = check.status === 1 ? 'bloquee' : 'erreur';
    return finish(etat, `Sauvegarde bloquée.\n${details}`);
  }

  const message = `sauvegarde: ${isoNow()}`;
  const commit = withPathspecFile(['commit', '-q', '--only', '-m', message], top, paths);
  if (commit.status !== 0) {
    withPathspecFile(['reset', '-q'], top, paths);
    const err = `${commit.stderr || ''}${commit.stdout || ''}`;
    if (/nothing (added )?to commit|no changes added/i.test(err)) return finish('rien', HOOK ? '' : 'Rien à sauvegarder.');
    if (/user\.(email|name)|tell me who you are/i.test(err)) {
      return finish('erreur', "Sauvegarde impossible : Git n'a pas de nom ni de courriel d'auteur configuré.");
    }
    return finish('erreur', "Sauvegarde impossible : l'enregistrement Git a échoué.");
  }

  try {
    mkdirSync(dirname(STATE_FILE), { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify({ derniere: new Date().toISOString(), derniereMs: Date.now(), message }));
  } catch {
    // the cache is a convenience; a failed write only means the next Stop may save again
  }

  const saved = `Sauvegarde faite : ${paths.length} fichier${paths.length > 1 ? 's' : ''}.`;
  if (!target) return finish('sauvegardee', saved, { fichiers: paths.length, poussee: null });
  const ok = push(top, target);
  if (!ok) {
    return finish('sauvegardee', `${saved} L'envoi vers le dépôt en ligne n'a pas fonctionné ; il sera repris à la prochaine sauvegarde.`, { fichiers: paths.length, poussee: false });
  }
  return finish('sauvegardee', `${saved} Envoyée au dépôt en ligne.`, { fichiers: paths.length, poussee: true });
}

try {
  process.exitCode = main();
} catch (err) {
  if (JSON_OUT) console.log(JSON.stringify({ etat: 'erreur', message: 'Sauvegarde impossible : erreur inattendue.' }));
  else console.log('Sauvegarde impossible : erreur inattendue.');
  process.exitCode = HOOK ? 0 : 3;
}
