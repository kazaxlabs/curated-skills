#!/usr/bin/env node
// build-skill-map.mjs — scans a skills library's SKILL.md frontmatter and maps stack
// facet values to skill names by keyword match. Output: skill-map.json beside this skill.
//
// Usage: node build-skill-map.mjs [--skills <dir>] [--out skill-map.json] [--max 6]
// Default skills dir: C:\Curated_Skills\skills (override with --skills).
// A listed skill is a hypothesis to load for REVIEW items, never an authority.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const skillsDir = opt('--skills', 'C:\\Curated_Skills\\skills');
const out = opt('--out', path.join(here, '..', 'skill-map.json'));
const max = Number(opt('--max', 6));

// facet value → keywords (lowercase, matched against name + description)
const KEYWORDS = {
  'hosting=firebase': ['firebase'], 'database=firestore': ['firestore', 'firebase'], 'auth=firebase-auth': ['firebase auth', 'firebase'],
  'compute=firebase-functions': ['cloud functions', 'firebase functions', 'firebase'], 'hosting=vercel': ['vercel'], 'hosting=netlify': ['netlify'],
  'hosting=fly': ['fly.io'], 'hosting=cloudflare-workers': ['cloudflare workers'], 'hosting=aws-serverless-framework': ['serverless', 'aws lambda'], 'hosting=aws-sam': ['aws sam', 'aws serverless'],
  'hosting=app-engine': ['app engine', 'gcp'], 'framework=nextjs': ['next.js', 'nextjs'], 'framework=react': ['react '], 'framework=vite': ['vite'],
  'framework=express': ['express'], 'framework=hono': ['hono'], 'framework=fastify': ['fastify'], 'framework=nestjs': ['nestjs'], 'framework=django': ['django'],
  'framework=flask': ['flask'], 'framework=fastapi': ['fastapi'], 'framework=rails': ['rails'], 'framework=sveltekit': ['sveltekit', 'svelte'], 'framework=nuxt': ['nuxt'],
  'framework=angular': ['angular'], 'framework=astro': ['astro'], 'framework=remix': ['remix'], 'database=postgres': ['postgres'], 'database=prisma': ['prisma'],
  'database=drizzle': ['drizzle'], 'database=mongodb': ['mongodb', 'mongo'], 'database=redis': ['redis'], 'database=supabase': ['supabase'], 'database=mysql': ['mysql'],
  'auth=nextauth': ['next-auth', 'auth.js', 'nextauth'], 'auth=clerk': ['clerk'], 'auth=auth0': ['auth0'], 'auth=supabase-auth': ['supabase auth'], 'auth=*': ['authentication', 'authorization', 'auth implementation'],
  'ci=github-actions': ['github actions', 'gha'], 'ci=gitlab-ci': ['gitlab ci'], 'ci=circleci': ['circleci'], 'ci=cloud-build': ['cloud build'],
  'iac=terraform': ['terraform'], 'iac=pulumi': ['pulumi'], 'iac=aws-cdk': ['cdk'], 'container=docker': ['docker'], 'orchestration=kubernetes': ['kubernetes', 'k8s'], 'orchestration=helm': ['helm'],
  'runtime=node': ['node.js', 'nodejs'], 'runtime=python': ['python'], 'runtime=go': ['golang', ' go '], 'runtime=ruby': ['ruby'], 'runtime=jvm': ['java', 'kotlin'], 'runtime=dotnet': ['.net', 'dotnet', 'c#'],
  'language=typescript': ['typescript'], 'test_tool=playwright': ['playwright'], 'test_tool=cypress': ['cypress'], 'test_tool=vitest': ['vitest'], 'test_tool=jest': ['jest'], 'test_tool=pytest': ['pytest'],
  'always': ['deployment', 'secrets management', 'security audit', 'ci/cd', 'rollback'],
};
const GENERIC_PENALTY = ['automation', 'marketing', 'seo', 'sales'];

const skills = [];
const walk = (d) => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of es) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p); } else if (e.name === 'SKILL.md') {
    const t = fs.readFileSync(p, 'utf8'); const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---/); if (!m) continue;
    const name = (m[1].match(/^name:\s*["']?([^"'\r\n]+)/m) || [])[1]?.trim(); const desc = (m[1].match(/^description:\s*["']?([\s\S]*?)["']?\s*$/m) || [])[1] || '';
    if (name) skills.push({ name, text: (name + ' ' + desc).toLowerCase(), rel: path.relative(skillsDir, p).split(path.sep).join('/') }); } } };
walk(skillsDir);

const map = {};
for (const [facet, kws] of Object.entries(KEYWORDS)) {
  const scored = skills.filter(s => s.name !== 'pre-deployment-review').map(s => { let score = 0; for (const k of kws) { if (s.name.toLowerCase().includes(k.trim())) score += 3; if (s.text.includes(k)) score += 1; } if (score > 0 && GENERIC_PENALTY.some(g => s.name.includes(g))) score -= 2; if (score > 0 && /deploy|production|security|pipeline|best-practices/.test(s.name)) score += 1; return { s, score }; })
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.s.name.localeCompare(b.s.name)).slice(0, max);
  if (scored.length) map[facet] = scored.map(x => ({ skill: x.s.name, path: x.s.rel, score: x.score }));
}
const result = { generated_at: new Date().toISOString(), skills_dir: skillsDir, skills_scanned: skills.length, note: 'Skills are hypotheses for REVIEW items, never authorities (AGENTS.md §9). Load only the entries for facets present in the stack profile.', map };
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.error(`scanned ${skills.length} skills → ${Object.keys(map).length} facets → ${out}`);
