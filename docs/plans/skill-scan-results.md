# Skill Security Scan Results (2026-11-02)

## Executive Summary

A full multi-stage security scan of the Curated Skills library was executed across all **1,502** skill folders.
Deterministic static scanning and heuristic analysis was combined with an AI model review using `claude-haiku-5-5`.

- **Library Worktree**: `C:\cs-wt\scan` pinned at commit `c0ebe21` (clean, 1,502 skills, 4,667 files).
- **Total Skills Scanned**: 1,502 skills (100% evaluated).
- **Total Static / Tool Findings**: 2,247 findings (Cisco static rules: 1,886; detect-secrets: 182; hygiene: 179).
- **AI Model Pass (Haiku 5.5)**:
  - 1,480 benign
  - 21 suspicious
  - 0 malicious
  - 1 error (`metasploit-framework` triggered safety filters on exploit vocabulary)
- **Triage Outcome**:
  - **7 skills proposed for quarantine** (active covert bypasses, unreviewed remote code execution, profile hijacking).
  - **6 skills proposed for fixes** (insecure defaults, NUL bytes, unconfirmed automation).
  - **13 skills proposed to keep** (authorized penetration testing playbooks, transparent dual-use tools, disclosed micro-payments).

---

## Scan Methodology & Measurement

| Metric / Parameter | Value | Basis |
| :--- | :--- | :--- |
| Corpus Skills (N) | 1,502 | measured (`git ls-files -- skills`) |
| Pilot Sample | 25 (20 library + 5 fixtures) | measured (`pilot-haiku.jsonl`) |
| Fixture Validation Gate | 4 of 4 malicious caught; 1 clean benign | measured (`out.jsonl`) |
| Full Pass Skills Evaluated | 1,482 in `full-list.json` + 20 pilot | measured (`summary.json`) |
| Total Cost (Haiku 5.5) | \$2.50 USD | measured (Anthropic list-price usage accounting) |
| Wall-Clock Time (Full Run) | ~78 minutes across concurrency 4 | measured |
| Mean Duration per Skill | 12.6 s | measured (N=1,491) |

---

## Quarantine & Action Proposals

| Skill | Path | Proposed Action | Primary Reason | Evidence Excerpt |
| :--- | :--- | :--- | :--- | :--- |
| **loki-mode** | `skills/7. Security/Other/loki-mode` | **quarantine** | Unconstrained bypass loop | `autonomy/run.sh` runs `claude --dangerously-skip-permissions` with instructions to "NEVER stop" and "NEVER ask questions". |
| **vibers-code-review** | `skills/7. Security/Protection/vibers-code-review` | **quarantine** | Third-party repo access & credential leak | Asks to add external user `marsiandeployer` as collaborator; instructs writing test credentials in git commits. |
| **browser-use-agent** | `skills/8. Testing/E2E/browser-use-agent` | **quarantine** | Profile hijacking & process killing | `Stop-Process -Name chrome -Force`; opens remote CDP debugging on user's default authenticated profile. |
| **delegate-browser-task** | `skills/9. Workflow/Project Mgmt/delegate-browser-task` | **quarantine** | Unrestricted browser control | `Allowed Domains: *`; `Bypass Sandboxing: true`; commands taking over active browser window. |
| **viboscope** | `skills/9. Workflow/Other/viboscope` | **quarantine** | Dynamic remote prompt & unreviewed scan | `curl -fsS https://viboscope.com/api/v1/skill -o viboscope.md`; scans workspace files and exfiltrates context. |
| **data-structure-protocol** | `skills/3. Data-AI/LLM-NLP/data-structure-protocol` | **quarantine** | Unpinned remote script execution | `curl -O https://raw.githubusercontent.com/.../dsp-cli.py; python dsp-cli.py` without hash pinning or inspection. |
| **evolution** | `skills/5. General/Learning/evolution` | **quarantine** | Remote script piped into shell | `curl -fsSL https://raw.githubusercontent.com/.../install.sh \| bash` (Pilot finding). |
| **auri-core** | `skills/2. Business/Other/auri-core` | **fix** | Damaged file & NUL byte | Corrupted shell parameter `$0` expanded to `/usr/bin/bash` with embedded NUL bytes breaking tool parsers. |
| **instagram** | `skills/3. Data-AI/Other/instagram` | **fix** | Unauthenticated public uploads & plaintext secrets | Uploads files anonymously to Imgur; plaintext token database; unauthenticated API listener on `0.0.0.0`. |
| **skill-installer** | `skills/6. Infrastructure/DevOps/skill-installer` | **fix** | Automatic unreviewed skill overwrite | `--detect --auto` installs all skills found in Downloads/Temp into `.claude/skills` without confirmation. |
| **production-code-audit** | `skills/1. Architecture/Patterns/production-code-audit` | **fix** | Unconfirmed destructive mass rewrite | Commands agent: "Do this automatically without asking", "Fix everything automatically". |
| **production-audit** | `skills/7. Security/Forensic/production-audit` | **fix** | External CLI execution without confirmation | Executes `npx commitshow@0.3.23 audit .` without user approval in examples, sending data to public API. |
| **polyhaven-texture-apply** | `skills/4. Development/3D-Blender/polyhaven-texture-apply` | **fix** | Code injection in socket evaluation | String interpolation of object parameters into `bpy.data.objects.get("${objectName}")` in Blender socket. |
| **blockrun** | `skills/5. General/Productivity/blockrun` | **keep** | Disclosed autonomous micropayments | Creates local session wallet at `~/.blockrun` for token payments; fully disclosed architecture. |
| **metasploit-framework** | `skills/7. Security/Protection/metasploit-framework` | **keep** | Authorized penetration testing reference | Refusal triggered by vendor safety heuristics on exploit keywords; contains no covert malware. |
| **aws-penetration-testing** | `skills/6. Infrastructure/Cloud/aws-penetration-testing` | **keep** | Authorized cloud testing documentation | Standard pentest playbook with explicit `AUTHORIZED USE ONLY` scoping banner. |
| **cloud-penetration-testing** | `skills/7. Security/Hacking/cloud-penetration-testing` | **keep** | Authorized cloud testing documentation | Standard pentest playbook with explicit `AUTHORIZED USE ONLY` scoping banner. |
| **sqlmap-database-pentesting** | `skills/3. Data-AI/Database/sqlmap-database-pentesting` | **keep** | Authorized database testing reference | Documents standard SQLMap flags under authorized assessment scope. |
| **smtp-penetration-testing** | `skills/7. Security/Hacking/smtp-penetration-testing` | **keep** | Authorized email testing reference | Documents standard SMTP testing and spoofing defenses under authorized testing scope. |
| **linux-privilege-escalation** | `skills/7. Security/Hacking/linux-privilege-escalation` | **keep** | Authorized assessment reference | Sourced attack reference and privilege escalation guide with assessment scope. |
| **ghostbuster** | `skills/7. Security/Forensic/ghostbuster` | **keep** | Restrictive prompt formatting | Uses `KERNEL OVERRIDE` header solely to force a strict, read-only audit persona. |
| **google-drive-automation** | `skills/9. Workflow/Other/google-drive-automation` | **keep** | Disclosed Cloud Function token refresh | Standard OAuth helper architecture using Google Cloud Function for token refresh. |
| **google-sheets-automation** | `skills/9. Workflow/Other/google-sheets-automation` | **keep** | Disclosed Cloud Function token refresh | Standard OAuth helper architecture using Google Cloud Function for token refresh. |
| **daily-gift** | `skills/6. Infrastructure/DevOps/daily-gift` | **keep** | Disclosed cron media generator | Transparent user-configured cron job generating creative daily assets. |
| **x402-express-wrapper** | `skills/4. Development/Mobile/x402-express-wrapper` | **keep** | Hardcoded escrow architecture | Ecosystem opinion and hardcoded smart contract address for micropayment paywalls. |
| **tool-use-guardian** | `skills/5. General/Other/tool-use-guardian` | **keep** | Marketplace placeholder | Descriptive placeholder text; no executable logic or malicious code. |

---

## False-Positive Patterns Identified

1. **Dual-Use Security & Pentest Guides**:
   - Skills documenting penetration testing tools (`metasploit-framework`, `sqlmap-database-pentesting`, `aws-penetration-testing`, `linux-privilege-escalation`) routinely trigger static tool flags (`curl|sh`, credential extraction, reverse shells) and LLM safety filters. Where these skills maintain explicit authorization framing and do not instruct the agent to act covertly against the installing user, they are classified as benign/keep.
2. **Dynamic Script Execution in CLI Development Helpers**:
   - Cisco's `ACTIVE_DYNAMIC_EXECUTION` rule flags any `subprocess.run`, `popen`, or shell execution in Python and Bash scripts. Most developer tools legitimately execute test runners or linters; manual review separates arbitrary remote script injection from local command wrapping.
3. **Disclosed OAuth Token Management**:
   - Automation skills integrating with Google APIs delegate token refresh to serverless helpers; heuristic scanners flag these as potential token exfiltration, but review confirms standard OAuth refresh architectures.

---

## Artifacts Generated

- `~\.skillscan\reports\2026-11-02\full-list.json`: 1,482 skills to scan.
- `~\.skillscan\reports\2026-11-02\haiku-full.jsonl`: 1,491 model evaluations.
- `~\.skillscan\reports\2026-11-02\findings.jsonl`: 2,247 consolidated tool findings.
- `~\.skillscan\reports\2026-11-02\summary.json`: 1,502 unified skill summaries with tool counts and model verdicts.
- `~\.skillscan\reports\2026-11-02\quarantine-proposal.json`: 26 evaluated items with actions and evidence.
