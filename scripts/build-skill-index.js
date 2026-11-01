#!/usr/bin/env node
// ==============================================================================
// build-skill-index.js
// Scans all SKILL.md files in skills/ and builds a compressed BM25/TF-IDF sparse
// vector index at skills/_index/skills-index.json, the Archive search path for
// collab-mcp's search_skills. Each entry carries tier 'core' (listed in core.json,
// installed by scripts/install-core.mjs) or 'archive' (searchable, never installed).
// It writes nothing outside the repo and generates no slash-command stubs (plan D1).
// Output is deterministic, so CI can run it with --check.
//
// Usage: node scripts/build-skill-index.js           # write the index
//        node scripts/build-skill-index.js --check   # exit 1 if the index is stale
// ==============================================================================

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const skillsRoot = join(repoRoot, 'skills');
const indexDir = join(skillsRoot, '_index');
const indexFile = join(indexDir, 'skills-index.json');

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'how', 'in', 'into', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their',
  'them', 'then', 'there', 'these', 'they', 'this', 'to', 'use', 'used', 'using',
  'when', 'where', 'which', 'who', 'will', 'with', 'you', 'your', 'skill', 'user',
  'asks', 'wants', 'should', 'can', 'any', 'all', 'also', 'even', 'dont', 'does',
  'not', 'about', 'like', 'such', 'more', 'other', 'new', 'need', 'needs', 'make',
]);

/** Lightweight stemmer for English technical terms to improve recall across inflections */
export function stemWord(word) {
  if (word.length <= 3) return word;
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('tion') && word.length > 6) return word.slice(0, -4) + 't';
  if (word.endsWith('ment') && word.length > 6) return word.slice(0, -4);
  if (word.endsWith('ness') && word.length > 6) return word.slice(0, -4);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

export function tokenize(text) {
  if (!text) return [];
  const raw = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));

  const out = [];
  for (const w of raw) {
    out.push(stemWord(w));
    if (w.includes('-')) {
      for (const part of w.split('-')) {
        if (part.length >= 2 && !STOPWORDS.has(part)) {
          out.push(stemWord(part));
        }
      }
    }
  }
  return out;
}

function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---')) {
    return { name: '', description: '', body: normalized };
  }
  const endIdx = normalized.indexOf('\n---', 3);
  if (endIdx === -1) {
    return { name: '', description: '', body: normalized };
  }
  const fm = normalized.slice(4, endIdx);
  const body = normalized.slice(endIdx + 4).trim();

  let name = '';
  let description = '';

  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  if (nameMatch) {
    name = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');
  }

  const lines = fm.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^description:\s*/.test(line)) {
      let val = line.replace(/^description:\s*/, '').trim();
      if (val === '>' || val === '|' || val === '>-' || val === '|-') {
        const descLines = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (/^[a-zA-Z0-9_-]+:/.test(lines[j])) break;
          descLines.push(lines[j].trim());
        }
        description = descLines.join(' ').trim();
      } else {
        const descLines = [val];
        for (let j = i + 1; j < lines.length; j++) {
          if (/^[a-zA-Z0-9_-]+:/.test(lines[j])) break;
          if (lines[j].startsWith('  ') || lines[j].startsWith('\t')) {
            descLines.push(lines[j].trim());
          } else {
            break;
          }
        }
        description = descLines.join(' ').replace(/^['"]|['"]$/g, '').trim();
      }
      break;
    }
  }

  return { name, description, body };
}

function sanitizeSlug(raw) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractHeadings(body) {
  const matches = [...body.matchAll(/^#{1,3}\s+(.+)$/gm)];
  return matches
    .slice(0, 8)
    .map((m) => m[1].replace(/[`*_~]/g, '').trim())
    .join(' ');
}

function summarize(description, body, fallbackName) {
  let src = description || '';
  if (!src) {
    const firstPara = body
      .split('\n\n')
      .map((p) => p.replace(/^#+\s*/, '').trim())
      .find((p) => p.length > 20 && !p.startsWith('```'));
    src = firstPara || `Execute the ${fallbackName} skill workflow.`;
  }
  src = src.replace(/\s+/g, ' ').trim();
  if (src.length <= 200) return src;
  const cut = src.slice(0, 197);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut) + '...';
}

const skillFiles = [];
function walkSkills(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_index' || entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSkills(full);
    } else if (entry.name === 'SKILL.md' || entry.name === 'skill.md') {
      skillFiles.push(full);
    }
  }
}

walkSkills(skillsRoot);
// Sort on forward-slash paths so the order (and the index bytes) match on Windows and in CI.
const fwd = (p) => p.replace(/\\/g, '/');
skillFiles.sort((a, b) => (fwd(a) < fwd(b) ? -1 : 1));

const parentDirsSet = new Set();
const slugCounts = new Map();
const rawSkills = [];

for (const filePath of skillFiles) {
  const skillDir = dirname(filePath);
  const parentDir = dirname(skillDir);
  parentDirsSet.add(parentDir);

  const relFile = relative(skillsRoot, filePath).replace(/\\/g, '/');
  const parts = relFile.split('/');
  const folderName = basename(skillDir);
  const category = parts.length > 2 ? parts[0] : 'General';
  const subcategory = parts.length > 3 ? parts[1] : '';

  const content = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const { name, description, body } = parseFrontmatter(content);
  const headings = extractHeadings(body);

  let baseSlug = sanitizeSlug(folderName || name);
  if (!baseSlug) baseSlug = sanitizeSlug(name) || 'skill';

  const count = slugCounts.get(baseSlug) || 0;
  slugCounts.set(baseSlug, count + 1);
  const slug = count === 0 ? baseSlug : `${sanitizeSlug(subcategory || category)}-${baseSlug}`;

  const displayName = name || folderName;
  const summary = summarize(description, body, displayName);

  // Build weighted term frequency map for BM25 / Cosine similarity
  const tf = {};
  const addTokens = (text, weight) => {
    for (const tok of tokenize(text)) {
      tf[tok] = (tf[tok] || 0) + weight;
    }
  };

  addTokens(slug.replace(/-/g, ' '), 6);
  addTokens(displayName, 5);
  addTokens(`${category} ${subcategory}`, 2);
  addTokens(description, 3);
  addTokens(headings, 1);

  rawSkills.push({
    slug,
    name: displayName,
    category,
    subcategory,
    relPath: relFile,
    summary,
    tf,
  });
}

function basename(p) {
  const norm = p.replace(/\\/g, '/');
  const idx = norm.lastIndexOf('/');
  return idx === -1 ? norm : norm.slice(idx + 1);
}

// Compute IDF across corpus and L2-normalized sparse vectors for fast hybrid search
const N = rawSkills.length;
const df = {};
for (const s of rawSkills) {
  for (const term of Object.keys(s.tf)) {
    df[term] = (df[term] || 0) + 1;
  }
}

const idf = {};
for (const [term, count] of Object.entries(df)) {
  // Smooth BM25 IDF rounded to 3 decimals to keep index compact
  idf[term] = Number((Math.log(1 + (N - count + 0.5) / (count + 0.5))).toFixed(3));
}

const indexedSkills = rawSkills.map((s) => {
  // Prune ultra-low-information terms if a skill has > 35 terms to keep JSON small
  const entries = Object.entries(s.tf)
    .map(([term, weight]) => ({ term, weight, score: weight * (idf[term] || 1) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 32);

  let normSq = 0;
  const compactTerms = {};
  for (const { term, score } of entries) {
    const val = Number(score.toFixed(2));
    compactTerms[term] = val;
    normSq += val * val;
  }

  return {
    slug: s.slug,
    name: s.name,
    category: s.category,
    subcategory: s.subcategory,
    relPath: s.relPath,
    summary: s.summary,
    norm: Number(Math.sqrt(normSq).toFixed(3)) || 1,
    terms: compactTerms,
  };
});

const coreFile = join(repoRoot, 'core.json');
const coreNames = new Set(existsSync(coreFile) ? JSON.parse(readFileSync(coreFile, 'utf8')).skills.map((m) => m.name) : []);
for (const s of indexedSkills) s.tier = coreNames.has(s.name) || coreNames.has(s.slug) ? 'core' : 'archive';

const indexPayload = {
  version: '1.1.0',
  totalSkills: indexedSkills.length,
  coreSkills: indexedSkills.filter((s) => s.tier === 'core').length,
  skills: indexedSkills,
};
const out = JSON.stringify(indexPayload);
if (process.argv.includes('--check')) {
  const current = existsSync(indexFile) ? readFileSync(indexFile, 'utf8') : '';
  if (current !== out) {
    console.error(`skills index is stale: run node scripts/build-skill-index.js and commit skills/_index/skills-index.json`);
    process.exit(1);
  }
  console.log(`skills index up to date (${indexedSkills.length} skills, ${indexPayload.coreSkills} core)`);
} else {
  mkdirSync(indexDir, { recursive: true });
  writeFileSync(indexFile, out, 'utf8');
  console.log(`Wrote index (${indexedSkills.length} skills, ${indexPayload.coreSkills} core) -> ${indexFile}`);
}
