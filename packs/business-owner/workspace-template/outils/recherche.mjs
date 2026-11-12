#!/usr/bin/env node
// recherche.mjs: keyless search over the workspace's documents (connaissances/ and projets/, .md and .txt).
// Okapi BM25 over title + headings + body, accent-insensitive, with French and English stopwords and a light
// stemmer. Adapted from scripts/build-skill-index.js and scripts/search-skills.mjs in
// github.com/kazaxlabs/curated-skills (same tokenizer idea, field weights and prefix fallback).
// Node built-ins only: no npm install, no API key.
//
// Usage: node outils/recherche.mjs "<requête>" [--top N] [--json] [--index] [--racine <dossier>]
//   --top N      number of results (default 5)
//   --json       machine-readable output
//   --index      (re)write the cache .claude/cache/recherche.json (keyed by file mtime and size); works with or
//                without a query. Without --index an existing cache is still read for unchanged files.
//   --racine D   search D/connaissances and D/projets instead of this workspace
// Exit: 0 with results, 1 with none, 2 on bad arguments.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKSPACE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEARCH_DIRS = ['connaissances', 'projets'];
const SKIP_DIRS = new Set(['node_modules', '.git', '_modele']);
const EXTENSIONS = /\.(md|markdown|txt)$/i;
const MAX_BYTES = 2 * 1024 * 1024;
const CACHE_VERSION = 1;
const K1 = 1.2;
const B = 0.75;
const WEIGHTS = { title: 3, path: 2, heading: 2, body: 1 };

const STOPWORDS = new Set([
  // French (accents already removed)
  'au', 'aux', 'avec', 'ce', 'ces', 'cet', 'cette', 'dans', 'de', 'des', 'du', 'elle', 'elles', 'en', 'et', 'il', 'ils',
  'je', 'la', 'le', 'les', 'leur', 'leurs', 'lui', 'ma', 'mais', 'me', 'mes', 'moi', 'mon', 'ne', 'nos', 'notre', 'nous',
  'on', 'ou', 'par', 'pas', 'pour', 'qu', 'que', 'qui', 'quoi', 'sa', 'se', 'ses', 'si', 'son', 'sont', 'sur', 'ta', 'te',
  'tes', 'ton', 'tu', 'un', 'une', 'vos', 'votre', 'vous', 'est', 'etre', 'ete', 'avoir', 'ont', 'plus', 'moins', 'tout',
  'tous', 'toute', 'toutes', 'aussi', 'entre', 'vers', 'chez', 'lors', 'dont', 'comme', 'donc', 'car', 'ni', 'sans',
  'sous', 'cela', 'ceci', 'ca', 'fait', 'faire', 'peut', 'doit', 'quand', 'comment',
  // English (from build-skill-index.js, trimmed)
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'how', 'in', 'into', 'is', 'it', 'its',
  'of', 'on', 'or', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'to', 'use', 'used',
  'using', 'when', 'where', 'which', 'who', 'will', 'with', 'you', 'your', 'can', 'any', 'all', 'also', 'not', 'about',
]);

/** Lowercase, fold accents (é → e), ligatures (œ → oe). */
function fold(text) {
  return text
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Light stemmer, applied identically to documents and queries: plural, then suffixes, then a final -e. */
function stem(word) {
  let w = word;
  if (w.length <= 3) return w;
  if (w.endsWith('eaux')) w = w.slice(0, -1);
  else if (w.endsWith('ies') && w.length > 4) w = `${w.slice(0, -3)}y`;
  else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) w = w.slice(0, -1);
  if (w.endsWith('ing') && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith('tion') && w.length > 6) w = w.slice(0, -3);
  else if (w.endsWith('ment') && w.length > 6) w = w.slice(0, -4);
  else if (w.endsWith('ness') && w.length > 6) w = w.slice(0, -4);
  else if (w.endsWith('ed') && w.length > 4) w = w.slice(0, -2);
  if (w.endsWith('e') && w.length > 4) w = w.slice(0, -1);
  return w;
}

function tokenize(text) {
  if (!text) return [];
  return fold(text)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    .map(stem);
}

function parseArgs(argv) {
  const opts = { top: 5, json: false, index: false, racine: WORKSPACE, query: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--index') opts.index = true;
    else if (a === '--top') opts.top = Number(argv[++i]);
    else if (a === '--racine') opts.racine = resolve(argv[++i] || '');
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a.startsWith('--')) opts.bad = a;
    else opts.query.push(a);
  }
  opts.query = opts.query.join(' ').trim();
  return opts;
}

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      walk(full, out);
    } else if (e.isFile() && EXTENSIONS.test(e.name)) {
      out.push(full);
    }
  }
}

function readDoc(file) {
  const buf = readFileSync(file);
  if (buf.subarray(0, 8192).includes(0)) return null; // binary
  return buf.toString('utf8').replace(/\r\n/g, '\n');
}

/** Builds the weighted term-frequency entry for one document. */
function analyse(rel, text) {
  const tf = {};
  let len = 0;
  const add = (str, weight) => {
    for (const t of tokenize(str)) {
      tf[t] = (tf[t] || 0) + weight;
      len += weight;
    }
  };
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/<!--[\s\S]*?-->/g, ' ');
  const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => m[1]);
  const fileName = rel.split('/').pop().replace(EXTENSIONS, '').replace(/[-_]+/g, ' ');
  const title = (body.match(/^#\s+(.+)$/m) || [])[1] || fileName;
  add(title, WEIGHTS.title);
  add(rel.replace(EXTENSIONS, '').replace(/[/_-]+/g, ' '), WEIGHTS.path);
  add(headings.join(' '), WEIGHTS.heading);
  add(body, WEIGHTS.body);
  return { title: title.trim(), tf, len };
}

function loadCache(file) {
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return data.version === CACHE_VERSION && data.docs ? data.docs : {};
  } catch {
    return {};
  }
}

function buildCorpus(root, cache) {
  const files = [];
  for (const d of SEARCH_DIRS) walk(join(root, d), files);
  const docs = [];
  const fresh = {};
  for (const file of files) {
    let st;
    try {
      st = statSync(file);
    } catch {
      continue;
    }
    if (st.size > MAX_BYTES) continue;
    const rel = relative(root, file).replace(/\\/g, '/');
    const hit = cache[rel];
    if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) {
      docs.push({ rel, abs: file, ...hit });
      fresh[rel] = hit;
      continue;
    }
    let text;
    try {
      text = readDoc(file);
    } catch {
      continue;
    }
    if (text === null) continue;
    const entry = { mtimeMs: st.mtimeMs, size: st.size, ...analyse(rel, text) };
    docs.push({ rel, abs: file, ...entry });
    fresh[rel] = entry;
  }
  return { docs, fresh };
}

function search(docs, query) {
  const qTerms = [...new Set(tokenize(query))];
  if (!qTerms.length || !docs.length) return { qTerms, idf: {}, results: [] };
  const N = docs.length;
  const avgdl = docs.reduce((s, d) => s + d.len, 0) / N || 1;
  const df = {};
  for (const d of docs) for (const t of Object.keys(d.tf)) df[t] = (df[t] || 0) + 1;
  const idfOf = (t) => Math.log(1 + (N - (df[t] || 0) + 0.5) / ((df[t] || 0) + 0.5));
  const idf = Object.fromEntries(qTerms.map((t) => [t, idfOf(t)]));
  const results = [];
  for (const d of docs) {
    const norm = K1 * (1 - B + (B * d.len) / avgdl);
    let score = 0;
    for (const q of qTerms) {
      let f = d.tf[q] || 0;
      let factor = 1;
      let w = idf[q];
      if (!f && q.length >= 5) {
        // Prefix fallback (as in collab-mcp's search_skills): soumis ~ soumission, renov ~ renovation.
        for (const [t, tf] of Object.entries(d.tf)) {
          if (t.length >= 5 && (t.startsWith(q) || q.startsWith(t))) {
            f = tf;
            factor = 0.5;
            w = idfOf(t);
            break;
          }
        }
      }
      if (f) score += factor * w * ((f * (K1 + 1)) / (f + norm));
    }
    if (score > 0) results.push({ doc: d, score });
  }
  results.sort((a, b) => b.score - a.score || a.doc.rel.localeCompare(b.doc.rel));
  return { qTerms, idf, results };
}

/** Best matching line: the line whose distinct query terms carry the most idf. */
function bestLine(abs, qTerms, idf) {
  let text;
  try {
    text = readDoc(abs);
  } catch {
    return null;
  }
  if (!text) return null;
  let best = null;
  text.split('\n').forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const toks = new Set(tokenize(trimmed));
    let s = 0;
    for (const q of qTerms) {
      if (toks.has(q)) s += idf[q];
      else if (q.length >= 5 && [...toks].some((t) => t.length >= 5 && (t.startsWith(q) || q.startsWith(t)))) s += idf[q] / 2;
    }
    if (s > 0 && (!best || s > best.s)) best = { s, line: i + 1, text: trimmed };
  });
  if (!best) return null;
  const clipped = best.text.length > 160 ? `${best.text.slice(0, 157)}...` : best.text;
  return { ligne: best.line, extrait: clipped };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || opts.bad || (!opts.query && !opts.index) || !(opts.top > 0)) {
    console.error('usage : node outils/recherche.mjs "<requête>" [--top N] [--json] [--index] [--racine <dossier>]');
    return 2;
  }
  const cacheFile = join(opts.racine, '.claude', 'cache', 'recherche.json');
  const { docs, fresh } = buildCorpus(opts.racine, loadCache(cacheFile));
  if (opts.index) {
    try {
      mkdirSync(dirname(cacheFile), { recursive: true });
      writeFileSync(cacheFile, JSON.stringify({ version: CACHE_VERSION, docs: fresh }));
      if (!opts.json) console.log(`Index écrit : ${docs.length} document(s) -> ${relative(opts.racine, cacheFile).replace(/\\/g, '/')}`);
    } catch (err) {
      console.error(`Index non écrit : ${err.message}`);
    }
    if (!opts.query) return 0;
  }
  const { qTerms, idf, results } = search(docs, opts.query);
  const top = results.slice(0, opts.top).map((r) => ({
    chemin: r.doc.rel,
    titre: r.doc.title,
    score: Number(r.score.toFixed(3)),
    ...(bestLine(r.doc.abs, qTerms, idf) || { ligne: null, extrait: null }),
  }));
  if (opts.json) {
    console.log(JSON.stringify({ requete: opts.query, documents: docs.length, resultats: top }, null, 1));
  } else if (!top.length) {
    console.log(`Aucun résultat pour « ${opts.query} » (${docs.length} document(s) cherché(s) dans ${SEARCH_DIRS.join('/ et ')}/).`);
  } else {
    console.log(`${top.length} résultat(s) pour « ${opts.query} » (${docs.length} document(s)) :`);
    top.forEach((r, i) => {
      console.log(`${i + 1}. ${r.chemin}  (score ${r.score})`);
      if (r.ligne) console.log(`   l.${r.ligne} : ${r.extrait}`);
    });
  }
  return top.length ? 0 : 1;
}

process.exitCode = main();
