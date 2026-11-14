# Skill library security scan — plan

Status: proposed 2026-11-02, nothing run. Supersedes the executor part of plan decision D9 (see "Ruling").

## Goal

Scan every git-tracked skill (1,502 folders) for malicious instructions, trojan scripts, embedded
secrets, encrypted or high-entropy blobs, and dead weight. Deterministic tools do the reading; a
cheap model reads only the text that tools cannot judge (natural-language instructions); the
orchestrating agent reads one summary, never the files.

## Measured corpus (2026-11-02, `git ls-files -- skills`, excluding `skills/_index`)

| Item | Value |
| :--- | ---: |
| Skill folders | 1,502 |
| Tracked files | 4,667 |
| Total size | 58.7 MB |
| Text | 35.7 MB |
| Binary files (NUL byte in first 8 KB) | 71 files, 23.1 MB |
| Markdown | 2,844 files, 24.8 MB (SKILL.md alone 13.9 MB) |
| Scripts (py, js, mjs, cjs, ts, sh, ps1, bat, cmd, rb, go, rs, php, pl, lua) | 803 files, 4.6 MB |
| Byte-identical duplicate files | 44 |
| Files over 500 KB | 12 (largest: `last30days/assets/*`, 2.4–4.0 MB each: images and an mp3) |

Token conversion uses ~4 bytes per token for English text and code (**model-prior**, not measured):
all text ≈ 8.9 M tokens; SKILL.md ≈ 3.5 M; scripts ≈ 1.2 M.

## Tools (sourced 2026-11-02: each repo/releases page fetched, HTTP 200; capabilities are vendor claims, not measured here)

| Need | Tool, version | Offline | Output | Why |
| :--- | :--- | :--- | :--- | :--- |
| Malicious instructions, exfiltration, malicious code in skills | Cisco AI Defense `skill-scanner` 2.3.2 (Apache-2.0) | yes, unless its LLM judge / VirusTotal / OSV options are turned on | JSON, SARIF, Markdown | Built for agent skills. Its README: rules alone catch 7.7% of its malicious set at HIGH (4.0% false positives); 33.7% with its LLM judge. So rules alone are not enough. |
| Secrets, high-entropy strings | `detect-secrets` 1.5.0 (Apache-2.0) with `--no-verify`; or TruffleHog 3.99.7 (AGPL-3.0) with `--no-verification --no-update` | yes with those flags | JSON / JSON, SARIF | Entropy limits for base64 and hex catch encoded blobs as well as keys. gitleaks 8.30.1 is security-fix-only now. |
| Trojan script patterns (eval of decoded data, curl\|sh, reverse shells, Invoke-Expression, postinstall) | Semgrep 1.183.0 CLI (LGPL-2.1) with local rules, `--metrics=off` | yes with local rules | JSON, SARIF | Windows native is beta: `PYTHONUTF8=1`. |
| Known malware in the 71 binaries | YARA-X 1.22.1 (BSD-3) or ClamAV 1.5.4 (GPLv2) | needs a signature download (ClamAV) | unverified for JSON | Optional; the binaries are images, fonts and audio by extension (measured), to be checked by magic bytes first. |
| Hidden unicode, homoglyphs, disguised binaries, duplicates, oversize, symlinks | none found; own script `scripts/scan/hygiene.mjs` | yes | JSON | No fetched tool claims these. |

Not used: Snyk agent-scan (uploads skill content to Snyk; needs an account). The content is public,
so this is a privacy-neutral but account-bound option, kept as a second opinion only.

Standards reference: OWASP Agentic Skills Top 10 (incubator draft "1.0-2026"): AST01 malicious skills,
AST08 poor scanning ("pattern matching alone misses natural-language injection").

## Cost (prices sourced 2026-11-02 from the vendors' pricing pages; USD per 1 M tokens)

Scope options for the model pass:

- **L1 flagged-only**: only files the tools flagged. Size unknown until S3 runs.
- **L2 instructions + code**: every SKILL.md and script, one request per skill. ≈ 4.7 M content tokens,
  + ≈ 1.5 M rubric overhead (1,000-token rubric × 1,502, cacheable), + ≈ 0.23 M output (150 tokens × 1,502).
- **L3 everything textual**: ≈ 8.9 M + 1.5 M overhead + ≈ 0.7 M output.

| Model and mode | Price in / out | L2 | L3 |
| :--- | :--- | ---: | ---: |
| Gemini 2.5 Flash-Lite, batch | 0.05 / 0.20 | ≈ $0.36 | ≈ $0.66 |
| Claude Haiku 5.5, batch (prompts ≤ 100 k tokens) | 0.05 / 0.25 | ≈ $0.37 | ≈ $0.70 |
| Gemini 2.5 Flash-Lite, standard | 0.10 / 0.40 | ≈ $0.71 | ≈ $1.32 |
| Gemini 2.5 Flash, batch | 0.15 / 1.25 | ≈ $1.22 | ≈ $2.44 |
| Gemini API free tier | $0 | $0, rate-limited, no batch | same |
| Antigravity agent, free individual tier | $0 cash | weekly quota with no published numbers | not recommended |

Rubric overhead is counted uncached; with caching it drops to cents. The estimates rest on the
4-bytes-per-token prior; S5 replaces them with measured tokens per skill.

Orchestrating agent (Claude Code): reads `summary.json` plus High/Critical excerpts only, target
< 30 k tokens. Reading the corpus inside an agent session is the expensive path: 8.9 M tokens does
not fit one context, and an agent re-sends its context on every turn.

## Steps

- [x] S0 Freeze: a read-only worktree of `origin/main` at a pinned SHA; record the SHA. No skill script is ever executed. Gate: `git -C <wt> status --porcelain` empty; SHA recorded. Result: `C:\cs-wt\scan` at `c0ebe21`, 0 changes.
- [x] S1 **[GO: downloads]** Result: `cisco-ai-skill-scanner[google]` 2.3.2 and `detect-secrets` 1.5.0 in `~/.skillscan/venv` (Python 3.14.5; uv could not download 3.13, DNS error). Semgrep deferred. Original text: Install pinned tools outside the repo: `skill-scanner` 2.3.2 (uv/pipx), `detect-secrets` 1.5.0, `semgrep` 1.183.0; optional YARA-X. Check release checksums where published. Gate: each `--version` prints the pinned version.
- [ ] S2 `scripts/scan/hygiene.mjs`: zero-width / bidi / tag characters, mixed-script identifiers, base64 or hex runs > 200 chars, Shannon entropy per line, magic bytes vs extension (zip, gz, exe, elf, pyc), size > 500 KB, duplicate hashes, symlinks, scripts that combine network and exec, broad `allowed-tools`. Gate: planted fixtures each detected, clean fixture 0 findings (self-authored, labelled so).
- [ ] S3 Run all tools over the worktree into `reports/security/<date>/raw/` (gitignored). Gate: skills covered = 1,502 per tool (count), exit codes recorded.
- [ ] S4 Normalise to `findings.jsonl` (skill, file, line, tool, rule, severity, excerpt ≤ 200 chars, file sha) and `summary.json` (per-skill counts by severity). Gate: schema check exit 0; finding count equals the sum of raw reports.
- [ ] S5 Pilot model pass: 20 skills (10 random, 10 most-flagged) plus 3 planted bad fixtures (injection text, curl\|sh, zero-width payload), run on Gemini 2.5 Flash-Lite and Claude Haiku 5.5 with one pinned rubric and JSON output. Gate: both fixtures sets detected or the model is dropped; measured tokens per skill and cost recorded (capability decides the model, not vendor).
- [ ] S6 **[GO: spend, budget cap $2]** Full L2 pass with the pilot winner through the Batch API. API key from an environment variable set by the owner. Gate: verdicts = 1,502; total cost read from the vendor's usage page.
- [ ] S7 Triage: the agent reads `summary.json` and High/Critical excerpts only; writes `quarantine.json`; `install-core.mjs` gains an exclude list so quarantined skills are unlinked from both agents. Gate: the owner reviews the quarantine list (human gate over the model verdicts); `install-core --check` exit 0 after.
- [ ] S8 Dead weight: list binaries, oversize files and duplicates with sizes; the owner decides removals (a public-content deletion needs a GO). Gate: list delivered; nothing removed without a GO.
- [ ] S9 CI: `hygiene.mjs` and `detect-secrets` on changed skill folders, plus a per-skill hash ledger so a changed skill must be rescanned. Gate: CI fails on a planted fixture in a test PR.

## Ruling against D9

D9 had Antigravity read and run Sentry's `skill-scanner` category by category. Evidence fetched today:
Sentry's scanner leaves the judgement to the agent session, while Cisco's emits JSON/SARIF and plugs in
any model. Ruled: the bulk scan runs as scripts plus a batch model call, not as an agent reading files;
an agent (Claude Code or Antigravity) only triages the summary. The owner may keep D9 as written.

## Not verified

- Windows x64 binary names for TruffleHog and YARA-X; ClamAV and YARA-X JSON output.
- Detection quality of every tool on this corpus (S5 measures it on fixtures only).
- Gemini free-tier data-use terms (the content is public, so this is low risk).
- Antigravity weekly quota size.

## Pilot result (2026-11-02, worktree `c0ebe21`)

Step status: S0 [x], S1 [x] (Semgrep deferred), S2 [x], S3 [~] (Semgrep not run), S4 [ ], S5 [~] (Gemini blocked), S6–S9 [ ].

| Tool | Scope | Time | Result |
| :--- | :--- | ---: | :--- |
| `hygiene.mjs` (own) | 4,667 files | 25 s | 26 high, 43 medium, 110 low leads in 31 skills (high or medium). Planted fixtures: 3 of 3 pattern-detectable bad caught, the plain-English one missed, clean 0 (self-authored fixtures and script) |
| Cisco `skill-scanner` 2.3.2, rules only | 1,502 skills | 473 s | 21 skills CRITICAL, 46 HIGH, 28 MEDIUM; 1 skipped (`auri-core`, NUL byte) |
| `detect-secrets` 1.5.0, offline | all files | 111 s | 182 hits in 109 files. Every high-signal hit checked (private key, AWS key, JWT, basic auth) is a placeholder or AWS's published example key. 0 live credentials found among those checked |
| Claude Haiku 5.5 judge (via `claude -p`, rubric as system prompt, no tools, no MCP, no skills) | 25 items | — | 4 of 4 planted bad fixtures "malicious" (incl. the plain-English one), clean fixture "benign"; 20 real skills (10 most-flagged, 10 random, seed 20261102) all "benign" |
| Gemini | — | — | blocked: `gemini-2.5-flash-lite` "no longer available to new users" (HTTP 404); `gemini-3.1-flash-lite` HTTP 402 "prepayment credits are depleted" |

Flagged for the owner (reviews, not verdicts):
- `instagram` uploads images anonymously to Imgur (public host) with a hard-coded client ID; `skill-sentinel` whitelists that exact ID so its own scan does not report it.
- `auri-core/SKILL.md` was damaged at import: a `$0` expanded to `/usr/bin/bash`, one NUL byte left; Cisco refuses to load it.
- `evolution` tells the agent to pipe a third-party GitHub `install.sh` into bash.
- `web-artifacts-builder` ships a `.tar.gz`: 49 shadcn `.tsx/.ts` files, no links, no network or eval code (extracted to an isolated folder and scanned).

Measured tokens (Haiku, 20 real skills, SKILL.md + scripts, rubric + ~1,000 tokens of CLI overhead per call):
191,586 input, 8,008 output for 427,084 characters. Content runs ≈ 2.5 characters per token, so the "4 bytes per token" prior
above undercounts by ≈ 1.6×. Random 10 (N=10): 4,431 input and 240 output tokens per skill on average.
Full L2 projection: ≈ 6.7–9 M input, ≈ 0.4–0.6 M output tokens. At list prices: Haiku 5.5 batch ≈ $0.50–0.60, standard ≈ $1.00–1.20;
Gemini 3.1 Flash-Lite batch ≈ $1.15–1.60. The CLI path reported $0.044 for the 25 calls (its own list-price estimate; on a
subscription this draws on plan usage, not cash).

Contradictions recorded:
- The cost table above listed Gemini 2.5 Flash-Lite as the cheapest option; the API refuses it to new users. Ruled: the API wins; cheapest usable Gemini is 3.1 Flash-Lite.
- The plan assumed ≈ 4 bytes per token; measured ≈ 2.5 characters per token on this corpus. Ruled: measured.
- The pilot shows the rules-only scanners flag mostly security education and official installers; the model judged all 10 most-flagged benign. Pattern hits are leads, not findings.

Not yet covered: 67 flagged skills outside the pilot (union of Cisco HIGH/CRITICAL and hygiene high/medium is 78; 11 of them were judged), the
model pass over the other ~1,400 skills, Semgrep, YARA-X/ClamAV on the 71 binaries.

## Follow-up script (2026-11-02)

`scripts/scan/finish.mjs` runs after the full pass:
1. It waits for a running pass with `--wait`. Without it, it refuses to start a second writer and exits 3.
2. It resumes until every skill has a verdict, up to `--max-reruns` (default 2). It stops early when a rerun makes no progress.
3. It writes `needs-manual.json`.
4. It re-runs `normalize.mjs`. It refuses when that script's hard-coded folder differs from `--reports`.
5. It checks the merged output against the source reports with 7 gates: coverage, verdicts present, finding count, assignment, path containment, verdict equality, and unambiguous pilot mapping.
6. It writes `triage.json` and `triage.md`, listing only skills to read: model malicious or suspicious, judging failed, Cisco CRITICAL with a low-confidence benign, and the 4 pilot notes.

Tested on a snapshot copy taken mid-run: the coverage and verdict-equality gates failed on the premature 12:11 summary, as intended; the other 5 passed. Triage then held 8 skills. This was run on my own script against a partial copy, so it shows the script behaves as designed, not that the final data is correct.

`model-pass.mjs` parser: it now also parses a reply with text after the JSON object. Why `imagen` was unparsed is a guess, because the stored reply is cut at 120 characters; the resume retries it.
