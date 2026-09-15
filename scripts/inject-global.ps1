# ==============================================================================
# inject-global.ps1
# Automates global injection of Curated Skills, Agent Rules, and collab-mcp
# Supported Agents: Claude Code, Google Antigravity, Cursor, Windsurf, Cline/Roo
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$ForceCopy = $false
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..")).Path
$SkillsDir = Join-Path $RepoRoot "skills"
$AgentsDoc = Join-Path $RepoRoot "AGENTS.md"
$CollabDir = Join-Path $RepoRoot "collab-mcp"
$CollabDist = Join-Path $CollabDir "dist\index.js"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   Curated Skills and collab-mcp Universal Agent Injector (Win)  " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Repository Root: $RepoRoot" -ForegroundColor Gray
Write-Host "Skills Path:     $SkillsDir" -ForegroundColor Gray

# ------------------------------------------------------------------------------
# 1. Build collab-mcp if needed
# ------------------------------------------------------------------------------
if (-not (Test-Path $CollabDist)) {
    Write-Host "`n[1/5] Building collab-mcp..." -ForegroundColor Yellow
    Push-Location $CollabDir
    try {
        if (-not (Test-Path "node_modules")) {
            npm install --silent
        }
        npm run build --silent
        Write-Host "  [OK] collab-mcp built successfully." -ForegroundColor Green
    }
    catch {
        Write-Warning "Failed to automatically build collab-mcp. Please run 'npm run build' inside $CollabDir."
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "`n[1/5] collab-mcp binary ready." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# Helper: Directory Link or Copy (Hybrid Strategy)
# ------------------------------------------------------------------------------
function Install-DirectoryLink {
    param(
        [string]$SourcePath,
        [string]$DestinationPath,
        [string]$Label
    )

    $parentDir = Split-Path -Parent $DestinationPath
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    if (Test-Path $DestinationPath) {
        $item = Get-Item $DestinationPath -Force
        if ($item.LinkType -eq "Junction" -or $item.LinkType -eq "SymbolicLink") {
            [System.IO.Directory]::Delete($DestinationPath)
        } else {
            Remove-Item -Recurse -Force $DestinationPath
        }
    }

    $linked = $false
    if (-not $ForceCopy) {
        try {
            cmd /c mklink /J "$DestinationPath" "$SourcePath" 2>&1 | Out-Null
            if (Test-Path $DestinationPath) {
                Write-Host "  [OK] ${Label}: Linked via Directory Junction (Live sync)" -ForegroundColor Green
                $linked = $true
            }
        } catch {
            $linked = $false
        }
    }

    if (-not $linked) {
        Copy-Item -Recurse -Path $SourcePath -Destination $DestinationPath -Force
        Write-Host "  [OK] ${Label}: Copied files (Fallback mode)" -ForegroundColor Yellow
    }
}

# Helper: Merge MCP Config into JSON
function Update-McpConfigFile {
    param(
        [string]$ConfigPath,
        [string]$ServerPath,
        [string]$Label
    )

    try {
        $parent = Split-Path -Parent $ConfigPath
        if (-not (Test-Path $parent)) {
            New-Item -ItemType Directory -Path $parent -Force | Out-Null
        }

        $config = @{}
        if (Test-Path $ConfigPath) {
            $raw = Get-Content $ConfigPath -Raw -ErrorAction SilentlyContinue
            if ($raw) {
                $obj = $raw | ConvertFrom-Json
                foreach ($prop in $obj.psobject.properties) {
                    $config[$prop.Name] = $prop.Value
                }
            }
        }

        if (-not $config.ContainsKey("mcpServers") -or $null -eq $config["mcpServers"]) {
            $config["mcpServers"] = @{}
        } elseif ($config["mcpServers"] -is [System.Management.Automation.PSCustomObject]) {
            $mcpMap = @{}
            foreach ($p in $config["mcpServers"].psobject.properties) {
                $mcpMap[$p.Name] = $p.Value
            }
            $config["mcpServers"] = $mcpMap
        }

        $normalizedPath = $ServerPath.Replace("\", "/")
        $config["mcpServers"]["collab"] = @{
            "command" = "node"
            "args" = @($normalizedPath)
        }

        $jsonOutput = $config | ConvertTo-Json -Depth 10
        Set-Content -Path $ConfigPath -Value $jsonOutput -Encoding utf8
        Write-Host "  [OK] ${Label}: collab-mcp registered in $ConfigPath" -ForegroundColor Green
    } catch {
        Write-Warning "  [!] Could not update ${Label} config: $_"
    }
}

# ------------------------------------------------------------------------------
# 2. Inject into Claude Code
# ------------------------------------------------------------------------------
Write-Host "`n[2/5] Injecting into Claude Code..." -ForegroundColor Cyan
$ClaudeDir = Join-Path $HOME ".claude"
Install-DirectoryLink -SourcePath $SkillsDir -DestinationPath (Join-Path $ClaudeDir "skills") -Label "Claude Code Skills"

# Global instructions fallback
Copy-Item $AgentsDoc (Join-Path $ClaudeDir "CLAUDE.md") -Force
Write-Host "  [OK] Claude Code: Global CLAUDE.md updated" -ForegroundColor Green

# Register via CLI if claude is in PATH
if (Get-Command "claude" -ErrorAction SilentlyContinue) {
    try {
        claude mcp add collab node "$($CollabDist.Replace('\', '/'))" 2>&1 | Out-Null
        Write-Host "  [OK] Claude Code: Registered collab-mcp via 'claude mcp add'" -ForegroundColor Green
    } catch {
        Update-McpConfigFile -ConfigPath (Join-Path $HOME ".claude.json") -ServerPath $CollabDist -Label "Claude Code JSON"
    }
} else {
    Update-McpConfigFile -ConfigPath (Join-Path $HOME ".claude.json") -ServerPath $CollabDist -Label "Claude Code JSON"
}

# ------------------------------------------------------------------------------
# 3. Inject into Google Antigravity & Gemini CLI
# ------------------------------------------------------------------------------
Write-Host "`n[3/5] Injecting into Google Antigravity / Gemini CLI..." -ForegroundColor Cyan
$GeminiConfigDir = Join-Path $HOME ".gemini\config"
Install-DirectoryLink -SourcePath $SkillsDir -DestinationPath (Join-Path $GeminiConfigDir "skills") -Label "Antigravity Skills"
Copy-Item $AgentsDoc (Join-Path $GeminiConfigDir "GEMINI.md") -Force
Write-Host "  [OK] Antigravity: Global GEMINI.md updated" -ForegroundColor Green

# MCP Configs for Antigravity
Update-McpConfigFile -ConfigPath (Join-Path $GeminiConfigDir "mcp_config.json") -ServerPath $CollabDist -Label "Antigravity Global MCP"

# ------------------------------------------------------------------------------
# 4. Inject into Cursor & Windsurf
# ------------------------------------------------------------------------------
Write-Host "`n[4/5] Injecting into Cursor and Windsurf..." -ForegroundColor Cyan

# Cursor
$CursorRulesDir = Join-Path $HOME ".cursor\rules"
New-Item -ItemType Directory -Path $CursorRulesDir -Force | Out-Null
Copy-Item $AgentsDoc (Join-Path $CursorRulesDir "000-agents-governance.md") -Force
Install-DirectoryLink -SourcePath $SkillsDir -DestinationPath (Join-Path $HOME ".cursor\skills") -Label "Cursor Skills"
Update-McpConfigFile -ConfigPath (Join-Path $HOME ".cursor\mcp.json") -ServerPath $CollabDist -Label "Cursor MCP"

# Windsurf
$WindsurfMemories = Join-Path $HOME ".codeium\windsurf\memories"
New-Item -ItemType Directory -Path $WindsurfMemories -Force | Out-Null
Copy-Item $AgentsDoc (Join-Path $WindsurfMemories "global_rules.md") -Force
Write-Host "  [OK] Windsurf: Global rules memory updated" -ForegroundColor Green
Update-McpConfigFile -ConfigPath (Join-Path $HOME ".codeium\windsurf\mcp_config.json") -ServerPath $CollabDist -Label "Windsurf MCP"

# ------------------------------------------------------------------------------
# 5. Inject into Cline & Roo Code
# ------------------------------------------------------------------------------
Write-Host "`n[5/5] Checking Cline and Roo Code VS Code configurations..." -ForegroundColor Cyan
$ClineSettingsPaths = @(
    (Join-Path $env:APPDATA "Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json"),
    (Join-Path $env:APPDATA "Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json")
)

foreach ($path in $ClineSettingsPaths) {
    if (Test-Path (Split-Path -Parent $path)) {
        Update-McpConfigFile -ConfigPath $path -ServerPath $CollabDist -Label (Split-Path -Parent (Split-Path -Parent $path) | Split-Path -Leaf)
    }
}

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "   [OK] Global Injection Complete! All agents synchronized.     " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
