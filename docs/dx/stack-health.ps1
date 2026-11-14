# stack-health.ps1 — one-screen health check of the agentic stack on this machine. Read-only.
# Measures what made sessions slow this week: open Claude Code sessions and their child processes, RAM,
# OneDrive CPU, gcloud processes (and how long they have run), unpushed brain commits.
# Usage: powershell -NoProfile -File stack-health.ps1      Exit: 0 always (it reports, it does not judge).

$all = Get-CimInstance Win32_Process
$byParent = $all | Group-Object ParentProcessId -AsHashTable -AsString
function Descendants([int]$id) { $out = @(); $q = @($id); while ($q.Count) { $p = $q[0]; $q = @($q | Select-Object -Skip 1); foreach ($c in @($byParent["$p"])) { if ($c) { $out += $c; $q += [int]$c.ProcessId } } }; $out }
function MB($procId) { $g = Get-Process -Id $procId -ErrorAction SilentlyContinue; if ($g) { $g.WorkingSet64 / 1MB } else { 0 } }

$sessions = @($all | Where-Object { $_.CommandLine -match 'claude-code\\.*claude\.exe.*--resume=' })
$rows = foreach ($s in $sessions) {
  $d = Descendants $s.ProcessId
  [pscustomobject]@{ Session = ([regex]::Match($s.CommandLine, '--resume=([0-9a-f]{8})')).Groups[1].Value; Started = $s.CreationDate.ToString('MM-dd HH:mm')
    Children = $d.Count; RAM_MB = [math]::Round((MB $s.ProcessId) + (($d | ForEach-Object { MB $_.ProcessId }) | Measure-Object -Sum).Sum) }
}
"Claude Code sessions open: $($sessions.Count)  (each keeps its connectors running until closed or archived)"
$rows | Sort-Object RAM_MB -Descending | Format-Table -AutoSize | Out-String -Width 120 | ForEach-Object { $_.TrimEnd() }
"Total for sessions: {0:N1} GB" -f (($rows | Measure-Object RAM_MB -Sum).Sum / 1KB)

$os = Get-CimInstance Win32_OperatingSystem
"RAM free: {0:N1} of {1:N1} GB" -f ($os.FreePhysicalMemory / 1MB), ($os.TotalVisibleMemorySize / 1MB)
$od = Get-Process OneDrive -ErrorAction SilentlyContinue | Select-Object -First 1
if ($od) { $m = ((Get-Date) - $od.StartTime).TotalMinutes; "OneDrive: {0:N2} CPU cores on average since it started {1:N0} min ago" -f ($od.CPU / 60 / $m), $m }
$g = @($all | Where-Object { $_.Name -match '^python' -and $_.CommandLine -match 'gcloud\.py' })
"gcloud running: $($g.Count)"
foreach ($p in $g) { $age = ((Get-Date) - $p.CreationDate).TotalMinutes; $c = ([regex]::Match($p.CommandLine, 'gcloud\.py"?\s+(.{0,60})')).Groups[1].Value
  "  {0} running {1:N0} min{2}: {3}" -f $p.ProcessId, $age, $(if ($age -gt 10) { '  <- likely stuck (a hidden sign-in prompt?)' } else { '' }), $c }
if (-not [Environment]::GetEnvironmentVariable('CLOUDSDK_CORE_DISABLE_PROMPTS', 'User')) { "  note: CLOUDSDK_CORE_DISABLE_PROMPTS is not set, so gcloud can wait forever on a prompt no one sees" }
$brain = Join-Path $HOME '.brain'
if (Test-Path (Join-Path $brain '.git')) {
  git -C $brain fetch -q 2>$null
  $ahead = git -C $brain rev-list --count '@{u}..HEAD' 2>$null
  "brain: $ahead commit(s) not pushed (your phone shows the state as of the last push)"
}
