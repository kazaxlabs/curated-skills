#!/usr/bin/env node
// session-start.mjs: SessionStart hook. Claude Code adds this hook's plain-text stdout to Claude's context.
//
// source startup | resume | clear:
//   - points git at .githooks/ (core.hooksPath) when the workspace is a git repo, silently;
//   - records the session start (time + hash of memoire/etat-en-cours.md) in .claude/cache/session.json,
//     which the Stop hook reads;
//   - prints a short context block: the profile summary (or the instruction to run profil-entreprise),
//     memoire/passation.md, and the open tasks from projets/*/taches.md.
// source compact: prints memoire/etat-en-cours.md and memoire/passation.md into the compacted context.
//
// Output budget about 2,000 characters; long files are cut with a pointer to the file. Never fails the session:
// every error is swallowed and the hook exits 0.

import { chmodSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  ETAT_FILE, PASSATION_FILE, PROFIL_FILE, ROOT, SESSION_FILE, clean, clip, etatHash, existsSync, finish, git,
  isGitRepo, isoLocal, readInput, readJson, readText, writeJson,
} from './commun.mjs';

const BUDGET = 2000;

function setupGitHooks() {
  try {
    const hook = join(ROOT, '.githooks', 'pre-commit');
    if (!existsSync(hook) || !isGitRepo()) return;
    if (process.platform !== 'win32') {
      try {
        if ((statSync(hook).mode & 0o111) === 0) chmodSync(hook, 0o755);
      } catch {
        // read-only checkout: git reports the hook as not executable, nothing more
      }
    }
    const current = git(['config', '--get', 'core.hooksPath']).stdout?.trim();
    if (current !== '.githooks') git(['config', 'core.hooksPath', '.githooks']);
  } catch {
    // silent by design
  }
}

function recordSession(input) {
  const id = String(input.session_id || 'inconnue');
  const state = readJson(SESSION_FILE, {});
  const sessions = state && typeof state.sessions === 'object' && state.sessions ? state.sessions : {};
  if (input.source === 'resume' && sessions[id]) return; // keep the original start of a resumed session
  sessions[id] = { debut: isoLocal(), debutMs: Date.now(), etatHash: etatHash(), source: input.source || 'startup' };
  const recent = Object.entries(sessions)
    .sort((a, b) => (b[1].debutMs || 0) - (a[1].debutMs || 0))
    .slice(0, 20);
  writeJson(SESSION_FILE, { sessions: Object.fromEntries(recent) });
}

/** The profile's summary section when it has one, otherwise its first lines. */
function profileSummary() {
  const text = readText(PROFIL_FILE);
  if (text === null) return null;
  const body = clean(text);
  const lines = body.split('\n');
  const start = lines.findIndex((l) => /^#{1,3}\s*(r[ée]sum[ée]|summary|en bref|aper[çc]u)(?![\p{L}\p{N}])/iu.test(l));
  let picked = lines;
  if (start !== -1) {
    const end = lines.findIndex((l, i) => i > start && /^#{1,3}\s/.test(l));
    picked = lines.slice(start + 1, end === -1 ? undefined : end);
  }
  const out = picked.filter((l) => l.trim()).join('\n');
  return out || '(profil-entreprise.md is empty)';
}

/** passation.md from its first section on, without empty lines; null when it holds no content yet. */
function handoff(file) {
  const text = readText(file);
  if (text === null) return null;
  const lines = clean(text).split('\n');
  const first = lines.findIndex((l) => /^##\s/.test(l));
  const kept = (first === -1 ? lines : lines.slice(first)).filter((l) => l.trim() && !/^[-*]\s*$/.test(l.trim()));
  const hasContent = kept.some((l) => !/^#{1,6}\s/.test(l));
  return hasContent ? kept.join('\n') : null;
}

function openTasks() {
  const files = [];
  if (existsSync(join(ROOT, 'taches.md'))) files.push('taches.md');
  try {
    for (const e of readdirSync(join(ROOT, 'projets'), { withFileTypes: true })) {
      if (e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.')) {
        if (existsSync(join(ROOT, 'projets', e.name, 'taches.md'))) files.push(`projets/${e.name}/taches.md`);
      }
    }
  } catch {
    // no projets/ folder yet
  }
  const tasks = [];
  for (const rel of files) {
    const text = readText(join(ROOT, rel)) || '';
    for (const line of clean(text).split('\n')) {
      if (/^\s*[-*]\s+\[[ ~]\]\s+\S/.test(line)) {
        const t = line.trim();
        tasks.push(`${rel}: ${t.length > 110 ? `${t.slice(0, 107)}...` : t}`);
      }
    }
  }
  return tasks;
}

function startupBlock() {
  const parts = ['Workspace context (SessionStart hook). Read the files themselves before relying on a detail.'];
  const profile = profileSummary();
  if (profile === null) {
    parts.push(
      'Business profile: profil-entreprise.md is missing. Before any substantive work, run the profil-entreprise skill '
      + '(repository name business-profile-intake) to interview the owner and write it.',
    );
  } else {
    parts.push(`Business profile (profil-entreprise.md):\n${clip(profile, 500, '[cut: read profil-entreprise.md]')}`);
  }
  const pass = handoff(PASSATION_FILE);
  parts.push(pass
    ? `Handoff (memoire/passation.md):\n${clip(pass, 850, '[cut: read memoire/passation.md]')}`
    : 'Handoff (memoire/passation.md): empty, no previous handoff.');
  const tasks = openTasks();
  if (tasks.length) {
    const shown = tasks.slice(0, 8);
    const more = tasks.length > shown.length ? `\n[${tasks.length - shown.length} more: read the taches.md files]` : '';
    parts.push(`Open tasks:\n${clip(shown.join('\n'), 450, '[cut: read the taches.md files]')}${more}`);
  } else {
    parts.push('Open tasks: none found in projets/*/taches.md.');
  }
  return parts.join('\n\n');
}

function compactBlock() {
  const parts = ['Workspace state after compaction (SessionStart hook). Continue from memoire/etat-en-cours.md.'];
  const etat = readText(ETAT_FILE);
  const etatText = etat === null ? '' : clean(etat)
    .split('\n')
    .filter((l) => !/^\s*[-*]\s*$/.test(l)) // empty template bullets
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  parts.push(etatText
    ? `memoire/etat-en-cours.md:\n${clip(etatText, 1100, '[cut: read memoire/etat-en-cours.md]')}`
    : 'memoire/etat-en-cours.md: missing or empty. Rebuild it now from the conversation summary.');
  const pass = handoff(PASSATION_FILE);
  parts.push(pass
    ? `memoire/passation.md:\n${clip(pass, 650, '[cut: read memoire/passation.md]')}`
    : 'memoire/passation.md: empty.');
  return parts.join('\n\n');
}

let out = '';
try {
  const input = await readInput();
  if (input.source === 'compact') {
    out = compactBlock();
  } else {
    setupGitHooks();
    recordSession(input);
    out = startupBlock();
  }
  out = `${clip(out, BUDGET, '[context cut at 2,000 characters]')}\n`;
} catch {
  // never block or break the session
}
finish(out);
