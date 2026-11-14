#!/usr/bin/env node
// validate-pack.mjs: validator for a skills pack (SPEC packs/business-owner/SPEC.md §9).
//
// Usage: node scripts/validate-pack.mjs [--pack business-owner] [--strict]
//   --strict  a missing workspace template or instructions folder is a failure (use after the parallel branches merge);
//             without it those checks are reported as SKIPPED, never as passed.
//
// Checks (each violation prints one FAIL line; exit 1 if any):
//   pack.json   every source exists and holds a SKILL.md whose frontmatter name is the pack entry's name; targets are a
//               non-empty subset of claudeai, workspace, computer; no duplicate entry; transforms still apply to the
//               source (a remove-section heading or a strip-link target that no longer exists fails);
//               SPEC §4.1 placements: canvas-design workspace only, skill-router computer only, quebec-tax-reconstruction
//               absent.
//   noms-fr     every pack skill mapped; French names valid (^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$, no "--"), unique,
//               without "claude" or "anthropic", unaccented; descriptions 1-1024 characters without < or >;
//               gdt is "verifie" or "non verifie" (a "verifie" entry names its source URL); no entry outside the pack.
//   packaged    every skill is built for each of its targets into a temporary folder with the same code as
//               pack-skills.mjs and install-pack.mjs, then checked: frontmatter keys within name, description, license,
//               allowed-tools, metadata, compatibility; name valid and equal to the folder; description 1-1024 characters
//               without < or >; metadata a mapping; allowed-tools a string; every relative markdown link resolves inside
//               the skill. claudeai copies also: at most 20 files and 2 MB.
//   workspace   when packs/<pack>/workspace-template exists: every .claude/hooks/<file> or outils/<file> named in a hook
//               command of .claude/settings.json exists; every .claude/agents/*.md has name and description;
//               workspace-template/instructions-agent.md is byte-identical to instructions/instructions-agent.md.
// These are self-authored checks: they show the pack matches its spec, not that claude.ai or Claude Code accepts it.

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSkill, checkPackagedSkill, loadPack, NAME_RE, parseArgs, parseFrontmatter, relativeLinks, removeSection, repoRoot, TARGETS, walkFiles } from './lib/pack-common.mjs';

const args = parseArgs(process.argv.slice(2));
const packName = args.pack && args.pack !== true ? args.pack : 'business-owner';
const strict = Boolean(args.strict);
const fails = [];
const skipped = [];
const passed = [];
const fail = (m) => fails.push(m);

const { pack, noms, packDir } = loadPack(packName);

// ---------- pack.json ----------
const names = new Set();
for (const s of pack.skills) {
  if (names.has(s.name)) fail(`pack.json: duplicate entry ${s.name}`);
  names.add(s.name);
  if (!Array.isArray(s.targets) || !s.targets.length || s.targets.some((t) => !TARGETS.includes(t))) fail(`pack.json: ${s.name}: targets must be a non-empty subset of ${TARGETS.join(', ')}`);
  const skillFile = join(repoRoot, s.source || '', 'SKILL.md');
  if (!s.source || !existsSync(skillFile)) { fail(`pack.json: ${s.name}: source has no SKILL.md: ${s.source}`); continue; }
  const text = readFileSync(skillFile, 'utf8');
  const srcName = parseFrontmatter(text).data.get('name');
  if (srcName !== s.name) fail(`pack.json: ${s.name}: source frontmatter name is "${srcName}"`);
  for (const t of s.transforms || []) {
    if (t.type === 'remove-section' && !removeSection(parseFrontmatter(text).body, t.heading).removed) fail(`pack.json: ${s.name}: remove-section heading not found: ${t.heading}`);
    else if (t.type === 'strip-link' && !walkFiles(join(repoRoot, s.source)).filter((f) => f.endsWith('.md')).some((f) => relativeLinks(readFileSync(f, 'utf8')).some((l) => l.target === t.target))) fail(`pack.json: ${s.name}: strip-link target not linked in any markdown file of the source: ${t.target}`);
    else if (!['remove-section', 'strip-link', 'exclude'].includes(t.type)) fail(`pack.json: ${s.name}: unknown transform ${t.type}`);
  }
}
const expectTargets = { 'canvas-design': ['workspace'], 'skill-router': ['computer'] };
for (const [n, want] of Object.entries(expectTargets)) {
  const s = pack.skills.find((x) => x.name === n);
  if (s && JSON.stringify([...s.targets].sort()) !== JSON.stringify(want)) fail(`pack.json: ${n}: targets must be exactly ${want.join(', ')} (SPEC §4.1)`);
}
for (const n of ['quebec-tax-reconstruction']) if (names.has(n)) fail(`pack.json: ${n} is excluded by SPEC §4.1`);
const claudeai = pack.skills.filter((s) => s.targets.includes('claudeai')).length;
passed.push(`pack.json: ${pack.skills.length} skills (${claudeai} claudeai, ${pack.skills.filter((s) => s.targets.includes('workspace')).length} workspace, ${pack.skills.filter((s) => s.targets.includes('computer')).length} computer)`);

// ---------- noms-fr.json ----------
const nomSeen = new Map();
for (const s of pack.skills) {
  const m = noms[s.name];
  if (!m) { fail(`noms-fr.json: no entry for ${s.name}`); continue; }
  const nom = m.nom;
  if (typeof nom !== 'string' || !NAME_RE.test(nom)) fail(`noms-fr.json: ${s.name}: invalid name "${nom}"`);
  else {
    if (nom.includes('--')) fail(`noms-fr.json: ${s.name}: "${nom}" has consecutive hyphens`);
    if (/claude|anthropic/.test(nom)) fail(`noms-fr.json: ${s.name}: "${nom}" contains a reserved word`);
    if (nomSeen.has(nom)) fail(`noms-fr.json: ${s.name}: "${nom}" also used by ${nomSeen.get(nom)}`);
    nomSeen.set(nom, s.name);
  }
  if (/[^\x00-\x7f]/.test(String(nom))) fail(`noms-fr.json: ${s.name}: name must be unaccented`);
  const d = m.description;
  if (typeof d !== 'string' || !d.trim() || d.length > 1024) fail(`noms-fr.json: ${s.name}: description must be 1-1024 characters`);
  else if (/[<>]/.test(d)) fail(`noms-fr.json: ${s.name}: description contains < or >`);
  if (!['verifie', 'non verifie'].includes(m.gdt)) fail(`noms-fr.json: ${s.name}: gdt must be "verifie" or "non verifie"`);
  if (m.gdt === 'verifie' && !/^https:\/\/vitrinelinguistique\.oqlf\.gouv\.qc\.ca\/fiche-gdt\//.test(m.gdt_source || '')) fail(`noms-fr.json: ${s.name}: "verifie" needs gdt_source, the GDT page that was opened`);
}
for (const k of Object.keys(noms)) if (!names.has(k)) fail(`noms-fr.json: ${k} is not in pack.json`);
passed.push(`noms-fr.json: ${Object.keys(noms).length} entries, ${Object.values(noms).filter((m) => m.gdt === 'verifie').length} checked against the GDT`);

// ---------- packaged skills, every target ----------
const tmp = mkdtempSync(join(tmpdir(), 'validate-pack-'));
try {
  for (const target of TARGETS) {
    const out = join(tmp, target);
    let n = 0;
    for (const entry of pack.skills.filter((s) => s.targets.includes(target))) {
      if (!noms[entry.name]?.nom) continue; // already reported above
      try {
        const r = buildSkill({ entry, noms, pack, destParent: out });
        for (const p of checkPackagedSkill(r.dir, { sizeLimits: target === 'claudeai' })) fail(`packaged (${target}): ${p}`);
        n++;
      } catch (err) { fail(`packaged (${target}): ${entry.name}: ${err.message}`); }
    }
    passed.push(`packaged (${target}): ${n} skill(s) built and checked`);
  }
} finally { rmSync(tmp, { recursive: true, force: true }); }

// ---------- workspace template and instructions ----------
const wt = join(packDir, 'workspace-template');
const instr = join(packDir, 'instructions', 'instructions-agent.md');
const absent = (what) => (strict ? fail(`${what} is missing (--strict)`) : skipped.push(`${what} is absent on this branch`));
if (!existsSync(wt)) {
  absent('workspace-template/');
  skipped.push('hook scripts named in workspace-template/.claude/settings.json: not checked');
  skipped.push('workspace-template/.claude/agents/*.md frontmatter: not checked');
} else {
  const settingsFile = join(wt, '.claude', 'settings.json');
  if (!existsSync(settingsFile)) fail('workspace-template/.claude/settings.json is missing (the template is present)');
  else {
    let settings = null;
    try { settings = JSON.parse(readFileSync(settingsFile, 'utf8')); } catch (e) { fail(`workspace-template/.claude/settings.json: not valid JSON: ${e.message}`); }
    if (settings) {
      const commands = [];
      for (const groups of Object.values(settings.hooks || {})) for (const g of groups || []) for (const h of g.hooks || []) if (h.command) commands.push(h.command);
      let refs = 0;
      for (const c of commands) for (const m of c.matchAll(/(?:\.claude\/hooks|outils)\/[\w.-]+/g)) {
        refs++;
        if (!existsSync(join(wt, m[0]))) fail(`workspace-template: hook command names ${m[0]}, which does not exist`);
      }
      passed.push(`workspace-template: ${commands.length} hook command(s), ${refs} script reference(s) checked`);
    }
  }
  const agentsDir = join(wt, '.claude', 'agents');
  if (!existsSync(agentsDir)) fail('workspace-template/.claude/agents/ is missing (the template is present)');
  else {
    const files = readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const { data } = parseFrontmatter(readFileSync(join(agentsDir, f), 'utf8'));
      if (!data.get('name')) fail(`workspace-template/.claude/agents/${f}: no name`);
      if (!data.get('description')) fail(`workspace-template/.claude/agents/${f}: no description`);
    }
    passed.push(`workspace-template: ${files.length} agent role file(s) checked`);
  }
}
const wtInstr = join(wt, 'instructions-agent.md');
if (existsSync(wt) && !existsSync(wtInstr)) fail('workspace-template/instructions-agent.md is missing (the template is present)');
if (!existsSync(instr) || !existsSync(wtInstr)) {
  if (!existsSync(instr)) absent('instructions/instructions-agent.md');
  skipped.push('instructions-agent.md byte-identity: not checked');
} else if (!readFileSync(instr).equals(readFileSync(wtInstr))) fail('workspace-template/instructions-agent.md differs from instructions/instructions-agent.md');
else passed.push('instructions-agent.md: workspace copy is byte-identical');

for (const p of passed) console.log(`PASS ${p}`);
for (const s of skipped) console.log(`SKIPPED ${s}`);
for (const f of fails) console.log(`FAIL ${f}`);
console.log(`validate-pack: ${fails.length} violation(s), ${skipped.length} skipped${strict ? ' (strict)' : ''}`);
process.exit(fails.length ? 1 : 0);
