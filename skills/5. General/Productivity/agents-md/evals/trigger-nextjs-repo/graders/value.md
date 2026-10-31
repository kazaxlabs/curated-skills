---
type: llm
---

The user described a Next.js + pnpm repo and asked for the full contents of an AGENTS.md, plus how to handle CLAUDE.md. Grade the AGENTS.md content proposed in the reply.

PASS if all of these hold:
- The reply gives the AGENTS.md content as short headings with bullets, tables or code blocks, without a welcome line, an introduction or explanatory prose paragraphs.
- The proposed file gives per-file (file-scoped) commands with a file path placeholder for at least two of typecheck, lint and test (for example `pnpm eslint path/to/file.ts` or `pnpm vitest run path/to/file.test.ts`), not only the project-wide `pnpm lint` / `pnpm test`.
- CLAUDE.md is handled by pointing it at AGENTS.md (a symlink, an import line or a one-line pointer), not by a second full copy of the content.

FAIL if any of these hold:
- It tells AI agents to add a Co-Authored-By or other AI attribution trailer to their commits.
- Only project-wide commands are given.
- The proposed AGENTS.md restates the Prettier formatting rules (quotes, semicolons, indentation) instead of leaving them to the config file.
- It proposes a separate CLAUDE.md that duplicates the AGENTS.md content.

Rubric history: v1 (2026-10-31) required a Co-Authored-By commit attribution section. v2 (2026-10-31): the user dropped AI commit attribution everywhere and the skill no longer asks for it, so v2 removes that requirement and fails a reply that adds one.
