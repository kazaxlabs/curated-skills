#!/usr/bin/env node
// context-cost.mjs — projected always-on context cost of a skill set, measured by Claude Code's own
// estimator (`claude --plugin-dir <wrapper> plugin details <name>`). Works offline, no login needed.
//
// Usage:
//   node scripts/verify/context-cost.mjs home   # what ~/.claude/skills and ~/.claude/commands load today
//   node scripts/verify/context-cost.mjs core   # what the Core in core.json would load
// Both arms are measured the same way: SKILL.md files (and command .md files for 'home') are copied into
// one throwaway plugin under .verify/, then Claude Code reports the always-on token estimate.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2];
if (!['home', 'core'].includes(mode)) { console.error('usage: context-cost.mjs home|core'); process.exit(2); }
const repoRoot = resolve(import.meta.dirname, '..', '..');
const name = `cost-${mode}`;
const wrapper = join(repoRoot, '.verify', name);
rmSync(wrapper, { recursive: true, force: true });
mkdirSync(join(wrapper, '.claude-plugin'), { recursive: true });
writeFileSync(join(wrapper, '.claude-plugin', 'plugin.json'),
  JSON.stringify({ name, version: '0.0.0', description: `context-cost probe (${mode})`, author: { name: 'kazaxlabs' } }) + '\n');

function copySkill(srcDir, skillName) {
  const src = join(srcDir, 'SKILL.md');
  if (!existsSync(src)) return false;
  mkdirSync(join(wrapper, 'skills', skillName), { recursive: true });
  cpSync(src, join(wrapper, 'skills', skillName, 'SKILL.md'));
  return true;
}

let skills = 0, commands = 0;
if (mode === 'home') {
  const skillsHome = join(homedir(), '.claude', 'skills');
  for (const e of readdirSync(skillsHome)) if (copySkill(join(skillsHome, e), e)) skills++;
  const cmdHome = join(homedir(), '.claude', 'commands');
  if (existsSync(cmdHome)) {
    mkdirSync(join(wrapper, 'commands'), { recursive: true });
    for (const f of readdirSync(cmdHome).filter((f) => f.endsWith('.md'))) {
      cpSync(join(cmdHome, f), join(wrapper, 'commands', f));
      commands++;
    }
  }
} else {
  const core = JSON.parse(readFileSync(join(repoRoot, 'core.json'), 'utf8'));
  const index = new Map();
  const walk = (dir, depth) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (!statSync(p).isDirectory()) continue;
      if (existsSync(join(p, 'SKILL.md'))) index.set(e, p);
      if (depth < 4) walk(p, depth + 1);
    }
  };
  walk(join(repoRoot, 'skills'), 1);
  for (const s of core.skills) {
    if (!index.has(s.name)) { console.error(`core skill not found: ${s.name}`); process.exit(1); }
    copySkill(index.get(s.name), s.name);
    skills++;
  }
}

const r = spawnSync(process.platform === 'win32' ? 'claude.exe' : 'claude', ['--plugin-dir', wrapper, 'plugin', 'details', name], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const out = `${r.stdout}${r.stderr}`;
const m = /Always-on:\s+~?([\d,]+)\s*tok/.exec(out);
const inv = /Skills \((\d+)\)/.exec(out);
if (r.status !== 0 || !m) { console.error(out.slice(0, 2000)); process.exit(1); }
const result = {
  mode, measuredAt: new Date().toISOString(), skillsCopied: skills, commandsCopied: commands,
  skillsLoaded: inv ? Number(inv[1]) : null, alwaysOnTokens: Number(m[1].replace(/,/g, '')),
  method: 'claude --plugin-dir <wrapper> plugin details (Claude Code estimator)',
};
console.log(JSON.stringify(result));
