# Verification harness

Scripts that decide whether a skill may enter or stay in the Core (`core.json`). Plan decisions D3, D6b and D14.
All output goes to `.verify/` (gitignored). Only `verifications/<skill>.json` records are committed, and only for completed runs.

| Script | What it decides | Needs a Claude login |
| :--- | :--- | :--- |
| `usage-report.mjs` | Demand: Skill-tool invocations per skill from local transcripts (`--core core.json` checks the demand rule). Output names client projects, so keep it local. | no |
| `wrap.mjs <skill>` | Static gate: strict YAML frontmatter, `claude plugin validate`, and the skill loading under `claude plugin details` (token cost recorded). | no |
| `context-cost.mjs home\|core` | Always-on context cost of today's install vs the Core, from Claude Code's estimator. | no |
| `run-eval.mjs <skill>` | Static gate, then `claude plugin eval` with and without the skill, pinned models, local report only, cost ceiling. Writes `verifications/<skill>.json`. | yes |

Eval cases live in each skill's own `evals/` folder (format: <https://code.claude.com/docs/en/plugin-evals>).
Every case has a trigger indicator (`tool_used: Skill`) and, where judgement is involved, an `llm` grader scored in both arms
so the with-minus-without delta measures the skill's value. Judgement-call verdicts from the `llm` grader are reviews;
the user blind-grades a sample of about one in five (D6b).

Typical run:

```bash
node scripts/verify/run-eval.mjs grill-me --max-cost-usd 3
```
