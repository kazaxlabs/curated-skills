#!/usr/bin/env node
// relink-skills.mjs — re-point installed per-skill links after skills move or are renamed.
//
// Context: ~/.claude/skills holds one directory junction per skill, pointing into this repo's skills/ tree.
// When a branch moves or renames skill folders (chore/skills-structure), those links break. Run this
// right after updating the checkout the links point into.
//
// Usage:
//   node scripts/relink-skills.mjs                     # preview against this checkout (default)
//   node scripts/relink-skills.mjs --apply             # make the changes
//   node scripts/relink-skills.mjs --home <dir>        # link folder (default: ~/.claude/skills)
//   node scripts/relink-skills.mjs --links-into <dir>  # only links pointing into this folder are handled
//                                                      # (default: this checkout's skills/)
//   node scripts/relink-skills.mjs --tree <dir>        # skills/ tree to resolve against (default: same as
//                                                      # --links-into). Preview a branch before updating the
//                                                      # live checkout: --links-into <live>/skills --tree <branch>/skills
//
// Rules: real files and folders are never touched; links pointing anywhere else are never touched;
// a link is only removed with --apply, and only if it is a link (fs.lstat().isSymbolicLink()).
// Renamed folders are resolved with aliases.json (old folder name -> new name), then by folder name.
// Exit: 0 when nothing is left unresolved, 1 on conflicts, 2 on bad arguments.

import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync, statSync, symlinkSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const apply = args.includes('--apply');
const repoRoot = resolve(import.meta.dirname, '..');
const home = resolve(opt('--home', join(homedir(), '.claude', 'skills')));
const linksInto = resolve(opt('--links-into', join(repoRoot, 'skills')));
const tree = resolve(opt('--tree', linksInto));
if (apply && tree !== linksInto) {
  console.error('--apply needs --tree to equal --links-into: links must point into the tree they are resolved against.');
  process.exit(2);
}
const aliasesPath = join(repoRoot, 'aliases.json');
const aliases = existsSync(aliasesPath) ? JSON.parse(readFileSync(aliasesPath, 'utf8')) : {};
const norm = (p) => resolve(p.replace(/^\\\\\?\\/, '')).toLowerCase();

// Index the target tree: folder name -> path, for every folder holding a SKILL.md.
const index = new Map();
const dupes = new Set();
const walk = (dir, depth) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (!statSync(p).isDirectory()) continue;
    if (existsSync(join(p, 'SKILL.md'))) { if (index.has(e)) dupes.add(e); else index.set(e, p); }
    if (depth < 4) walk(p, depth + 1);
  }
};
walk(tree, 1);

const plan = { ok: 0, remap: [], removed: [], conflicts: [], real: 0, elsewhere: 0 };
for (const name of readdirSync(home)) {
  const link = join(home, name);
  const st = lstatSync(link);
  if (!st.isSymbolicLink()) { plan.real++; continue; }
  const target = resolve(readlinkSync(link).replace(/^\\\\\?\\/, ''));
  if (!norm(target).startsWith(norm(linksInto) + sep)) { plan.elsewhere++; continue; }
  // Compare case-insensitively (Windows paths), but keep the original case: aliases.json keys are case-sensitive.
  const rel = target.slice(linksInto.length + 1);
  if (existsSync(join(tree, rel, 'SKILL.md'))) { plan.ok++; continue; }
  const oldFolder = rel.split(sep).pop();
  const newName = aliases[oldFolder] ?? oldFolder;
  if (dupes.has(newName)) { plan.conflicts.push(`${name}: more than one folder named ${newName} in the tree`); continue; }
  const dest = index.get(newName);
  if (!dest) { plan.removed.push(name); continue; }
  const newLink = join(home, newName);
  // Windows names are case-insensitive: Contract-Review -> contract-review is the same entry, renamed in place.
  if (newName.toLowerCase() !== name.toLowerCase() && existsSync(newLink)) {
    const s2 = lstatSync(newLink);
    // Compare where the links point relative to their trees (preview resolves against a different tree).
    const existingRel = s2.isSymbolicLink() ? relative(norm(linksInto), norm(readlinkSync(newLink).replace(/^\\\\\?\\/, ''))) : null;
    if (existingRel === null || existingRel !== relative(norm(tree), norm(dest))) {
      plan.conflicts.push(`${name} -> ${newName}: ${newName} already exists and is not a link to ${relative(tree, dest)}`);
      continue;
    }
  }
  plan.remap.push({ name, newName, dest });
}

console.log(`links folder: ${home}`);
console.log(`resolved against: ${tree}${apply ? '' : '  (preview; nothing changed)'}`);
console.log(`ok ${plan.ok} | to re-point ${plan.remap.length} | skill gone, broken link to remove ${plan.removed.length} | conflicts ${plan.conflicts.length} | real folders untouched ${plan.real} | links elsewhere untouched ${plan.elsewhere}`);
for (const r of plan.remap) console.log(`  re-point ${r.name}${r.newName !== r.name ? ` -> ${r.newName}` : ''}: ${relative(tree, r.dest)}`);
for (const n of plan.removed) console.log(`  remove   ${n} (no longer in the tree)`);
for (const c of plan.conflicts) console.log(`  CONFLICT ${c}`);

if (apply) {
  for (const r of plan.remap) {
    unlinkSync(join(home, r.name)); // a link (checked above); its target is not touched
    if (!existsSync(join(home, r.newName))) symlinkSync(r.dest, join(home, r.newName), 'junction');
  }
  for (const n of plan.removed) unlinkSync(join(home, n));
  console.log('applied.');
}
process.exit(plan.conflicts.length ? 1 : 0);
