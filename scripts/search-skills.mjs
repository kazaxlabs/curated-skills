#!/usr/bin/env node
// search-skills.mjs — search the whole skill library (Core and Archive) from a shell, for agents whose
// collab MCP server is not connected. Same index and ranking as collab-mcp's search_skills tool.
//
// Usage: node scripts/search-skills.mjs "<task keywords or skill name>" [--limit 5] [--category <name>]
// Prints JSON: { totalIndexed, matches: [{ name, tier, command, summary, skillPath, score, ... }] }.
// Exit: 0 with matches, 1 with none, 2 on bad arguments or a missing build.

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i === -1 ? undefined : args[i + 1]; };
const query = args.filter((a, i) => !a.startsWith('--') && !['--limit', '--category'].includes(args[i - 1])).join(' ').trim();
if (!query) { console.error('usage: node scripts/search-skills.mjs "<query>" [--limit 5] [--category <name>]'); process.exit(2); }

const repoRoot = resolve(import.meta.dirname, '..');
const lib = join(repoRoot, 'collab-mcp', 'dist', 'skills.js');
if (!existsSync(lib)) { console.error(`missing ${lib}: run npm run build in collab-mcp`); process.exit(2); }
const { searchSkills } = await import(pathToFileURL(lib).href);
const result = searchSkills({ query, limit: Number(opt('--limit') || 5), category: opt('--category') });
console.log(JSON.stringify(result, null, 1));
process.exit(result.matches.length ? 0 : 1);
