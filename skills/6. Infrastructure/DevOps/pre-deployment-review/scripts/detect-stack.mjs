#!/usr/bin/env node
// detect-stack.mjs — read-only stack detector for pre-deployment-review.
// Reads manifest files only (never executes project code). Emits a stack profile
// where every facet value carries its evidence (file + detail).
//
// Usage: node detect-stack.mjs <projectDir> [--out profile.json] [--quiet]
// Exit: 0 profile written; 2 usage/IO error.

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--'));
const outIdx = args.indexOf('--out');
const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
const quiet = args.includes('--quiet');
if (!dir || !fs.existsSync(dir)) {
  console.error('usage: detect-stack.mjs <projectDir> [--out profile.json]');
  process.exit(2);
}
const root = path.resolve(dir);

// ---------- helpers ----------
const profile = { root, generated_at: new Date().toISOString(), facets: {}, manifests: [] };
const add = (facet, value, file, detail) => {
  const list = (profile.facets[facet] ||= []);
  let entry = list.find(e => e.value === value);
  if (!entry) { entry = { value, evidence: [] }; list.push(entry); }
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (!entry.evidence.some(e => e.file === rel && e.detail === detail)) entry.evidence.push({ file: rel, detail });
};
const exists = p => fs.existsSync(path.join(root, p));
const read = p => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const readJson = p => { const t = read(p); if (t == null) return null; try { return JSON.parse(t); } catch { return null; } };
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.venv', 'venv', '__pycache__', '.turbo', 'coverage', '.firebase', 'out', 'target', 'vendor', '.claude', '.worktrees', '.cache']);

// Candidate package roots: root + conventional subfolders, depth ≤ 2.
function walk(d, depth, acc) {
  if (depth > 2) return;
  let entries;
  try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  acc.push(d);
  for (const e of entries) {
    if (e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith('.')) walk(path.join(d, e.name), depth + 1, acc);
  }
}
const dirs = []; walk(root, 0, dirs);

// ---------- dependency tables ----------
const NODE_FRAMEWORKS = {
  next: 'nextjs', react: 'react', vue: 'vue', nuxt: 'nuxt', '@angular/core': 'angular', svelte: 'svelte', '@sveltejs/kit': 'sveltekit',
  astro: 'astro', '@remix-run/react': 'remix', express: 'express', hono: 'hono', fastify: 'fastify', '@nestjs/core': 'nestjs', koa: 'koa',
  vite: 'vite', 'firebase-functions': 'firebase-functions', 'firebase-admin': 'firebase-admin', firebase: 'firebase-web-sdk',
};
const NODE_DB = { pg: 'postgres', postgres: 'postgres', '@prisma/client': 'prisma', 'drizzle-orm': 'drizzle', mysql2: 'mysql', mongoose: 'mongodb', mongodb: 'mongodb', ioredis: 'redis', redis: 'redis', '@supabase/supabase-js': 'supabase', '@google-cloud/firestore': 'firestore', '@neondatabase/serverless': 'postgres' };
const NODE_AUTH = { 'next-auth': 'nextauth', '@auth/core': 'authjs', '@clerk/nextjs': 'clerk', '@clerk/clerk-react': 'clerk', '@auth0/auth0-react': 'auth0', 'express-oauth2-jwt-bearer': 'auth0', passport: 'passport', 'firebase-admin': 'firebase-auth', firebase: 'firebase-auth', '@supabase/supabase-js': 'supabase-auth', lucia: 'lucia', 'better-auth': 'better-auth' };
const NODE_TEST = { vitest: 'vitest', jest: 'jest', mocha: 'mocha', '@playwright/test': 'playwright', cypress: 'cypress', '@firebase/rules-unit-testing': 'firebase-rules-unit-testing' };
const PY_FRAMEWORKS = { django: 'django', flask: 'flask', fastapi: 'fastapi', starlette: 'starlette' };
const PY_DB = { psycopg2: 'postgres', 'psycopg2-binary': 'postgres', psycopg: 'postgres', sqlalchemy: 'sqlalchemy', pymongo: 'mongodb', redis: 'redis', 'mysqlclient': 'mysql' };

// ---------- node ----------
for (const d of dirs) {
  const pj = path.join(d, 'package.json');
  const pkg = readJson(pj);
  if (!pkg) continue;
  profile.manifests.push(path.relative(root, pj).split(path.sep).join('/'));
  add('runtime', 'node', pj, 'package.json present');
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  for (const [dep, label] of Object.entries(NODE_FRAMEWORKS)) if (deps[dep]) add('framework', label, pj, `${dep}@${deps[dep]}`);
  for (const [dep, label] of Object.entries(NODE_DB)) if (deps[dep]) add('database', label, pj, `${dep}@${deps[dep]}`);
  for (const [dep, label] of Object.entries(NODE_AUTH)) if (deps[dep]) add('auth', label, pj, `${dep}@${deps[dep]}`);
  for (const [dep, label] of Object.entries(NODE_TEST)) if (deps[dep]) add('test_tool', label, pj, `${dep}@${deps[dep]}`);
  if (deps.typescript) add('language', 'typescript', pj, `typescript@${deps.typescript}`); else add('language', 'javascript', pj, 'no typescript dependency');
  if (pkg.engines?.node) add('node_version', String(pkg.engines.node), pj, 'engines.node');
  if (pkg.workspaces) add('monorepo', 'npm-workspaces', pj, 'workspaces field');
  const scripts = pkg.scripts || {};
  for (const s of ['typecheck', 'lint', 'test', 'build', 'test:rules', 'test:e2e']) if (scripts[s]) add('script', s, pj, scripts[s]);
  for (const [lock, pm] of [['package-lock.json', 'npm'], ['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['bun.lockb', 'bun'], ['bun.lock', 'bun']]) {
    if (fs.existsSync(path.join(d, lock))) add('package_manager', pm, path.join(d, lock), 'lockfile');
  }
}
if (exists('.nvmrc')) add('node_version', read(path.join(root, '.nvmrc')).trim(), path.join(root, '.nvmrc'), '.nvmrc');
if (exists('pnpm-workspace.yaml')) add('monorepo', 'pnpm-workspaces', path.join(root, 'pnpm-workspace.yaml'), 'present');
if (exists('turbo.json')) add('monorepo', 'turborepo', path.join(root, 'turbo.json'), 'present');

// ---------- python ----------
for (const d of dirs) {
  const py = path.join(d, 'pyproject.toml'); const req = path.join(d, 'requirements.txt');
  const txt = (read(py) || '') + '\n' + (read(req) || '');
  if (!txt.trim()) continue;
  const f = fs.existsSync(py) ? py : req;
  profile.manifests.push(path.relative(root, f).split(path.sep).join('/'));
  add('runtime', 'python', f, 'manifest present');
  const low = txt.toLowerCase();
  for (const [dep, label] of Object.entries(PY_FRAMEWORKS)) if (new RegExp(`(^|["'\\s])${dep}([\\s=<>~\\[!"']|$)`, 'm').test(low)) add('framework', label, f, dep);
  for (const [dep, label] of Object.entries(PY_DB)) if (low.includes(dep)) add('database', label, f, dep);
  if (/django/.test(low)) add('auth', 'django-auth', f, 'django present (contrib.auth assumed)');
  if (/pytest/.test(low)) add('test_tool', 'pytest', f, 'pytest');
  if (fs.existsSync(path.join(d, 'manage.py'))) add('framework', 'django', path.join(d, 'manage.py'), 'manage.py');
}
// ---------- go / ruby / jvm / dotnet ----------
for (const d of dirs) {
  if (fs.existsSync(path.join(d, 'go.mod'))) add('runtime', 'go', path.join(d, 'go.mod'), 'go.mod');
  if (fs.existsSync(path.join(d, 'Gemfile'))) { add('runtime', 'ruby', path.join(d, 'Gemfile'), 'Gemfile'); if (/rails/i.test(read(path.join(d, 'Gemfile')) || '')) add('framework', 'rails', path.join(d, 'Gemfile'), 'rails gem'); }
  if (fs.existsSync(path.join(d, 'pom.xml')) || fs.existsSync(path.join(d, 'build.gradle')) || fs.existsSync(path.join(d, 'build.gradle.kts'))) add('runtime', 'jvm', d, 'maven/gradle build file');
  try { for (const f of fs.readdirSync(d)) if (f.endsWith('.csproj')) add('runtime', 'dotnet', path.join(d, f), 'csproj'); } catch {}
}

// ---------- hosting / cloud ----------
if (exists('firebase.json')) {
  const fj = readJson(path.join(root, 'firebase.json')) || {};
  add('hosting', 'firebase', path.join(root, 'firebase.json'), 'firebase.json');
  if (fj.firestore) add('database', 'firestore', path.join(root, 'firebase.json'), 'firestore block');
  if (fj.functions) { add('compute', 'firebase-functions', path.join(root, 'firebase.json'), 'functions block'); const r = Array.isArray(fj.functions) ? fj.functions[0]?.runtime : fj.functions.runtime; if (r) add('node_version', r, path.join(root, 'firebase.json'), 'functions.runtime'); }
  if (fj.storage) add('storage', 'firebase-storage', path.join(root, 'firebase.json'), 'storage block');
  if (fj.emulators) add('emulator', 'firebase-emulators', path.join(root, 'firebase.json'), 'emulators block');
}
if (exists('.firebaserc')) { const rc = readJson(path.join(root, '.firebaserc')) || {}; for (const [k, v] of Object.entries(rc.projects || {})) add('cloud_project', `${k}=${v}`, path.join(root, '.firebaserc'), 'projects alias'); }
if (exists('firestore.rules')) add('database', 'firestore', path.join(root, 'firestore.rules'), 'rules file');
if (exists('vercel.json')) add('hosting', 'vercel', path.join(root, 'vercel.json'), 'vercel.json');
if (exists('netlify.toml')) add('hosting', 'netlify', path.join(root, 'netlify.toml'), 'netlify.toml');
if (exists('fly.toml')) add('hosting', 'fly', path.join(root, 'fly.toml'), 'fly.toml');
if (exists('render.yaml')) add('hosting', 'render', path.join(root, 'render.yaml'), 'render.yaml');
if (exists('serverless.yml') || exists('serverless.yaml')) add('hosting', 'aws-serverless-framework', path.join(root, 'serverless.yml'), 'serverless.yml');
if (exists('cloudbuild.yaml')) add('ci', 'cloud-build', path.join(root, 'cloudbuild.yaml'), 'cloudbuild.yaml');
if (exists('app.yaml')) add('hosting', 'app-engine', path.join(root, 'app.yaml'), 'app.yaml');
if (exists('wrangler.toml') || exists('wrangler.jsonc')) add('hosting', 'cloudflare-workers', path.join(root, 'wrangler.toml'), 'wrangler config');
for (const t of ['template.yaml', 'template.yml', 'samconfig.toml']) if (exists(t)) { const c = read(path.join(root, t)) || ''; if (/AWSTemplateFormatVersion|Transform:\s*AWS::Serverless/.test(c)) add('hosting', 'aws-sam', path.join(root, t), 'SAM template'); }
if (profile.facets.framework?.some(f => f.value === 'nextjs') && !profile.facets.hosting) add('hosting', 'vercel-implied', root, 'nextjs without other hosting config (model-prior: confirm)');

// ---------- containers / k8s / iac ----------
for (const d of dirs) {
  let entries = []; try { entries = fs.readdirSync(d); } catch {}
  for (const f of entries) {
    const p = path.join(d, f);
    if (/^Dockerfile/i.test(f)) add('container', 'docker', p, f);
    if (/^(docker-)?compose\.ya?ml$/.test(f)) add('container', 'compose', p, f);
    if (f.endsWith('.tf')) add('iac', 'terraform', p, f);
    if (/^Pulumi\.ya?ml$/.test(f)) add('iac', 'pulumi', p, f);
    if (f === 'cdk.json') add('iac', 'aws-cdk', p, f);
    if (/\.ya?ml$/.test(f) && !/^(docker-)?compose/.test(f)) { const c = read(p) || ''; if (/^kind:\s*(Deployment|Service|Ingress|StatefulSet)/m.test(c) && /^apiVersion:/m.test(c)) add('orchestration', 'kubernetes', p, 'k8s manifest'); }
    if (f === 'Chart.yaml') add('orchestration', 'helm', p, f);
  }
}

// ---------- CI ----------
const wf = path.join(root, '.github', 'workflows');
if (fs.existsSync(wf)) for (const f of fs.readdirSync(wf)) if (/\.ya?ml$/.test(f)) add('ci', 'github-actions', path.join(wf, f), f);
if (exists('.gitlab-ci.yml')) add('ci', 'gitlab-ci', path.join(root, '.gitlab-ci.yml'), 'present');
if (exists('.circleci/config.yml')) add('ci', 'circleci', path.join(root, '.circleci/config.yml'), 'present');
if (exists('bitbucket-pipelines.yml')) add('ci', 'bitbucket-pipelines', path.join(root, 'bitbucket-pipelines.yml'), 'present');

// ---------- repo hygiene facts ----------
add('vcs', fs.existsSync(path.join(root, '.git')) ? 'git' : 'none', root, '.git presence');
if (exists('.gitignore')) add('gitignore', 'present', path.join(root, '.gitignore'), 'present'); else add('gitignore', 'absent', root, 'no .gitignore');
for (const f of ['.env', '.env.local', '.env.production']) if (exists(f)) add('env_file', f, path.join(root, f), 'env file on disk');
for (const f of ['.env.example', '.env.sample', '.env.template']) if (exists(f)) add('env_example', f, path.join(root, f), 'present');
for (const f of ['CLAUDE.md', 'AGENTS.md', 'README.md']) if (exists(f)) add('contract', f, path.join(root, f), 'present');

// ---------- output ----------
const json = JSON.stringify(profile, null, 2);
if (outFile) fs.writeFileSync(outFile, json); else process.stdout.write(json + '\n');
if (!quiet) {
  const summary = Object.entries(profile.facets).map(([k, v]) => `${k}: ${v.map(e => e.value).join(', ')}`).join('\n');
  console.error(`stack profile${outFile ? ' → ' + outFile : ''}\n${summary}`);
}
process.exit(0);
