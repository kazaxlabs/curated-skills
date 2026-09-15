# collab-mcp

A model-agnostic Model Context Protocol (MCP) server providing persistent cross-agent session coordination via `docs/COLLAB/`.

## Purpose

When complex tasks span across multiple AI assistants (e.g., Claude Code, Google Antigravity, Cursor, Windsurf, Aider) or separate sessions, context is often fragmented or lost.

`collab-mcp` provides a structured, git-aware handoff mechanism that reads and writes structured Markdown files into `docs/COLLAB/` at the repository root.

## Available Tools

| Tool | Description | Key Arguments |
| :--- | :--- | :--- |
| `start_handoff` | Creates a new handoff document for a given scope (e.g. `general` -> `HANDOFF.md`, or a specific topic like `auth` -> `HANDOFF-AUTH.md`). Never overwrites an existing file. | `scope`, `tool`, `summary`, `project_dir` (optional) |
| `append_note` | Appends a sequential, timestamped note to an existing handoff document. | `scope`, `tool`, `note`, `project_dir` (optional) |
| `read_latest_handoff`| Reads the current handoff file for a given scope (defaults to `general`). | `scope` (optional), `project_dir` (optional) |
| `list_handoffs` | Discovers and lists all handoff files in `docs/COLLAB/` with metadata. | `project_dir` (optional) |

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
