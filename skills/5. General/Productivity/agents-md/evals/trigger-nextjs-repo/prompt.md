---
description: A user asks for an AGENTS.md for a described Next.js repo and how to handle CLAUDE.md. The skill should fire; the proposed file should carry commit attribution and file-scoped commands, leave Prettier rules to the config, and point CLAUDE.md at AGENTS.md. The skill normally inspects the repo and writes the files; the run has an empty workspace and no file writes, so the repo is described inline and the content proposed in the reply is graded.
tags: [trigger, value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Can you write the AGENTS.md for our repo? I'll create the file myself, so just give me the full contents in your reply. We also use Claude Code, so tell me how to handle CLAUDE.md.

Repo facts:
- Next.js 15 app (App Router) in TypeScript, code under src/app. API routes live in src/app/api/<name>/route.ts and validate input with zod.
- pnpm, with pnpm-lock.yaml at the root.
- package.json scripts: dev = next dev, build = next build, lint = eslint ., typecheck = tsc --noEmit, test = vitest run.
- .prettierrc: single quotes, no semicolons, 2-space indent. The ESLint config extends next/core-web-vitals.
- CONTRIBUTING.md covers local setup and the release process.
- src/legacy/ is old Pages Router code we are migrating away from; nobody should add to it.
- CI (GitHub Actions) runs lint, typecheck, test and build on every pull request.
