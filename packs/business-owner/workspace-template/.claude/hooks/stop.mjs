#!/usr/bin/env node
// stop.mjs: Stop hook (runs when Claude finishes a response). One script for both jobs, because hooks that match
// the same event run in parallel and these two must not race.
//
// 1. Auto-save: when a memory path changed (git status) and the last save is older than 10 minutes, run
//    outils/sauvegarde.mjs. If the save is blocked by the secret check, or the push fails, the owner sees the
//    French message (systemMessage).
// 2. Keep memoire/etat-en-cours.md current: when files outside memoire/ changed during this session and
//    etat-en-cours.md still has the content it had at session start (the PreCompact stamp line is ignored), return
//    {"decision":"block","reason":...} so Claude updates it before stopping. Never when stop_hook_active is true
//    (Claude is already continuing because of a Stop hook), and never without a start record for this session.
//
// Exits 0 in every case; the block is expressed in the JSON output only.

import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import {
  MEMORY_PATHS, ROOT, SAUVEGARDE, SAVE_STATE_FILE, SESSION_FILE, etatHash, existsSync, finish, git, isGitRepo,
  readInput, readJson, workChangedSince,
} from './commun.mjs';

const SAVE_INTERVAL_MS = 10 * 60 * 1000;
const REASON = 'Mets à jour memoire/etat-en-cours.md (ce qui est fait, la prochaine étape) avant de terminer.';

function memoryChanged() {
  const r = git(['status', '--porcelain', '--untracked-files=all', '--', ...MEMORY_PATHS]);
  return r.status === 0 && r.stdout.trim().length > 0;
}

function autoSave() {
  if (existsSync(join(ROOT, 'memoire', '.sauvegarde-desactivee'))) return null;
  if (!isGitRepo() || !memoryChanged()) return null;
  const last = readJson(SAVE_STATE_FILE, {});
  if (typeof last.derniereMs === 'number' && Date.now() - last.derniereMs < SAVE_INTERVAL_MS) return null;
  const r = spawnSync(process.execPath, [SAUVEGARDE, '--json'], {
    cwd: ROOT, encoding: 'utf8', windowsHide: true, timeout: 90000,
  });
  let status = {};
  try {
    status = JSON.parse((r.stdout || '').trim().split('\n').pop() || '{}');
  } catch {
    return null;
  }
  if (status.etat === 'bloquee' || status.etat === 'erreur' || status.poussee === false) return status.message || null;
  return null;
}

function needsEtatUpdate(input) {
  if (input.stop_hook_active === true) return false;
  const id = String(input.session_id || 'inconnue');
  const record = readJson(SESSION_FILE, {})?.sessions?.[id];
  if (!record || typeof record.debutMs !== 'number') return false;
  if (etatHash() !== record.etatHash) return false;
  return workChangedSince(record.debutMs);
}

const out = {};
try {
  const input = await readInput();
  try {
    const message = autoSave();
    if (message) out.systemMessage = message;
  } catch {
    // a failed save never stops the session
  }
  try {
    if (needsEtatUpdate(input)) {
      out.decision = 'block';
      out.reason = REASON;
    }
  } catch {
    // no block when the check itself fails
  }
} catch {
  // never break the session
}
finish(Object.keys(out).length ? `${JSON.stringify(out)}\n` : '');
