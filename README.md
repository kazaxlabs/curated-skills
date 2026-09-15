# Curated Skills

> **The Universal Agent Skills & Governance Library with Built-in Cross-Agent Collaboration (`collab-mcp`).**

Curated Skills is a modular repository containing over **1,500+ production-grade skills**, universal agent governance contracts (`AGENTS.md`), and a model-agnostic Model Context Protocol server (`collab-mcp`) enabling zero-loss context sharing across heterogeneous AI coding agents (Claude Code, Google Antigravity, Cursor, Windsurf, Cline, Aider, and local LLMs).

---

## 🏛️ Repository Layout

```
Curated_Skills/
├── skills/                      # 1,500+ categorized agent skills (SKILL.md standards)
├── collab-mcp/                  # Cross-agent handoff MCP server (TypeScript / stdio)
│   ├── src/
│   │   ├── collab.ts            # Handoff lifecycle and git resolution logic
│   │   └── index.ts             # McpServer registration and stdio transport
│   ├── dist/                    # Compiled JavaScript ready to run
│   ├── package.json
│   └── tsconfig.json
├── AGENTS.md                    # Universal governing contract and evidence gate
├── CLAUDE.md                    # Claude Code entry point (imports @AGENTS.md)
├── agent.md                     # Universal agent instructions bridge
├── README.md                    # Global injection and usage documentation
└── .gitignore                   # Clean repository ignore specification
```

---

## ⚡ Global Injection: One-Liner Terminal Commands

Clone and link this repository once; every AI assistant on your system inherits all 1,500+ skills, the evidence gate contract, and the collaboration MCP server.

### Windows (PowerShell)

Run PowerShell as Administrator or with Developer Mode enabled:

```powershell
# 1. Clone into root or your developer directory
git clone https://github.com/kazaxlabs/curated-skills.git C:\Curated_Skills
cd C:\Curated_Skills\collab-mcp
npm install && npm run build
cd C:\Curated_Skills

# 2. Inject skills globally into Claude Code
New-Item -ItemType Directory -Force -Path "$HOME\.claude" | Out-Null
cmd /c mklink /J "$HOME\.claude\skills" "C:\Curated_Skills\skills"

# 3. Inject skills globally into Google Antigravity / Gemini CLI
New-Item -ItemType Directory -Force -Path "$HOME\.gemini\config" | Out-Null
cmd /c mklink /J "$HOME\.gemini\config\skills" "C:\Curated_Skills\skills"

# 4. Inject global agent instructions
Copy-Item "C:\Curated_Skills\AGENTS.md" "$HOME\.claude\CLAUDE.md" -Force
Copy-Item "C:\Curated_Skills\AGENTS.md" "$HOME\.gemini\config\GEMINI.md" -Force

# 5. Register collab-mcp with Claude Code
claude mcp add collab node "C:/Curated_Skills/collab-mcp/dist/index.js"
```

### macOS / Linux (Bash / Zsh)

```bash
# 1. Clone into ~/Curated_Skills
git clone https://github.com/kazaxlabs/curated-skills.git ~/Curated_Skills
cd ~/Curated_Skills/collab-mcp
npm install && npm run build
cd ~/Curated_Skills

# 2. Inject skills globally into Claude Code
mkdir -p ~/.claude
ln -sfn ~/Curated_Skills/skills ~/.claude/skills

# 3. Inject skills globally into Google Antigravity / Gemini CLI
mkdir -p ~/.gemini/config
ln -sfn ~/Curated_Skills/skills ~/.gemini/config/skills

# 4. Inject global agent instructions
cp ~/Curated_Skills/AGENTS.md ~/.claude/CLAUDE.md
cp ~/Curated_Skills/AGENTS.md ~/.gemini/config/GEMINI.md

# 5. Register collab-mcp with Claude Code
claude mcp add collab node "$HOME/Curated_Skills/collab-mcp/dist/index.js"
```

---

## 🔌 Platform-by-Platform Injection Guide

### 1. Claude Code (CLI)

Claude Code discovers skills placed in `~/.claude/skills/` and executes project-level instructions via `CLAUDE.md`.

#### Step 1: Link Skills
- **Windows (PowerShell as Admin / Junction):**
  ```powershell
  cmd /c mklink /J "$HOME\.claude\skills" "C:\Curated_Skills\skills"
  ```
- **macOS / Linux:**
  ```bash
  ln -sfn ~/Curated_Skills/skills ~/.claude/skills
  ```

#### Step 2: Register `collab-mcp`
Add the collaboration MCP server directly using Claude's CLI:
```bash
claude mcp add collab node /path/to/Curated_Skills/collab-mcp/dist/index.js
```
Or append to `~/.claude.json`:
```json
{
  "mcpServers": {
    "collab": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/Curated_Skills/collab-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

#### Step 3: Global Rules Injection
```bash
# Claude Code loads ~/.claude/CLAUDE.md as fallback global instructions
cp Curated_Skills/AGENTS.md ~/.claude/CLAUDE.md
```

---

### 2. Google Antigravity / Gemini CLI

Google Antigravity loads skills from `~/.gemini/config/skills/` and global behavioral rules from `~/.gemini/config/rules/` or `GEMINI.md`.

#### Step 1: Link Skills
- **Windows (PowerShell):**
  ```powershell
  cmd /c mklink /J "$HOME\.gemini\config\skills" "C:\Curated_Skills\skills"
  ```
- **macOS / Linux:**
  ```bash
  mkdir -p ~/.gemini/config
  ln -sfn ~/Curated_Skills/skills ~/.gemini/config/skills
  ```

#### Step 2: Register `collab-mcp`
Add `collab` to your Antigravity MCP configuration (`~/.gemini/antigravity-ide/mcp_config.json` or `~/.gemini/config/mcp_config.json`):
```json
{
  "mcpServers": {
    "collab": {
      "command": "node",
      "args": ["C:/Curated_Skills/collab-mcp/dist/index.js"]
    }
  }
}
```

#### Step 3: Global Rules Injection
```powershell
Copy-Item "C:\Curated_Skills\AGENTS.md" "$HOME\.gemini\config\GEMINI.md" -Force
```

---

### 3. Cursor

Cursor supports global system rules via `~/.cursor/rules/` (Cursor v0.42+) and workspace `.cursorrules`, alongside standard Model Context Protocol (MCP) servers.

#### Step 1: Global Rules & Skills
- **Windows (PowerShell):**
  ```powershell
  New-Item -ItemType Directory -Force -Path "$HOME\.cursor\rules" | Out-Null
  Copy-Item "C:\Curated_Skills\AGENTS.md" "$HOME\.cursor\rules\000-agents-governance.md" -Force
  cmd /c mklink /J "$HOME\.cursor\skills" "C:\Curated_Skills\skills"
  ```
- **macOS / Linux:**
  ```bash
  mkdir -p ~/.cursor/rules
  cp ~/Curated_Skills/AGENTS.md ~/.cursor/rules/000-agents-governance.md
  ln -sfn ~/Curated_Skills/skills ~/.cursor/skills
  ```

#### Step 2: MCP Server Configuration
In Cursor Settings -> Features -> MCP -> Add New MCP Server:
- **Name:** `collab`
- **Type:** `command`
- **Command:** `node C:/Curated_Skills/collab-mcp/dist/index.js`

Or edit `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "collab": {
      "command": "node",
      "args": ["C:/Curated_Skills/collab-mcp/dist/index.js"]
    }
  }
}
```

---

### 4. Windsurf (Codeium)

Windsurf reads global instructions from `~/.codeium/windsurf/memories/global_rules.md` and uses `.codeium/windsurf/mcp_config.json`.

#### Step 1: Global Instructions
- **Windows (PowerShell):**
  ```powershell
  New-Item -ItemType Directory -Force -Path "$HOME\.codeium\windsurf\memories" | Out-Null
  Get-Content "C:\Curated_Skills\AGENTS.md" | Out-File -FilePath "$HOME\.codeium\windsurf\memories\global_rules.md" -Encoding utf8
  ```
- **macOS / Linux:**
  ```bash
  mkdir -p ~/.codeium/windsurf/memories
  cp ~/Curated_Skills/AGENTS.md ~/.codeium/windsurf/memories/global_rules.md
  ```

#### Step 2: MCP Server Configuration
Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "collab": {
      "command": "node",
      "args": ["C:/Curated_Skills/collab-mcp/dist/index.js"]
    }
  }
}
```

---

### 5. Cline & Roo Code (VS Code Extensions)

#### Step 1: Register `collab-mcp`
Open `cline_mcp_settings.json` (accessible via the MCP Servers tab in Cline/Roo Code settings) and add:
```json
{
  "mcpServers": {
    "collab": {
      "command": "node",
      "args": ["C:/Curated_Skills/collab-mcp/dist/index.js"],
      "disabled": false,
      "autoApprove": [
        "list_handoffs",
        "read_latest_handoff",
        "append_note",
        "start_handoff"
      ]
    }
  }
}
```

#### Step 2: Inject Governing Rules
Paste the contents of `AGENTS.md` into the **Custom Instructions** field in Cline / Roo Code settings.

---

### 6. Aider & Terminal AI CLI Tools

Aider allows specifying persistent rules via `.aider.conf.yml` or global configuration.

#### Step 1: Global Config Injection
Add to your global `~/.aider.conf.yml`:
```yaml
read:
  - C:/Curated_Skills/AGENTS.md
```
Or export via shell environment:
```bash
# Windows PowerShell
$env:AIDER_READ = "C:\Curated_Skills\AGENTS.md"

# Linux/macOS Bash
export AIDER_READ="$HOME/Curated_Skills/AGENTS.md"
```

---

### 7. Ollama / Local Models

Create a customized model profile with the governance instructions embedded directly into the system prompt:

```dockerfile
# Modelfile
FROM qwen2.5-coder:32b

SYSTEM """
$(cat C:\Curated_Skills\AGENTS.md)
"""
```

Build and run:
```bash
ollama create governed-coder -f Modelfile
ollama run governed-coder
```

---

## 🤝 Multi-Agent Collaboration Protocol (`collab-mcp`)

When working across multiple agents (e.g. Claude Code for planning, Cursor for frontend, Antigravity for cloud infra), context is stored in structured Markdown in `docs/COLLAB/` at your repository root.

### The 4 Collaboration Tools

| Tool | Parameters | Purpose |
| :--- | :--- | :--- |
| `start_handoff` | `scope`, `tool`, `summary`, `[project_dir]` | Initiates a handoff file (e.g., `HANDOFF.md` or `HANDOFF-DATABASE.md`). Never overwrites an existing file. |
| `append_note` | `scope`, `tool`, `note`, `[project_dir]` | Appends a numbered, timestamped note with accomplishments, learnings, and next steps. |
| `read_latest_handoff` | `[scope]`, `[project_dir]` | Reads the active handoff file to orient the incoming agent immediately. |
| `list_handoffs` | `[project_dir]` | Lists all handoff files in `docs/COLLAB/` with modification timestamps. |

### Collaboration Flow

1. **Agent 1 (e.g. Claude Code)** starts the task:
   ```json
   start_handoff({
     "scope": "general",
     "tool": "claude-code",
     "summary": "Completed DB schema migrations. Next step is wiring the API handlers."
   })
   ```
2. **Agent 2 (e.g. Cursor or Antigravity)** begins the next turn:
   ```json
   read_latest_handoff({ "scope": "general" })
   ```
3. **Agent 2** finishes its milestone and appends progress:
   ```json
   append_note({
     "scope": "general",
     "tool": "antigravity",
     "note": "Implemented GET /api/v1/users endpoint with full test coverage. Ready for UI integration."
   })
   ```

---

## 🧠 Dynamic Skill Loading & Context Budgeting

Skills follow the progressive disclosure pattern:
- **`SKILL.md` Specification:** Contains YAML frontmatter (`name`, `description`) and specific, step-by-step instructions.
- **Budgeting Rule:** Agents load skills **on-demand** when triggered by a specific domain task rather than stuffing the prompt context upfront.

### Skill Categories Overview
- `1. Architecture`: System design, ADRs, distributed systems, clean patterns.
- `2. Business`: Operations, legal (contracts, NDAs, terms of service), marketing, copy.
- `3. Data-AI`: BigQuery, Spark, Dataproc, GCS, machine learning, ontologies, Airflow.
- `4. Frontend`: Modern React, Vue, CSS aesthetic systems, web design guidelines.
- `5. Backend`: API design, microservices, databases, authentication.
- `6. Devops-Cloud`: GCP, AWS, Docker, Kubernetes, CI/CD pipelines.
- `7. Security`: Audits, IAM hardening, vulnerability checks, SAIF compliance.
- `8. Testing`: TDD, unit testing patterns, integration test strategies.
- `9. Workflow`: Systematic debugging, git protocols, handoffs, code review.

---

## 🛡️ The Evidence Gate (`AGENTS.md`)

All agents operating under this repository adhere to the Evidence Gate:
1. **Measured vs. Sourced vs. Model Prior:** Load-bearing claims must be labeled by origin.
2. **Verified Fetching:** A source is not sourced until resolved in the current session.
3. **Contradiction Logging:** If a live source contradicts a prior assumption or baseline skill, both sides are stated and resolved.
4. **Gates vs. Reviews:** A gate terminates in a machine verdict (exit code, linter output, diff). A review terminates in prose. Only gates constitute verification.

---

## 📄 License

MIT License. Crafted for resilient agentic engineering by Kaza X Labs.
