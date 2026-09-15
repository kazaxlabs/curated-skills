# CLAUDE.md

The governing contract for this repository is [AGENTS.md](AGENTS.md). It is imported
below so Claude Code loads it at session start — Claude Code reads `CLAUDE.md`, while
Antigravity and most other agents read `AGENTS.md` directly. One file, two entry points.

@AGENTS.md

---

## Claude Code specifics

Everything above applies. These additions are Claude-only.

- **Do not copy `AGENTS.md` into this file.** A copy drifts, and drift is the failure
  mode the evidence gate exists to prevent. The import line above is the whole bridge.
  Do not replace it with a symlink either: this repository is on Windows, where `ln -s`
  requires Developer Mode or elevation.
- **Imports load at launch.** Content behind `@path` costs context on every session, so
  keep this file and `AGENTS.md` thin. Task-specific material belongs in a skill.
- **Skills:** invoke with the Skill tool. The routing table in `AGENTS.md` §7 says when.
- **Subagents inherit nothing automatically.** A subagent starts cold. Pass it the
  constraints it needs, including the evidence gate, in its prompt.
- **The `harness-and-harden` MCP server** provides registered claims, sources, a decision
  gate, and an on-disk decision record. Use it for substantial architecture or strategy
  decisions worth an audit trail. For everything else, run the evidence gate in reasoning
  without tool calls or written files.
- **Session commands:** `/evidence` and `/plainsummary` (in `~/.claude/commands/`) change
  those two behaviours for the current session only. A change made that way does not
  alter `AGENTS.md`.

## Verifying a change to the contract
 
`AGENTS.md` must stay under 12,000 characters or Antigravity will drop the excess.
After editing it:
 
```bash
wc -m AGENTS.md
```
