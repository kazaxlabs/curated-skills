#!/usr/bin/env node
// pre-compact.mjs: PreCompact hook. Stamps memoire/etat-en-cours.md with the time of the compaction, so the file
// shows when the conversation was last summarised. Prints nothing (a PreCompact hook's stdout becomes instructions
// for the compaction summary) and never blocks: it always exits 0.
// The Stop hook ignores this stamp line when it checks whether the agent updated the file.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { ETAT_FILE, STAMP_PREFIX, finish, isoLocal, readInput, readText } from './commun.mjs';

try {
  const input = await readInput();
  const trigger = input.trigger === 'manual' ? 'manuel' : 'automatique';
  const stamp = `${STAMP_PREFIX} ${isoLocal()} (${trigger})`;
  const text = readText(ETAT_FILE);
  let next;
  if (text === null) {
    next = `# État en cours\n\n${stamp}\n`;
  } else {
    const lines = text.split('\n');
    const at = lines.findIndex((l) => l.startsWith(STAMP_PREFIX));
    if (at !== -1) {
      lines[at] = stamp;
    } else {
      const title = lines.findIndex((l) => /^#\s/.test(l));
      lines.splice(title === -1 ? 0 : title + 1, 0, ...(title === -1 ? [stamp, ''] : ['', stamp]));
    }
    next = lines.join('\n');
  }
  mkdirSync(dirname(ETAT_FILE), { recursive: true });
  writeFileSync(ETAT_FILE, next);
} catch {
  // never block compaction
}
finish('');
