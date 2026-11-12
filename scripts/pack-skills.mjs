#!/usr/bin/env node
// pack-skills.mjs: build the claude.ai ZIPs of a pack (SPEC packs/business-owner/SPEC.md §9).
//
// Usage: node scripts/pack-skills.mjs --pack business-owner [--out <dir>] [--target claudeai]
//   --out     output folder (default dist/<pack>); it is emptied first, so it must be under dist/ or empty
//   --target  which target to build (default claudeai; workspace and computer are accepted for inspection, no ZIPs)
//
// For every skill of the target, reads pack.json and noms-fr.json, then:
//   - copies the skill folder to <out>/<french-name>/ (pack.json `defaults.exclude`, e.g. evals/, is left out);
//   - sets frontmatter `name` and `description` from noms-fr.json and moves every other frontmatter key outside
//     name, description, license, allowed-tools, metadata, compatibility into `metadata` (scripts/lib/pack-common.mjs);
//   - applies the transforms listed in pack.json (remove-section, strip-link, exclude);
//   - for claudeai: zips <out>/<french-name>/ to <out>/zips/<french-name>.zip with that folder at the ZIP root, then
//     reads the ZIP's central directory back to check that <french-name>/SKILL.md is at its root.
// Originals under skills/ are never modified. dist/ is git-ignored.
//
// ZIP tool: Node has no ZIP writer, so the system tar is used: on Windows 10+ the built-in bsdtar
// (%SystemRoot%\System32\tar.exe, called by full path because Git Bash puts GNU tar first on PATH):
//   tar -a -c -f <name>.zip -C <out> <name>
// On Linux and macOS: `zip -r` if present, else bsdtar (`tar -a`, the default tar on macOS), else `python3 -m zipfile -c`.
// Exit: 0 ok, 1 a skill failed to build or a ZIP failed its check, 2 bad arguments.

import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { buildSkill, listZip, loadPack, parseArgs, repoRoot, TARGETS, zipFolder } from './lib/pack-common.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.pack || args.pack === true) { console.error('usage: node scripts/pack-skills.mjs --pack <name> [--out <dir>] [--target claudeai]'); process.exit(2); }
const target = args.target && args.target !== true ? args.target : 'claudeai';
if (!TARGETS.includes(target)) { console.error(`unknown target ${target}; expected one of ${TARGETS.join(', ')}`); process.exit(2); }

const { pack, noms } = loadPack(args.pack);
const out = resolve(args.out && args.out !== true ? args.out : join(repoRoot, 'dist', args.pack));
const distRoot = join(repoRoot, 'dist') + sep;
if (existsSync(out)) {
  if ((out + sep).startsWith(distRoot) || !readdirSync(out).length) rmSync(out, { recursive: true, force: true });
  else { console.error(`refusing to empty ${out}: not under dist/ and not empty`); process.exit(2); }
}
mkdirSync(out, { recursive: true });

const entries = pack.skills.filter((s) => s.targets.includes(target));
let failures = 0;
let tool = null;
console.log(`pack-skills: ${pack.pack}, target ${target}, ${entries.length} skill(s) -> ${relative(process.cwd(), out) || '.'}`);
for (const entry of entries) {
  try {
    const r = buildSkill({ entry, noms, pack, destParent: out });
    let line = `  ${r.nom.padEnd(40)} <- ${entry.name} (${r.files} files, ${r.bytes} bytes)`;
    if (target === 'claudeai') {
      const zip = join(out, 'zips', `${r.nom}.zip`);
      tool = zipFolder(out, r.nom, zip);
      const names = listZip(zip);
      const roots = new Set(names.map((n) => n.split('/')[0]));
      if (!names.includes(`${r.nom}/SKILL.md`) || roots.size !== 1) {
        failures++;
        line += `  FAIL zip root: expected ${r.nom}/SKILL.md, roots ${[...roots].join(', ')}`;
      } else line += `  zip ok (${names.filter((n) => !n.endsWith('/')).length} entries)`;
    }
    if (r.notes.length) line += `  [${r.notes.join('; ')}]`;
    console.log(line);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${entry.name}: ${err.message}`);
  }
}
if (tool) console.log(`zip tool: ${tool}`);
console.log(failures ? `pack-skills: ${failures} failure(s)` : `pack-skills: ok`);
process.exit(failures ? 1 : 0);
