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

## Requirement set (what `run-eval.mjs` decides)

| Requirement | Rule |
| :--- | :--- |
| R1 trigger | Every grader named `fired` passes in every run with the skill. |
| R2 no false fire | Every grader named `not-fired` passes in every run of both arms. |
| R3 value | Every case tagged `value` scores higher with the skill than without (delta > 0). |
| R4 clean | No run ended on an error, and the result is not partial. |

Verdicts: `pass` (static gate + R1–R4), `trigger-only` (no `value` case yet, rest true), `incomplete` (R4 false),
`fail` (anything else). `claude plugin eval`'s own `--threshold` is recorded but does not decide the verdict.
Eval runs are isolated by Claude Code: no user skills, settings, CLAUDE.md or MCP servers load in either arm.

Typical runs:

```bash
node scripts/verify/run-eval.mjs grill-me --max-cost-usd 3 --concurrency 3
```

```bash
node scripts/verify/run-eval.mjs grill-me --rescore .verify/runs/<run-folder>
```

Pilot results, 2026-10-31 (CLI 2.1.314; agent claude-sonnet-5-5, judge claude-haiku-5-5; 3 runs per arm):

| Skill | Trigger | False fire | Value delta | Verdict | Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| grill-me | 3/3 | 0/6 | +1.0 | pass | $0.34 |
| pre-deployment-review | 3/3 | 0/6 | untested | trigger-only | $0.50 |

grill-me's judged rubric was corrected once (v1 counted question marks; see the grader's "Rubric history").
Under rubric v2 the with-skill arm passed 5 of 6 judged runs across two suite runs, the without arm 0 of 6.
