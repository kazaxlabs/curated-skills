# Pipeline rationale and sources

Background for `planner`. Load this only when you need to justify or amend the pipeline —
running it does not require this file.

## What was changed, and why

The original skill (1,744 bytes, `source: community`) said: *"Automatically activate ALL
skills below on every task"*, listed nineteen skills, and gave eight stage names with no
gates, no failure handling, and no evidence requirements. Three defects were corrected on
2026-09-05.

### 1. Unconditional skill loading → conditional loading

Loading nineteen skills on every task — including UI skills on tasks with no UI —
saturates the context window. Model recall degrades as context grows, which is why Agent
Skills use progressive disclosure: only `name` and `description` load at startup, and the
body loads when triggered.

- Anthropic, *Effective context engineering for AI agents* —
  https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, *Equipping agents for the real world with Agent Skills* —
  https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

There is a hard constraint too: Antigravity caps rules files at 12,000 characters, so the
governing contract cannot carry stage detail inline.

- Google, *Rules* — https://antigravity.google/docs/rules-workflows/ (primary vendor)

### 2. Stage names → stages with machine verdicts

Stages 5, 7 and 8 were all the same model grading its own output. Stechly, Valmeekam and
Kambhampati measured false-negative rates of 95.8% (graph colouring) and 97.09% (Mystery
Blocksworld) on self-verification — models routinely fail to recognise their own correct
answers — and concluded that verification belongs in external sound systems rather than
in the model. Stacking three self-review passes compounds cost, not confidence.

- Stechly, Valmeekam & Kambhampati, *On the Self-Verification Limitations of Large
  Language Models on Reasoning and Planning Tasks*, ICLR 2025 —
  https://proceedings.iclr.cc/paper_files/paper/2025/file/f3c5e56274140e0420baa3916c529210-Paper-Conference.pdf
- Cemri et al., *Why Do Multi-Agent LLM Systems Fail?*, NeurIPS 2025 (MAST; 1,600+
  annotated traces; task-verification failures ≈21% of all failures) —
  https://arxiv.org/abs/2503.13657

On Stage 3 specifically: reward-hacking benchmarks document coding agents overwriting unit
tests, deleting assertions, hardcoding expected outputs, and editing test files to obtain
a passing score. A suite the agent authored is not an independent oracle for code the same
agent authored.

- *EvilGenie: A Reward Hacking Benchmark* — https://arxiv.org/pdf/2511.21654
- *SpecBench: Measuring Reward Hacking in Long-Horizon Coding Agents* —
  https://arxiv.org/html/2605.21384v1

### 3. Strict ordering → ordering with defined re-entry

A static one-shot plan is brittle when execution surprises it, and errors propagate
forward rather than cancelling. MAST measured up to 17× error amplification in
uncoordinated multi-agent setups, falling to roughly 4.4× with a centralised validation
bottleneck. The original skill said "always in order" and defined no behaviour for the
ordinary case where Stage 6 surfaces a defect owned by Stage 2.

### 4. `@refactor-clean-code` → `code-refactoring-refactor-clean`

The referenced skill does not exist in this repository. An unresolvable skill reference
fails silently. The real skill is at
`skills/1. Architecture/Patterns/code-refactoring-refactor-clean/`. Run
`python scripts/validate_agent_config.py` to catch this class of defect.

## Attribution note

"Deep modules" — substantial capability behind a narrow interface — is Ousterhout, *A
Philosophy of Software Design*. The **deletion test** is a practitioner operationalisation
of that principle, not Ousterhout's own term. Attribute it accordingly; the point of the
evidence gate is defeated if the pipeline that enforces it misattributes its own
principles.

## Why the gate is mechanical

`AGENTS.md` §2 requires a URL to have been fetched and returned 200 before a claim counts
as sourced. That rule exists because tier labelling alone does not catch fabrication: a
label is applied by the same agent making the claim, and costs nothing.

The local evidence is `ontology_research/` (untracked, present on this machine). The same
discipline ran there and produced a citation to `arXiv:2607.16973` that could not be
located, an unverified "ICLR 2026" venue, and a benchmark tournament granting the home
system a free fatigue reset while charging competitors a +1800s penalty — retracted across
eleven documents. None of it was caught by tier labelling; an adversarial audit caught it
months later. See `ontology_research/docs/remediation_plan.md` and
`ontology_research/README.md`, whose working rules are the origin of several lines in
`AGENTS.md` §2.
