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

## Requirement set v2 (what `run-eval.mjs` decides)

| Requirement | Rule |
| :--- | :--- |
| R1 trigger | Every grader named `fired` passes in every run with the skill. |
| R2 no false fire | Every grader named `not-fired` passes in every run with the skill (the without arm cannot fire it, so N = 3 per near-miss case). |
| R3 value | Every case tagged `value` scores higher with the skill than without (delta > 0) **and** passes in at least 2 of 3 runs with the skill. |
| R4 clean | No run ended on an error, and the result is not partial. |

Verdicts: `passed-review` (static gate + R1–R4), `trigger-only` (no `value` case yet, rest true), `incomplete` (R4 false),
`fail` (anything else). Rule change 2026-10-31 (v1 to v2), recorded in the runner before any further run: v1's R3 had
no absolute floor, so a skill passed with 1 of 3 with-skill runs passing, and v1's R2 counted the without arm too.
Records carry `requirementSet`. The runner never writes `verified`: R3 rests on an LLM judge, which is a review. A skill moves
from `passed-review` to `verified` in `core.json` only after the owner's blind sample of its judged cases agrees. `claude plugin eval`'s own `--threshold` is recorded but does not decide the verdict.
Eval runs are isolated by Claude Code: no user skills, settings, CLAUDE.md or MCP servers load in either arm.

Typical runs:

```bash
node scripts/verify/run-eval.mjs grill-me --max-cost-usd 3 --concurrency 3
```

```bash
node scripts/verify/run-eval.mjs grill-me --rescore .verify/runs/<run-folder>
```

## Results, 2026-10-31

All 24 provisional Core skills. CLI 2.1.314; agent claude-sonnet-5-5; judge claude-haiku-5-5; 3 runs per arm;
one suite run per skill (grill-me: final of three). Scored under requirement set v2 (all run dirs rescored, $0, no new runs). Value = judged `value` case score with / without the skill.
Per-skill details are in `core.json` (`result`) and `verifications/<skill>.json`.

| Verdict | Count | Skills |
| :--- | ---: | :--- |
| passed-review | 14 | grill-me, grill-with-docs, brainstorming, multi-agent-brainstorming, ux-flow, idea-os, pricing-strategy, multi-agent-task-orchestrator, enhance-prompt, french-canadian, accessibility-compliance-accessibility-audit; name-invoked: planner, handoff, ui-visual-validator |
| fail: below the 2-of-3 floor (v2) | 3 | minimalist-ui, spec-to-code-compliance, agents-md (delta 0.33, with arm passed 1 of 3); passed under v1 |
| fail: no measured value | 6 | startup-analyst, scroll-experience, content-strategy (0 / 0), product-design (0 / 0.33); name-invoked: skill-router, product-manager (0 / 0) |
| trigger-only | 1 | pre-deployment-review (value case needs a fixture project and Bash) |

No skill fired on any near-miss (0 false fires in 3 with-skill runs each). Spend: $13.98 total at Claude Code's list-price
estimate (pilots $1.92, 22-skill batches $9.96, name-invoked re-run $2.10).

Invocation rule (user decision, 2026-10-31): skills the user invokes by name (`invocation: "name"` in `core.json`)
are tested with an explicit `/<skill> ...` case. Claude Code expands the command directly, so there is no Skill tool
call to detect; an `invocable` regex grader on the run trace confirms the command was registered in every with-skill
run, and the value case does the rest. A probe (planner, 1 run per arm) showed the expanded command was followed and
the without arm reported the command missing and still ran cleanly.
skill-router's value cannot show in isolated eval runs: it routes to the user's installed skills, and runs load none.

Caveats:
- One suite run per skill (N = 3 per arm). Deltas of 0.33 rest on a single run's difference; treat them as weak.
- The judge returns votes without reasons, so a failed judged case cannot always be explained from the record.
- Rubrics were written by agents from each SKILL.md and are reviews until the user's blind samples confirm them.
- The five name-invoked skills were first tested for auto-triggering (0/3, 0/3, 0/3, 0/3, 2/3); those results are in
  git history. The user's transcripts show each is typed as `/skill` at least as often as it is auto-invoked.
- grill-me's judged rubric was corrected once (v1 counted question marks; see the grader's "Rubric history").
