#!/usr/bin/env node
// ==============================================================================
// validate.js — Repository Integrity and CI Gate
// ==============================================================================

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = resolve(import.meta.dirname, '..');
let errors = 0;

function logPass(msg) {
  console.log(`\x1b[32m  [PASS]\x1b[0m ${msg}`);
}

function logFail(msg) {
  console.error(`\x1b[31m  [FAIL]\x1b[0m ${msg}`);
  errors++;
}

console.log('\x1b[36m=== Curated Skills Repository Integrity Validation ===\x1b[0m');

// 1. Governance contracts & character budget
console.log('\n1. Checking Governance Contracts...');
const agentsPath = join(rootDir, 'AGENTS.md');
if (!existsSync(agentsPath)) {
  logFail('AGENTS.md is missing.');
} else {
  const content = readFileSync(agentsPath, 'utf8');
  const len = content.length;
  if (len > 12000) {
    logFail(`AGENTS.md exceeds character budget: ${len} / 12,000 characters.`);
  } else {
    logPass(`AGENTS.md within character limit: ${len} / 12,000 characters.`);
  }
}

for (const doc of ['CLAUDE.md', 'agent.md', 'README.md', '.gitignore']) {
  if (existsSync(join(rootDir, doc))) {
    logPass(`${doc} present.`);
  } else {
    logFail(`${doc} is missing.`);
  }
}

// 2. Collab MCP Server Validation
console.log('\n2. Validating collab-mcp Build & Tools...');
const collabDir = join(rootDir, 'collab-mcp');
const collabPkg = join(collabDir, 'package.json');
const collabDist = join(collabDir, 'dist', 'index.js');

if (!existsSync(collabPkg)) {
  logFail('collab-mcp/package.json is missing.');
} else {
  logPass('collab-mcp package configuration present.');
}

if (!existsSync(collabDist)) {
  console.log('  Building collab-mcp...');
  try {
    execFileSync('npm', ['run', 'build'], { cwd: collabDir, stdio: 'inherit' });
    logPass('collab-mcp built successfully.');
  } catch (err) {
    logFail(`collab-mcp build failed: ${err.message}`);
  }
} else {
  logPass('collab-mcp dist/index.js present.');
}

// 3. Injector Scripts Syntax
console.log('\n3. Checking Injector Scripts...');
const psScript = join(rootDir, 'scripts', 'inject-global.ps1');
const shScript = join(rootDir, 'scripts', 'inject-global.sh');

if (existsSync(psScript)) {
  logPass('scripts/inject-global.ps1 exists.');
} else {
  logFail('scripts/inject-global.ps1 missing.');
}

if (existsSync(shScript)) {
  logPass('scripts/inject-global.sh exists.');
} else {
  logFail('scripts/inject-global.sh missing.');
}

// 4. Skills Library Sanity Check
console.log('\n4. Validating Skills Library...');
const skillsDir = join(rootDir, 'skills');
if (!existsSync(skillsDir)) {
  logFail('skills/ directory is missing.');
} else {
  let skillCount = 0;
  let frontmatterErrors = 0;

  function scanDir(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name === 'SKILL.md') {
        skillCount++;
        const content = readFileSync(fullPath, 'utf8');
        // Check for YAML frontmatter
        if (!content.startsWith('---')) {
          frontmatterErrors++;
        }
      }
    }
  }

  scanDir(skillsDir);
  logPass(`Indexed ${skillCount} SKILL.md documents.`);
  if (frontmatterErrors > 0) {
    logFail(`${frontmatterErrors} skills are missing initial frontmatter delimiter (---).`);
  } else {
    logPass('All SKILL.md files begin with valid frontmatter delimiter.');
  }
}

console.log('\n=======================================================');
if (errors > 0) {
  console.error(`\x1b[31mValidation Failed with ${errors} error(s).\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32mAll Integrity Checks Passed!\x1b[0m');
  process.exit(0);
}
