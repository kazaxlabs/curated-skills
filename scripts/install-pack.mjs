#!/usr/bin/env node
// install-pack.mjs: install a pack's skills under their French names (the francisation engine, SPEC §4.3 / §5).
//
// Usage (from a curated-skills clone):
//   node scripts/install-pack.mjs --pack business-owner --target <workspace|computer> --dest <skills-dir> [--dry-run]
//
// What it does:
//   - reads packs/<pack>/pack.json and packs/<pack>/noms-fr.json, then <dest>/noms-fr.local.json if present (names the
//     owner approved locally; they win over the pack's, and survive a `git pull` of this repository);
//   - for each pack skill whose targets include --target and that has a French name: copies it to <dest>/<french-name>/
//     with the same frontmatter normalisation and transforms as scripts/pack-skills.mjs (scripts/lib/pack-common.mjs);
//   - writes <dest>/noms-appliques.json: what it installed, from which repo name and source path, at which commit;
//   - skills without a French name are not installed: they are printed under the heading `A NOMMER:` with their English
//     description, so the agent can propose names (exit 0).
// Idempotent: a re-run replaces only the folders listed in the previous noms-appliques.json (and removes those that
// left the pack or changed name). A folder it did not create is never deleted or overwritten: that skill is skipped and
// reported, and the exit code is 1.
// --dry-run prints the plan and writes nothing.
// Exit: 0 ok, 1 a skill was skipped or failed, 2 bad arguments.

import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildSkill, gitCommit, loadPack, parseArgs, parseFrontmatter, repoRoot } from './lib/pack-common.mjs';

const MANIFEST = 'noms-appliques.json';
const LOCAL_NAMES = 'noms-fr.local.json';
const args = parseArgs(process.argv.slice(2));
const usage = 'usage: node scripts/install-pack.mjs --pack <name> --target <workspace|computer> --dest <skills-dir> [--dry-run]';
if (!args.pack || args.pack === true || !args.dest || args.dest === true) { console.error(usage); process.exit(2); }
if (!['workspace', 'computer'].includes(args.target)) { console.error(`--target must be workspace or computer\n${usage}`); process.exit(2); }
const dryRun = Boolean(args['dry-run']);
const dest = resolve(args.dest);

const { pack, noms: packNoms } = loadPack(args.pack);
const localFile = join(dest, LOCAL_NAMES);
const localNoms = existsSync(localFile) ? JSON.parse(readFileSync(localFile, 'utf8')) : {};
const noms = { ...packNoms, ...localNoms };

const manifestFile = join(dest, MANIFEST);
const previous = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : null;
const ownedBefore = new Set((previous?.skills || []).map((s) => s.nom));

// A French name must be valid and unique before anything is written.
const NAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const entries = pack.skills.filter((s) => s.targets.includes(args.target));
console.log(`install-pack: ${pack.pack}, target ${args.target}, dest ${dest}${dryRun ? ' (dry run)' : ''}`);
const toInstall = [];
const unnamed = [];
const seen = new Map();
let problems = 0;
for (const entry of entries) {
  const map = noms[entry.name];
  if (!map || !map.nom) { unnamed.push(entry); continue; }
  if (!NAME_RE.test(map.nom) || map.nom.includes('--') || /claude|anthropic/.test(map.nom)) {
    console.log(`  SKIP ${entry.name}: invalid French name "${map.nom}"`); problems++; continue;
  }
  if (seen.has(map.nom)) { console.log(`  SKIP ${entry.name}: French name "${map.nom}" already used by ${seen.get(map.nom)}`); problems++; continue; }
  seen.set(map.nom, entry.name);
  if (existsSync(join(dest, map.nom)) && !ownedBefore.has(map.nom)) {
    console.log(`  SKIP ${entry.name}: ${join(dest, map.nom)} exists and was not installed by this command; left untouched`);
    problems++; continue;
  }
  toInstall.push({ entry, nom: map.nom });
}
const keep = new Set(toInstall.map((t) => t.nom));
const stale = [...ownedBefore].filter((n) => !keep.has(n));

console.log(`  ${toInstall.length} to install, ${ownedBefore.size} installed before by this command, ${stale.length} to remove, ${unnamed.length} without a French name`);

const commit = gitCommit();
const installed = [];
if (dryRun) {
  for (const { entry, nom } of toInstall) console.log(`  would install ${nom.padEnd(40)} <- ${entry.name}${ownedBefore.has(nom) ? ' (replace)' : ''}`);
  for (const n of stale) console.log(`  would remove ${n} (installed before, no longer in the pack under that name)`);
} else {
  mkdirSync(dest, { recursive: true });
  for (const n of stale) { rmSync(join(dest, n), { recursive: true, force: true }); console.log(`  removed ${n}`); }
  // Build into a staging folder inside dest, then swap, so a failed build never leaves a half-written skill.
  const staging = join(dest, '.install-pack-staging');
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  for (const { entry, nom } of toInstall) {
    try {
      const r = buildSkill({ entry, noms, pack, destParent: staging });
      rmSync(join(dest, nom), { recursive: true, force: true });
      renameSync(r.dir, join(dest, nom));
      installed.push({ nom, depot: entry.name, source: entry.source, commit });
      console.log(`  installed ${nom.padEnd(40)} <- ${entry.name}${r.notes.length ? `  [${r.notes.join('; ')}]` : ''}`);
    } catch (err) {
      problems++;
      console.log(`  FAIL ${entry.name}: ${err.message}`);
      // a skill installed before stays listed (it is still ours) so the next run can replace it
      if (ownedBefore.has(nom) && existsSync(join(dest, nom))) installed.push({ nom, depot: entry.name, source: entry.source, commit: previous.skills.find((s) => s.nom === nom)?.commit ?? null });
    }
  }
  rmSync(staging, { recursive: true, force: true });
  installed.sort((a, b) => (a.nom < b.nom ? -1 : 1));
  const manifest = {
    pack: pack.pack,
    target: args.target,
    commit,
    note: 'Written by scripts/install-pack.mjs of curated-skills. Lists the skill folders this command installed; a re-run replaces only these.',
    skills: installed,
  };
  writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`  wrote ${manifestFile} (${installed.length} skill(s), commit ${commit ?? 'unknown: not a git checkout'})`);
}

if (unnamed.length) {
  console.log('\nA NOMMER:');
  for (const entry of unnamed) {
    let desc = '';
    try { desc = String(parseFrontmatter(readFileSync(join(repoRoot, entry.source, 'SKILL.md'), 'utf8')).data.get('description') ?? ''); }
    catch { desc = '(source SKILL.md not readable)'; }
    console.log(`- ${entry.name}: ${desc.replace(/\s+/g, ' ').trim()}`);
  }
  console.log(`\nAdd an approved name for each to ${localFile} as { "<repo-name>": { "nom": "...", "description": "..." } }, then run this command again.`);
}
console.log(problems ? `install-pack: ${problems} problem(s)` : 'install-pack: ok');
process.exit(problems ? 1 : 0);
