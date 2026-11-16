# ADR-0001: One handoff record per scope, with a status block

- **Status:** Accepted, 2026-11-16
- **Deciders:** repository owner
- **Scope:** `collab-mcp` (this repo); the owner's private tracker reads the result

## Context

Who is working on what, and what comes next, is written in four places today:

1. `docs/COLLAB/HANDOFF-*.md` files, written by the `collab` MCP server (`collab-mcp/src/collab.ts`,
   `startHandoff` and `appendNote`). These are free-text logs of numbered, dated notes.
2. Session notes in the owner's private tracker, written by its `brain_session` tool.
3. `docs/COLLAB/CONCURRENT-SESSIONS.md` ledgers. They are typed by hand as `START` / `DONE` lines.
   Measured on 2026-11-16, 7 repo folders on the owner's machine keep one.
4. Step markers (`- [ ]`, `- [~]`, `- [x]`) in plan files.

The same state drifts between them. The tracker infers "open sessions" from ledger lines: a `START`
with no later `DONE` counts as open. Agents only sometimes write those lines, so open work is
missed and stale work lingers. The handoff files are the one place both agents reach through the same
tool, but nothing in them can be read by a machine: status, next step and blockers are prose.

## Decision

The handoff file is the per-scope record. `collab-mcp` writes a YAML front-matter block at the top of
each handoff file and keeps it current:

```yaml
---
scope: plan-auditor-review
status: claimed        # claimed | active | blocked | done
tool: claude-code      # who wrote the latest note
updated: 2026-11-16
next: ""               # the single next step
blockers: []           # open blockers, one line each
links: []              # plan file, ADR, decision record paths
---
```

- `start_handoff` writes the block with `status: claimed`.
- `append_note` can update `status`, `next`, `blockers` and `links`. It always updates `tool` and
  `updated`.
- The body stays an append-only log of `## N. date — tool` notes. Nothing in it is rewritten.
- Readers that do not know about front matter still work: the title is still the first `# ` line.

## Alternatives considered

- **(b) Tracker session notes as the record.** Rejected. They live in a private repo outside the
  projects, Antigravity reaches them only when it chooses to call the tool, and they hold one session
  each rather than a scope's whole thread.
- **(c) A JSONL ledger per repo.** Rejected. It is easy to parse, but it adds a fifth place, carries no
  narrative, and agents would still have to write it by hand, which is why the current ledgers drift.
- **Keep the four places and reconcile them.** Rejected. It keeps the drift and only moves where it
  gets noticed.

## Consequences

- One machine-readable status per scope, written by the tool both agents already use.
- The tracker can read a claim as `status: claimed` instead of pairing `START` / `DONE` lines.
- Existing handoff files have no front matter until their next `append_note`, which adds the block.
- **Rollout: expand, migrate, contract.**
  - *Expand:* `collab-mcp` writes the block.
  - *Migrate:* the tracker reads it, falling back to its current parsing.
  - *Contract:* new claims use `status`; existing ledgers stay and are not deleted.
- The tracker reads handoffs from the committed default branch. A claim made on a feature branch is
  visible only after merge, unless the tracker also reads worktree copies. The tracker already does
  that for ledgers, and the migrate step does the same for handoffs.

## Revisit when

- Either agent stops using the `collab` tools to write handoffs, or
- the tracker's open-session count disagrees with the handoff statuses for a week.
