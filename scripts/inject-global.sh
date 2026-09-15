#!/usr/bin/env bash
# ==============================================================================
# inject-global.sh
# Automates global injection of Curated Skills, Agent Rules, and collab-mcp
# Supported Agents: Claude Code, Google Antigravity, Cursor, Windsurf, Cline/Roo
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SKILLS_DIR="${REPO_ROOT}/skills"
AGENTS_DOC="${REPO_ROOT}/AGENTS.md"
COLLAB_DIR="${REPO_ROOT}/collab-mcp"
COLLAB_DIST="${COLLAB_DIR}/dist/index.js"

echo "================================================================="
echo "   Curated Skills & collab-mcp Universal Agent Injector (POSIX)  "
echo "================================================================="
echo "Repository Root: ${REPO_ROOT}"
echo "Skills Path:     ${SKILLS_DIR}"

# 1. Build collab-mcp if needed
if [[ ! -f "${COLLAB_DIST}" ]]; then
  echo ""
  echo "[1/5] Building collab-mcp..."
  (
    cd "${COLLAB_DIR}"
    if [[ ! -d "node_modules" ]]; then
      npm install --silent
    fi
    npm run build --silent
  )
  echo "  ✓ collab-mcp built successfully."
else
  echo ""
  echo "[1/5] collab-mcp binary ready."
fi

# Helper: Directory link or copy
install_directory_link() {
  local src="$1"
  local dest="$2"
  local label="$3"

  mkdir -p "$(dirname "$dest")"
  if [[ -e "$dest" || -L "$dest" ]]; then
    rm -rf "$dest"
  fi

  if ln -sfn "$src" "$dest" 2>/dev/null; then
    echo "  ✓ ${label}: Linked via symlink (Live sync)"
  else
    cp -R "$src" "$dest"
    echo "  ✓ ${label}: Copied files (Fallback mode)"
  fi
}

# Helper: Merge MCP config
update_mcp_config() {
  local config_path="$1"
  local server_path="$2"
  local label="$3"

  mkdir -p "$(dirname "$config_path")"
  if command -v node >/dev/null 2>&1; then
    node -e "
      const fs = require('fs');
      let config = {};
      try {
        if (fs.existsSync('${config_path}')) {
          config = JSON.parse(fs.readFileSync('${config_path}', 'utf8'));
        }
      } catch (e) {}
      config.mcpServers = config.mcpServers || {};
      config.mcpServers.collab = {
        command: 'node',
        args: ['${server_path}']
      };
      fs.writeFileSync('${config_path}', JSON.stringify(config, null, 2), 'utf8');
    " 2>/dev/null && echo "  ✓ ${label}: Registered collab-mcp in ${config_path}" || echo "  ⚠ Could not update ${label} config"
  fi
}

# 2. Claude Code
echo ""
echo "[2/5] Injecting into Claude Code..."
CLAUDE_DIR="${HOME}/.claude"
install_directory_link "${SKILLS_DIR}" "${CLAUDE_DIR}/skills" "Claude Code Skills"
cp "${AGENTS_DOC}" "${CLAUDE_DIR}/CLAUDE.md"
echo "  ✓ Claude Code: Global CLAUDE.md updated"

if command -v claude >/dev/null 2>&1; then
  claude mcp add collab node "${COLLAB_DIST}" >/dev/null 2>&1 || \
    update_mcp_config "${HOME}/.claude.json" "${COLLAB_DIST}" "Claude Code JSON"
else
  update_mcp_config "${HOME}/.claude.json" "${COLLAB_DIST}" "Claude Code JSON"
fi

# 3. Google Antigravity / Gemini CLI
echo ""
echo "[3/5] Injecting into Google Antigravity / Gemini CLI..."
GEMINI_DIR="${HOME}/.gemini/config"
install_directory_link "${SKILLS_DIR}" "${GEMINI_DIR}/skills" "Antigravity Skills"
cp "${AGENTS_DOC}" "${GEMINI_DIR}/GEMINI.md"
echo "  ✓ Antigravity: Global GEMINI.md updated"
update_mcp_config "${GEMINI_DIR}/mcp_config.json" "${COLLAB_DIST}" "Antigravity Global MCP"

# 4. Cursor & Windsurf
echo ""
echo "[4/5] Injecting into Cursor & Windsurf..."
mkdir -p "${HOME}/.cursor/rules"
cp "${AGENTS_DOC}" "${HOME}/.cursor/rules/000-agents-governance.md"
install_directory_link "${SKILLS_DIR}" "${HOME}/.cursor/skills" "Cursor Skills"
update_mcp_config "${HOME}/.cursor/mcp.json" "${COLLAB_DIST}" "Cursor MCP"

mkdir -p "${HOME}/.codeium/windsurf/memories"
cp "${AGENTS_DOC}" "${HOME}/.codeium/windsurf/memories/global_rules.md"
echo "  ✓ Windsurf: Global rules memory updated"
update_mcp_config "${HOME}/.codeium/windsurf/mcp_config.json" "${COLLAB_DIST}" "Windsurf MCP"

# 5. Cline & Roo Code
echo ""
echo "[5/5] Checking Cline & Roo Code configurations..."
ROO_SETTINGS=(
  "${HOME}/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
  "${HOME}/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
  "${HOME}/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json"
  "${HOME}/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json"
)

for p in "${ROO_SETTINGS[@]}"; do
  if [[ -d "$(dirname "$p")" ]]; then
    update_mcp_config "$p" "${COLLAB_DIST}" "Cline/Roo Code"
  fi
done

echo ""
echo "================================================================="
echo "   ✓ Global Injection Complete! All agents synchronized.       "
echo "================================================================="
