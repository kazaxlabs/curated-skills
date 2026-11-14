# Workspace template: technical notes (for the conseiller)

This folder becomes the owner's private « espace de travail » repository (pack SPEC §8). The owner never needs this
file; it records how the template is wired, what the official Claude Code docs confirmed, and what is still an
assumption to test.

`instructions-agent.md` is not in this folder on purpose: it is copied in from `instructions/instructions-agent.md`
when the pack is assembled. `CLAUDE.md` imports it on its first line (`@instructions-agent.md`); until it is copied,
that import resolves to nothing.

## What is here

| Path | Role |
| --- | --- |
| `CLAUDE.md` | imports `instructions-agent.md`, adds the workspace rules (English, for the agent), imports `memoire/MEMOIRE.md` |
| `memoire/` | memory files with short French headers; `.autorises` lists the business's own contact lines |
| `registre-des-decisions.md`, `connaissances/INDEX.md`, `projets/_modele/` | decision log, document index, project template |
| `outils/recherche.mjs` | keyless BM25 search over `connaissances/` and `projets/` (`.md`, `.txt`); Node built-ins only |
| `outils/verifier-secrets.mjs` | secret and customer-contact scanner, shared by the git hook and the auto-save |
| `outils/sauvegarde.mjs` | auto-save: commit and push of the memory paths |
| `.claude/settings.json` | hooks, and `env.CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS = "3"` |
| `.claude/agents/` | the five roles: `coordination`, `recherche`, `redaction`, `analyse`, `revision` |
| `.claude/hooks/` | `session-start.mjs`, `pre-compact.mjs`, `stop.mjs`, shared `commun.mjs` |
| `.githooks/pre-commit` | runs `node outils/verifier-secrets.mjs --staged` |
| `.gitignore` | ignores `.claude/cache/` and local files; keeps `.claude/` (and so `.claude/skills/`) versioned |
| `.gitattributes` | keeps LF line endings for `.githooks/*` and scripts, so the hook runs after a Windows checkout (not in SPEC §8's list; added for that reason) |

Tests: `node packs/business-owner/tests/workspace/run.mjs` from the pack repository. They are self-authored: they
show the scripts do what the spec intends on the machine that runs them, not that Claude Code fires them the same
way. The external checks below settle that.

## Hook wiring

| Event | Matcher | Command | What it does |
| --- | --- | --- | --- |
| SessionStart | `startup\|resume\|clear` | `.claude/hooks/session-start.mjs` | sets `core.hooksPath .githooks`; records the session start in `.claude/cache/session.json`; prints profile summary (or "run profil-entreprise"), `memoire/passation.md`, open tasks (~2,000 characters max) |
| SessionStart | `compact` | same script | prints `memoire/etat-en-cours.md` and `memoire/passation.md` |
| PreCompact | all | `.claude/hooks/pre-compact.mjs` | stamps `etat-en-cours.md` (`Dernier résumé automatique : …`); prints nothing; never blocks |
| Stop | all | `.claude/hooks/stop.mjs` | auto-save when memory changed and the last save is older than 10 minutes; one block asking to update `etat-en-cours.md` when other files changed this session and the file is unchanged (stamp line ignored); never when `stop_hook_active` is true |
| SessionEnd | all | `outils/sauvegarde.mjs --hook` | final save; `timeout: 45` raises the SessionEnd budget |

Commands use the shell form `node "${CLAUDE_PROJECT_DIR}/<path>"` so the script path stays in the command string.
The docs recommend exec form (`"command": "node", "args": ["${CLAUDE_PROJECT_DIR}/..."]`) for path-based hooks;
switch to it if the shell form misbehaves on a machine, and update `scripts/validate-pack.mjs` to read `args`.

Every hook script catches its own errors and exits 0; only the Stop JSON output ever blocks.

## Sourced (pages opened 2026-11-11)

- **https://code.claude.com/docs/en/hooks**
  - Events used exist: `SessionStart`, `PreCompact`, `Stop`, `SessionEnd`.
  - SessionStart sources/matchers are `startup`, `resume`, `clear`, `compact`, `fork`; a matcher of letters and `|`
    is a list of exact values.
  - SessionStart plain-text stdout is added to Claude's context (`hookSpecificOutput.additionalContext` also works);
    stdout is capped at 10,000 characters.
  - Common input fields: `session_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name`.
    SessionStart adds `source`, sometimes `model`. Stop adds `stop_hook_active`, `last_assistant_message`.
    PreCompact adds `trigger` (`manual`/`auto`) and `custom_instructions`. SessionEnd adds `reason`.
  - Stop blocks with `{"decision":"block","reason":"..."}`; `stop_hook_active` is true when Claude is already
    continuing because of a Stop hook; there is an 8-consecutive-continuation cap.
  - PreCompact can block and its stdout becomes compaction instructions, so ours blocks nothing and prints nothing.
  - SessionEnd cannot block; default budget 1.5 s, raised by a per-hook `timeout` (seconds) up to 60 s.
  - Shell form runs under `sh -c` (macOS, Linux), Git Bash (Windows), or PowerShell when Git Bash is missing.
    Claude Code rewrites `${CLAUDE_PROJECT_DIR}` for PowerShell; the bare `$CLAUDE_PROJECT_DIR` breaks there, hence
    the braces.
  - Matching hooks run in parallel, so each event has one script (the Stop save and check share `stop.mjs`).
  - Interactive sessions hold back project hooks until the folder is trusted.
- **https://code.claude.com/docs/en/sub-agents**
  - Subagent frontmatter: `name`, `description` (required), `tools` (comma-separated; all tools when omitted),
    `model`, and others.
  - Project subagents live in `.claude/agents/`; Claude delegates from the `description`.
  - Subagents may nest up to 3 layers.
  - Default concurrent limit 20, changed by `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`.
- **https://code.claude.com/docs/en/env-vars**
  - `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` is documented (positive whole number, v2.1.217+).
  - Agent teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`) are disabled by default; we do not set it.
  - We set no compaction threshold (`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`).
- **https://code.claude.com/docs/en/settings**
  - `.claude/settings.json` is the committed project file.
  - Most `env` values wait for workspace trust.
  - Cloud sessions read it in a single-repository session, but not in a claude.ai Project's cloud threads.
- **https://code.claude.com/docs/en/settings-reference**: `autoMemoryEnabled` can be set in any settings file.
- **https://code.claude.com/docs/en/memory**
  - `@path` imports resolve relative to the importing file, up to four hops, and are skipped inside code spans.
  - The project-root `CLAUDE.md` is re-read after `/compact`. Target under 200 lines.
  - Auto memory is per machine (first 200 lines or 25 KB of its `MEMORY.md`).
- **https://code.claude.com/docs/en/cloud-environments**
  - Default Anthropic-hosted image: Ubuntu 24.04 with Node.js 20, 21 and 22, 22 on `PATH`.
  - A single-repository cloud session loads the repository's `.claude/settings.json` hooks, `.claude/agents/`,
    `.claude/skills/` and `.mcp.json`. Project cloud threads load only `CLAUDE.md`, `.claude/CLAUDE.md` and
    `.claude/rules/`.
  - The GitHub proxy rejects branch deletions and tag pushes but not branch pushes.
  - `CLAUDE_CODE_REMOTE` is `true` in cloud sessions.

## Assumptions to test (stated, not proven)

From SPEC §8, with what the pages above now say:

1. **Hooks, agents and `.mcp.json` load in a single-repo cloud session, not in a claude.ai Project's cloud
   threads.** The cloud-environments page says so (sourced), but it has not been observed with this template.
   Test: open a cloud session on the owner's repo. Check that the SessionStart context block appears, that
   `/agents` lists the five roles, and that `/hooks` lists the four events.
2. **Node is present in cloud sessions.** Sourced for the default Anthropic-hosted image; unknown for self-hosted or
   custom images. Test: `node --version` in the cloud session.
3. **`SessionEnd` fires in cloud sessions.** Not found in the docs. Test: change a memory file, end the session
   without another reply, then check the remote branch for a `sauvegarde:` commit made after the last Stop. The
   Stop save covers most changes even if SessionEnd never fires.

Added during the build:

4. **The concurrency cap counts nested subagents.** The docs say "running in one session" but do not say whether a
   subagent's own subagents count. `coordination` is told it is one of the three, so it launches at most two.
   Test: ask `coordination` for a four-part job and watch how many run at once.
5. **The cloud session's branch has an upstream.** `sauvegarde.mjs` pushes only to the current branch's upstream
   and never creates one. I could not confirm from the docs whether a cloud session's working branch has an upstream
   when it starts. Test: `git rev-parse --abbrev-ref @{u}` in a cloud session. If there is none, memory commits stay
   local until Claude pushes the branch. They also land on that branch, not on `main`, until it is merged; decide
   how the owner's memory reaches `main`.
6. **Hooks on Windows without Git Bash.** They run in PowerShell, and the docs say `${CLAUDE_PROJECT_DIR}` is
   rewritten; this was not tested (the test machine has Git Bash). Test on such a machine: start a session and
   look for the context block.
7. **Workspace trust.** On the owner's computer, the hooks and the `env` cap wait until the owner accepts the trust
   dialog for the folder; the setup playbook should say so.
8. **`Skill` in a subagent's `tools` list.** The sub-agents page mentions listing `Skill`; the roles list it so
   they can load skills. Test: ask `revision` to run `verification-des-faits`.
9. **Executable bit of `.githooks/pre-commit` on Linux and macOS.** It is committed as 100755, and SessionStart
   re-applies `chmod 755`. A copy that loses the mode before the first session has no pre-commit check until then;
   `sauvegarde.mjs` runs the scanner itself, so the auto-save is covered either way.

## Design choices where the spec is silent

- **Stop "change of work":** a file outside `memoire/`, `.git/`, `node_modules/` and `.claude/cache/` whose
  modification time is after the session start. `etat-en-cours.md` counts as updated when its content (minus the
  PreCompact stamp) differs from its content at session start. A session with no start record (for example a
  `fork`, which the spec's matcher does not include) is never blocked.
- **Profile summary:** the `## Résumé` (or Summary, En bref, Aperçu) section of `profil-entreprise.md` when it
  exists, otherwise its first lines, cut at 500 characters. Align with the format `business-profile-intake` writes.
- **Auto-save scope:** the spec's paths plus `.claude/skills/`, so installed skills reach cloud sessions.
  - It stages changed files by name and commits with `git commit --only`, so anything else staged stays out.
  - It skips while a merge or rebase is in progress.
  - When nothing changed but the branch is ahead and the last commit is a `sauvegarde:`, it retries the push.
  - Pushes use `GIT_TERMINAL_PROMPT=0` so a missing credential never hangs a hook.
  - Commit dates are UTC (`sauvegarde: 2026-01-31T19:05:00Z`).
- **Scanner rules:**
  - Provider prefixes: `sk-`, `sk_live_`/`sk_test_`/`rk_…`, `xkeysib-`/`xsmtpsib-`, `AKIA`/`ASIA`, `gh[pousr]_`,
    `github_pat_`, `xox?-`, `AIza`, `EAA…`, `SG.`.
  - Private key blocks.
  - A secret written after a label (`password`, `token`, `mot de passe`, `clé API`, `jeton`…).
  - Tokens of 32+ characters with upper and lower case and digits and Shannon entropy ≥ 4.2, after removing URLs
    and data URIs. Hex strings, file names, identifiers and paths are skipped.
  - In `memoire/` only: emails, North American phones, Canadian postal codes and civic addresses (`1234 rue …`).
    The last two go beyond "email and phone" because SPEC §2.4 also forbids street addresses.
  - `memoire/.autorises` allows contact lines only, never keys.
- **False-positive measurement (measured 2026-11-11):**
  - The 47 candidate skills of SPEC §4.1 (122 tracked files): 0 findings.
  - The sources of the adapted and extra skills (`skill-router`, `canvas-design`, `planning-with-files`,
    `filesystem-context`, `handoff`, 101 files): 0 findings.
  - The whole `skills/` library (3,894 text files, mostly developer material): 62 findings, mostly example
    credentials and UUID-like identifiers.
  - An installed skill that trips the scanner blocks the whole auto-save. Fix the skill, or remove it from
    `.claude/skills/`.
- **`CLAUDE.md` imports `memoire/MEMOIRE.md`** so the memory index loads every session (at most 200 lines).
- **Claude Code's auto memory is left on** (default). `CLAUDE.md` tells the agent the same never-secrets,
  never-customer-identity rules apply there and that durable memory belongs in `memoire/`. If you want one memory
  only, add `"autoMemoryEnabled": false` to `.claude/settings.json`.
- **`.gitignore` ends with `!.claude/`.** It is a no-op in the owner's repository. In the pack repository it
  re-includes this folder's `.claude/`, which the repository's root `.gitignore` ignores.
