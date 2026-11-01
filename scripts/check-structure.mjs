#!/usr/bin/env node
// check-structure.mjs — structural gate for skills/ (plan D7).
// Exit 0 when every rule holds, 1 otherwise. Prints one line per violation.
//
// Rules
//  1. skills/ root holds only numbered category folders ("N. Name") and the generated _index/ folder.
//  2. A skill lives at skills/<category>/<subcategory>/<name>/SKILL.md, or one level deeper as a member
//     of a skill family (a depth-3 skill folder that contains sub-skills).
//  3. Category and subcategory folders hold no loose files except README.md.
//  4. A skill's frontmatter `name` equals its folder name.
//  5. No two skills share a frontmatter name, and no two SKILL.md files are byte-identical.
//  6. Every skill has a non-placeholder description of 1-1024 characters (open Agent Skills limit).

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const skillsRoot = join(repoRoot, 'skills');
const CATEGORY = /^\d+\. .+$/;
const ROOT_ALLOWED = new Set(['_index']);
const LOOSE_ALLOWED = new Set(['README.md']);
const PLACEHOLDER = /one sentence - what this skill does/i;

const violations = [];
const fail = (msg) => violations.push(msg);
const rel = (p) => relative(repoRoot, p).split(sep).join('/');
const isDir = (p) => statSync(p).isDirectory();

function frontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  return end === -1 ? null : text.slice(3, end);
}

function field(fm, key) {
  // Handles plain, quoted, and folded/literal (>-, |) scalars.
  const lines = fm.split(/\r?\n/);
  const i = lines.findIndex((l) => new RegExp(`^${key}:`).test(l));
  if (i === -1) return null;
  let value = lines[i].slice(key.length + 1).trim();
  if (/^[>|][-+]?$/.test(value)) {
    const body = [];
    for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) body.push(lines[j].trim());
    value = body.join(' ');
  }
  return value.replace(/^["']|["']$/g, '').trim();
}

// Rule 1
for (const entry of readdirSync(skillsRoot)) {
  const p = join(skillsRoot, entry);
  if (!isDir(p)) fail(`root file not allowed: ${rel(p)}`);
  else if (!CATEGORY.test(entry) && !ROOT_ALLOWED.has(entry)) fail(`root folder is not a numbered category: ${rel(p)}`);
}

const skills = [];
const names = new Map();
const hashes = new Map();

for (const category of readdirSync(skillsRoot).filter((e) => CATEGORY.test(e))) {
  const catPath = join(skillsRoot, category);
  for (const sub of readdirSync(catPath)) {
    const subPath = join(catPath, sub);
    if (!isDir(subPath)) {
      if (!LOOSE_ALLOWED.has(sub)) fail(`loose file in category: ${rel(subPath)}`); // Rule 3
      continue;
    }
    if (readdirSync(subPath).includes('SKILL.md')) {
      fail(`skill directly under category, needs a subcategory: ${rel(subPath)}`); // Rule 2
      continue;
    }
    for (const name of readdirSync(subPath)) {
      const skillPath = join(subPath, name);
      if (!isDir(skillPath)) {
        if (!LOOSE_ALLOWED.has(name)) fail(`loose file in subcategory: ${rel(skillPath)}`); // Rule 3
        continue;
      }
      const entries = readdirSync(skillPath);
      if (!entries.includes('SKILL.md')) {
        fail(`folder without SKILL.md at skill depth: ${rel(skillPath)}`); // Rule 2
        continue;
      }
      skills.push(skillPath);
      // Rule 2: one level of family members allowed
      for (const child of entries) {
        const childPath = join(skillPath, child);
        if (isDir(childPath) && readdirSync(childPath).includes('SKILL.md')) {
          skills.push(childPath);
          for (const grand of readdirSync(childPath)) {
            const g = join(childPath, grand);
            if (isDir(g) && readdirSync(g).includes('SKILL.md')) fail(`skill nested deeper than one family level: ${rel(g)}`);
          }
        }
      }
    }
  }
}

for (const skillPath of skills) {
  const file = join(skillPath, 'SKILL.md');
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const folder = skillPath.split(sep).pop();
  const fm = frontmatter(text);
  if (!fm) { fail(`no frontmatter: ${rel(file)}`); continue; }
  const name = field(fm, 'name');
  const description = field(fm, 'description');
  if (name !== folder) fail(`name "${name}" != folder "${folder}": ${rel(file)}`); // Rule 4
  if (names.has(name)) fail(`duplicate name "${name}": ${rel(file)} and ${names.get(name)}`); // Rule 5
  else names.set(name, rel(file));
  const hash = createHash('sha256').update(text).digest('hex');
  if (hashes.has(hash)) fail(`identical SKILL.md: ${rel(file)} and ${hashes.get(hash)}`); // Rule 5
  else hashes.set(hash, rel(file));
  if (!description) fail(`missing description: ${rel(file)}`); // Rule 6
  else if (description.length > 1024) fail(`description over 1024 chars (${description.length}): ${rel(file)}`);
  else if (PLACEHOLDER.test(description)) fail(`placeholder description: ${rel(file)}`);
}

for (const v of violations) console.log(`FAIL ${v}`);
console.log(`check-structure: ${skills.length} skills, ${violations.length} violation(s)`);
process.exit(violations.length ? 1 : 0);
