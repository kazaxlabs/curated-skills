# collab-mcp

A model-agnostic Model Context Protocol (MCP) server providing persistent cross-agent session coordination via `docs/COLLAB/`.

## Purpose

When complex tasks span across multiple AI assistants (e.g., Claude Code, Google Antigravity, Cursor, Windsurf, Aider) or separate sessions, context is often fragmented or lost.

`collab-mcp` provides a structured, git-aware handoff mechanism that reads and writes structured Markdown files into `docs/COLLAB/` at the repository root.

## Available Tools

| Tool | Description | Key Arguments |
| :--- | :--- | :--- |
| `start_handoff` | Creates a new handoff document for a given scope (e.g. `general` -> `HANDOFF.md`, or a specific topic like `auth` -> `HANDOFF-AUTH.md`), with a status block set to `claimed`. Never overwrites an existing file. | `scope`, `tool`, `summary`, `next`, `links`, `project_dir` (optional) |
| `append_note` | Appends a sequential, timestamped note to an existing handoff document and updates its status block. Fields left out keep their value. | `scope`, `tool`, `note`, `status`, `next`, `blockers`, `links`, `project_dir` (optional) |
| `read_latest_handoff`| Reads the current handoff file for a given scope (defaults to `general`). | `scope` (optional), `project_dir` (optional) |
| `list_handoffs` | Discovers and lists all handoff files in `docs/COLLAB/` with title, status and next step. | `project_dir` (optional) |

### Status block and claims ([ADR-0001](../docs/adr/ADR-0001-one-handoff-record-per-scope.md))

Each handoff file starts with a YAML block: `scope`, `status` (`claimed` | `active` | `blocked` | `done`),
`tool`, `updated`, `next`, `blockers`, `links`. It is the one machine-readable record of who holds a scope
and what comes next.

- **To claim a scope**, call `start_handoff`, or `append_note` with `status: "claimed"`. This replaces
  writing a `START` line in `docs/COLLAB/CONCURRENT-SESSIONS.md`.
- **To finish**, call `append_note` with `status: "done"`. This replaces the `DONE` line.
- Existing ledgers are kept and still read; new claims go in the status block.
- Files written before the block existed get one (`status: active`) on their next `append_note`. The text
  below it is never rewritten.

Run the tests with `npm test`.

## Quickstart

### Build
```bash
npm install
npm run build
```

### Stdio Run
```bash
node dist/index.js
```

## Adding to Your Agent Config

### Claude Code
```bash
claude mcp add collab node /absolute/path/to/collab-mcp/dist/index.js
```

### Generic MCP Config (`claude_desktop_config.json`, `~/.cursor/mcp.json`, `cline_mcp_settings.json`)
```json
{
  "mcpServers": {
    "collab": {
      "command": "node",
      "args": ["/absolute/path/to/collab-mcp/dist/index.js"]
    }
  }
}
```
