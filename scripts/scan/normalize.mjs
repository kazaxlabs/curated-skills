#!/usr/bin/env node
// normalize.mjs — merge tool reports into findings.jsonl and summary.json
// Plan step S4: merges hygiene.json, cisco-static.json, detect-secrets.json, pilot-haiku.jsonl, haiku-full.jsonl

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';

// Reports folder: SKILLSCAN_REPORTS (set by finish.mjs), else the 2026-11-02 run under the user's home.
const REPORTS_DIR = process.env.SKILLSCAN_REPORTS || join(homedir(), '.skillscan', 'reports', '2026-11-02');
const FULL_LIST_PATH = join(REPORTS_DIR, 'full-list.json');
const PILOT_LIST_PATH = join(REPORTS_DIR, 'pilot-list.json');

const HYGIENE_PATH = join(REPORTS_DIR, 'hygiene.json');
const CISCO_PATH = join(REPORTS_DIR, 'cisco-static.json');
const SECRETS_PATH = join(REPORTS_DIR, 'detect-secrets.json');

const PILOT_HAIKU_PATH = join(REPORTS_DIR, 'pilot-haiku.jsonl');
const HAIKU_FULL_PATH = join(REPORTS_DIR, 'haiku-full.jsonl');

const FINDINGS_OUT = join(REPORTS_DIR, 'findings.jsonl');
const SUMMARY_OUT = join(REPORTS_DIR, 'summary.json');

// Helper to mask secrets
function maskSecret(val) {
  if (!val) return '';
  if (typeof val !== 'string') val = String(val);
  if (val.length <= 6) return '***';
  return val.slice(0, 3) + '...' + val.slice(-3);
}

// 1. Gather all 1,502 skills
// full-list.json has 1,482; pilot-list.json has 20 real skills (ignoring fx-*)
const fullList = JSON.parse(readFileSync(FULL_LIST_PATH, 'utf8'));
const pilotList = JSON.parse(readFileSync(PILOT_LIST_PATH, 'utf8'));

// Canonical map by skill relative path id, e.g. "skills/category/sub/name"
const skills = new Map(); // id -> { id, base, dir, counts: { hygiene: {}, cisco: {}, secrets: {} }, model: null }

for (const item of fullList) {
  const id = item.id.replace(/\\/g, '/');
  skills.set(id, {
    id,
    base: basename(id),
    dir: item.dir.replace(/\\/g, '/'),
    counts: { hygiene: { high: 0, medium: 0, low: 0 }, cisco: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }, secrets: { total: 0 } },
    model: null
  });
}

for (const item of pilotList) {
  if (item.id.startsWith('fx-')) continue;
  // Compute id relative to worktree C:/cs-wt/scan/
  const normDir = item.dir.replace(/\\/g, '/');
  const match = normDir.match(/skills\/.*$/i);
  const id = match ? match[0] : ('skills/' + basename(normDir));
  if (!skills.has(id)) {
    skills.set(id, {
      id,
      base: basename(normDir),
      dir: normDir,
      counts: { hygiene: { high: 0, medium: 0, low: 0 }, cisco: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }, secrets: { total: 0 } },
      model: null
    });
  }
}

console.log(`Total skills indexed: ${skills.size}`);

// Quick lookup by base name if needed
const baseToSkills = new Map();
for (const [id, s] of skills) {
  if (!baseToSkills.has(s.base)) baseToSkills.set(s.base, []);
  baseToSkills.get(s.base).push(s);
}

function resolveSkill(filePath) {
  // filePath may be absolute or relative
  const norm = filePath.replace(/\\/g, '/');
  const m = norm.match(/skills\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
  if (m) {
    const candidate = `skills/${m[1]}/${m[2]}/${m[3]}`;
    if (skills.has(candidate)) return skills.get(candidate);
  }
  // Try matching against any skill.dir
  for (const s of skills.values()) {
    if (norm.startsWith(s.dir) || norm.includes(s.id)) return s;
  }
  return null;
}

const findings = [];

// 2. Process Hygiene findings
let hygieneTotal = 0;
if (existsSync(HYGIENE_PATH)) {
  const hygieneData = JSON.parse(readFileSync(HYGIENE_PATH, 'utf8'));
  const leads = hygieneData.findings || [];
  for (const f of leads) {
    hygieneTotal++;
    const sk = resolveSkill(f.file || f.skill || '');
    const sev = (f.severity || 'low').toLowerCase();
    if (sk) {
      if (sk.counts.hygiene[sev] !== undefined) sk.counts.hygiene[sev]++;
    }
    const excerpt = (f.excerpt || f.match || f.message || '').slice(0, 200);
    findings.push({
      skill: sk ? sk.id : (f.skill || 'unknown'),
      file: f.file || '',
      line: f.line || 1,
      tool: 'hygiene',
      rule: f.rule || 'hygiene',
      severity: sev,
      excerpt
    });
  }
}
console.log(`Hygiene leads read: ${hygieneTotal}`);

// 3. Process Cisco static findings
let ciscoTotal = 0;
if (existsSync(CISCO_PATH)) {
  const ciscoData = JSON.parse(readFileSync(CISCO_PATH, 'utf8'));
  const results = ciscoData.results || [];
  for (const res of results) {
    const skillPath = res.skill_path || '';
    const sk = resolveSkill(skillPath);
    const hits = res.findings || [];
    for (const f of hits) {
      ciscoTotal++;
      const sev = (f.severity || 'MEDIUM').toUpperCase();
      if (sk) {
        if (sk.counts.cisco[sev] !== undefined) sk.counts.cisco[sev]++;
        else sk.counts.cisco[sev] = 1;
      }
      const rawExcerpt = f.snippet || f.description || f.title || '';
      findings.push({
        skill: sk ? sk.id : (res.skill_name || 'unknown'),
        file: f.file_path || 'SKILL.md',
        line: f.line_number || 1,
        tool: 'cisco-static',
        rule: f.rule_id || 'cisco',
        severity: sev,
        excerpt: rawExcerpt.slice(0, 200)
      });
    }
  }
}
console.log(`Cisco hits read: ${ciscoTotal}`);

// 4. Process detect-secrets findings
let secretsTotal = 0;
if (existsSync(SECRETS_PATH)) {
  const secData = JSON.parse(readFileSync(SECRETS_PATH, 'utf8'));
  const results = secData.results || {};
  for (const [file, items] of Object.entries(results)) {
    for (const item of items) {
      secretsTotal++;
      const sk = resolveSkill(file);
      if (sk) sk.counts.secrets.total++;
      findings.push({
        skill: sk ? sk.id : 'unknown',
        file,
        line: item.line_number || 1,
        tool: 'detect-secrets',
        rule: item.type || 'secret',
        severity: 'HIGH',
        excerpt: maskSecret(item.hashed_secret || item.secret || `Secret line ${item.line_number}`)
      });
    }
  }
}
console.log(`Secrets hits read: ${secretsTotal}`);

// 5. Load model verdicts (pilot-haiku + haiku-full)
const modelVerdicts = new Map(); // id -> model verdict row

function loadModelLines(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
  for (const l of lines) {
    try {
      const row = JSON.parse(l);
      if (row.id.startsWith('fx-')) continue;
      // Resolve to skill id
      let sk = null;
      if (skills.has(row.id)) sk = skills.get(row.id);
      else {
        // pilot IDs like top:linux-privilege-escalation or rnd:hig-components-system
        const rawName = row.id.replace(/^(top|rnd):/, '');
        if (baseToSkills.has(rawName)) sk = baseToSkills.get(rawName)[0];
      }
      if (sk) {
        modelVerdicts.set(sk.id, {
          verdict: row.verdict || (row.error ? 'error' : null),
          confidence: row.confidence ?? null,
          reasons: row.reasons ?? [],
          error: row.error ?? null,
          model: row.model,
          costUsd: row.costUsd,
          ms: row.ms
        });
      }
    } catch (e) {}
  }
}

loadModelLines(PILOT_HAIKU_PATH);
loadModelLines(HAIKU_FULL_PATH);

console.log(`Model verdicts mapped: ${modelVerdicts.size}`);

// Attach model verdicts to skills
for (const [id, sk] of skills) {
  const mv = modelVerdicts.get(id);
  if (mv) {
    sk.model = mv;
  } else {
    sk.model = { verdict: null, confidence: null, reasons: [], error: 'unprocessed' };
  }
}

// 6. Write findings.jsonl
const findingsLines = findings.map(f => JSON.stringify(f)).join('\n');
writeFileSync(FINDINGS_OUT, findingsLines ? findingsLines + '\n' : '');
console.log(`Wrote ${findings.length} findings to ${FINDINGS_OUT}`);

// 7. Write summary.json
const summaryList = Array.from(skills.values()).map(s => ({
  id: s.id,
  base: s.base,
  dir: s.dir,
  counts: s.counts,
  model: s.model
}));
writeFileSync(SUMMARY_OUT, JSON.stringify(summaryList, null, 2));
console.log(`Wrote ${summaryList.length} skill summaries to ${SUMMARY_OUT}`);
