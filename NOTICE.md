# Notices and attribution

This repository redistributes skills written by many authors. This file records where they came from
and which licences apply. See `LICENSE` (tooling, MIT) and `LICENSE-CONTENT` (skill content, CC BY 4.0
unless a more specific notice applies).

## Community catalogue

Most skills marked `source: community` (about 1,178 at the time of writing) were collected from:

- **Agentic Awesome Skills** (formerly `antigravity-awesome-skills`) by sickn33 —
  https://github.com/sickn33/agentic-awesome-skills
- Its code is MIT-licensed; its non-code content is published under CC BY 4.0 "unless a more specific
  upstream notice says otherwise" (its `LICENSE-CONTENT`).
- Per-skill upstream authors, licences and exceptions are tracked in its ledger: `docs/sources/sources.md`.
- Upstream checked at commit `1d27201535aad0fdd5cb54024e2eaad9d9221dc4` (2026-10-30). The skills here are an
  earlier snapshot (their `date_added` fields run from early 2026); upstream may have changed them since.

Importing that ledger's per-skill exceptions into this repository is pending.

## Skills with their own licence files

These folders carry their own licence, which takes precedence over `LICENSE-CONTENT`:

| Skill folder | Licence |
| :--- | :--- |
| `3. Data-AI/LLM-NLP/claude-api` | Apache-2.0 (LICENSE.txt) |
| `3. Data-AI/LLM-NLP/web-artifacts-builder` | Apache-2.0 (LICENSE.txt) |
| `3. Data-AI/LLM-NLP/xvary-stock-research` | MIT (LICENSE) |
| `4. Development/Backend/webapp-testing` | Apache-2.0 (LICENSE.txt) |
| `4. Development/Frontend/frontend-design` | Apache-2.0 (LICENSE.txt) |
| `5. General/Communication/slack-gif-creator` | Apache-2.0 (LICENSE.txt) |
| `5. General/Learning/brand-guidelines-anthropic` | Apache-2.0 (LICENSE.txt) |
| `5. General/Learning/brand-guidelines-community` | Apache-2.0 (LICENSE.txt) |
| `5. General/Learning/internal-comms-anthropic` | Apache-2.0 (LICENSE.txt) |
| `5. General/Learning/internal-comms-community` | Apache-2.0 (LICENSE.txt) |
| `5. General/Learning/theme-factory` | Apache-2.0 (LICENSE.txt) |
| `5. General/Other/algorithmic-art` | Apache-2.0 (LICENSE.txt) |
| `5. General/Other/canvas-design` | Apache-2.0 (LICENSE.txt) |
| `5. General/Other/diary` | MIT (LICENSE) |
| `5. General/Other/mcp-builder` | Apache-2.0 (LICENSE.txt) |
| `5. General/Productivity/notebooklm` | MIT (LICENSE) |
| `7. Security/Forensic/internal-comms` | Apache-2.0 (LICENSE.txt) |
| `7. Security/Other/loki-mode` | MIT (LICENSE) |
| `7. Security/Other/skill-creator` | Apache-2.0 (LICENSE.txt) |
| `4. Development/3D-Blender/img2threejs` | Apache-2.0 (LICENSE) |

## Copyleft and undeclared licences

These skills declare a copyleft licence or none. They are redistributed here as documentation only;
do not copy code from them into closed-source work without reading their terms.

| Skill folder | Declared licence |
| :--- | :--- |
| `1. Architecture/Patterns/wordpress-theme-development` | GPL-2.0 |
| `7. Security/Protection/wordpress-plugin-development` | GPL-2.0-or-later |
| `3. Data-AI/LLM-NLP/skyvern-browser-automation` | AGPL-3.0 |
| `3. Data-AI/Database/uniprot-database` | not declared |
| `3. Data-AI/Other/biopython` | not declared |
| `6. Infrastructure/DevOps/pubmed-database` | not declared |
| `3. Data-AI/LLM-NLP/buywhere-product-catalog` | not declared |
| `3. Data-AI/Database/django-perf-review` | "LICENSE" (file not present) |

## Licences stated in a skill's own text

| Skill folder | Licence stated |
| :--- | :--- |
| `6. Infrastructure/Other/terraform-skill` | Apache-2.0 |
| `7. Security/Forensic/skill-audit` | MIT (adapted from aptratcn/skill-audit) |
| `3. Data-AI/Other/humanize-chinese` | adapted from voidborne-d/humanize-chinese; licence not stated |

## Removed for licence reasons (2026-10-30)

- `docx-official`, `pdf-official`, `pptx-official`, `xlsx-official`: their `LICENSE.txt` reads
  "© 2025 Anthropic, PBC. All rights reserved." They are source-available, not redistributable here.
- `blender-skills/hunyuan3d-2.1`: Tencent Hunyuan 3D 2.1 Community License, which excludes the EU, the
  UK and South Korea and adds an acceptable-use policy. Not an open licence; not redistributed here.
- `vscode-extension-guide-en` (removed 2026-10-31): its text says it is adapted from aktsmm/agent-skills
  under CC BY-NC-SA 4.0, a non-commercial licence.
- `django-access-review` (removed 2026-10-31): its text says it includes OWASP Cheat Sheet Series material
  under CC BY-SA 4.0, a share-alike licence.
- `fix-review` (removed 2026-10-31): its source is trailofbits/skills, licensed CC BY-SA 4.0 (share-alike).

## mattpocock/skills (MIT)

Imported 2026-11-03 from https://github.com/mattpocock/skills at commit `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`, byte for byte
(`SKILL.md` and every tracked file in each skill folder, including `agents/openai.yaml`). Scanned before import:
hygiene.mjs, detect-secrets 1.5.0 and Cisco skill-scanner 2.3.2 (rules) found nothing beyond one false positive; a
Claude Haiku 5.5 review rated all 39 upstream skills benign. On the owner's instruction (2026-11-02) the remaining 9 were also imported. They replace earlier copies with
the same names, three of them Core skills (see `core.json`), and `code-review` shares its name with a Claude Code
built-in command:

| Skill folder here | Upstream path | Note |
| :--- | :--- | :--- |
| `9. Workflow/Project Mgmt/grill-me` | `skills/productivity/grill-me` | replaced an earlier, unattributed copy (7 file(s)) |
| `9. Workflow/Project Mgmt/grill-with-docs` | `skills/engineering/grill-with-docs` | replaced an earlier, unattributed copy (9 file(s)) |
| `9. Workflow/Project Mgmt/handoff` | `skills/productivity/handoff` | replaced an earlier, unattributed copy (7 file(s)) |
| `1. Architecture/Analysis/improve-codebase-architecture` | `skills/engineering/improve-codebase-architecture` | replaced an earlier, unattributed copy (4 file(s)) |
| `4. Development/Tools/prototype` | `skills/engineering/prototype` | replaced an earlier, unattributed copy (3 file(s)) |
| `5. General/Learning/setup-matt-pocock-skills` | `skills/engineering/setup-matt-pocock-skills` | replaced an earlier, unattributed copy (6 file(s)) |
| `4. Development/Tools/tdd` | `skills/engineering/tdd` | replaced an earlier, unattributed copy (6 file(s)) |
| `9. Workflow/Project Mgmt/triage` | `skills/engineering/triage` | replaced an earlier, unattributed copy (3 file(s)) |
| `4. Development/Tools/code-review` | `skills/engineering/code-review` | new |

| Skill folder here | Upstream path |
| :--- | :--- |
| `5. General/Learning/ask-matt` | `skills/engineering/ask-matt` |
| `1. Architecture/Patterns/codebase-design` | `skills/engineering/codebase-design` |
| `4. Development/Tools/diagnosing-bugs` | `skills/engineering/diagnosing-bugs` |
| `1. Architecture/Analysis/domain-modeling` | `skills/engineering/domain-modeling` |
| `4. Development/Tools/implement-spec` | `skills/engineering/implement-spec` |
| `4. Development/Tools/implement` | `skills/engineering/implement` |
| `9. Workflow/Git/pr` | `skills/engineering/pr` |
| `5. General/Learning/research` | `skills/engineering/research` |
| `9. Workflow/Project Mgmt/retro` | `skills/engineering/retro` |
| `9. Workflow/Project Mgmt/to-spec` | `skills/engineering/to-spec` |
| `9. Workflow/Project Mgmt/to-tickets` | `skills/engineering/to-tickets` |
| `1. Architecture/Analysis/wayfinder` | `skills/engineering/wayfinder` |
| `5. General/Other/wizard` | `skills/engineering/wizard` |
| `5. General/Productivity/chief-of-staff` | `skills/in-progress/chief-of-staff` (upstream marks it in progress) |
| `9. Workflow/Project Mgmt/claude-handoff` | `skills/in-progress/claude-handoff` (upstream marks it in progress) |
| `5. General/Productivity/loop-me` | `skills/in-progress/loop-me` (upstream marks it in progress) |
| `4. Development/Tools/setup-ts-deep-modules` | `skills/in-progress/setup-ts-deep-modules` (upstream marks it in progress) |
| `1. Architecture/Agents/software-factory` | `skills/in-progress/software-factory` (upstream marks it in progress) |
| `5. General/Communication/writing-beats` | `skills/in-progress/writing-beats` (upstream marks it in progress) |
| `5. General/Communication/writing-fragments` | `skills/in-progress/writing-fragments` (upstream marks it in progress) |
| `5. General/Communication/writing-shape` | `skills/in-progress/writing-shape` (upstream marks it in progress) |
| `9. Workflow/Git/git-guardrails-claude-code` | `skills/misc/git-guardrails-claude-code` |
| `4. Development/Tools/migrate-to-shoehorn` | `skills/misc/migrate-to-shoehorn` |
| `5. General/Learning/scaffold-exercises` | `skills/misc/scaffold-exercises` |
| `9. Workflow/Git/setup-pre-commit` | `skills/misc/setup-pre-commit` |
| `9. Workflow/Project Mgmt/grilling` | `skills/productivity/grilling` |
| `5. General/Learning/teach` | `skills/productivity/teach` |
| `9. Workflow/Project Mgmt/to-questionnaire` | `skills/productivity/to-questionnaire` |
| `5. General/Productivity/wait-what` | `skills/productivity/wait-what` |
| `5. General/Communication/writing-for-agents` | `skills/productivity/writing-for-agents` |

Licence (upstream `LICENSE`, reproduced as MIT requires):

```
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Other third-party code

Code files that keep their own copyright headers (for example vendored scripts inside a skill)
remain under the terms stated in those headers.
