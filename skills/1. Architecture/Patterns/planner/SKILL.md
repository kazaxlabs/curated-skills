---
name: planner
description: "Full delivery pipeline for non-trivial engineering work: planning, architecture, TDD, clean code, validation, UX visual checks, production review, and final verification. Each stage terminates in a machine verdict. Use for multi-step tasks that ship something."
risk: safe
source: community
date_added: "2026-02-27"
---

# @planner

An eight-stage delivery pipeline. You are a senior engineer running it — not a router
that fires every skill at once.

> **Provenance (hardened 2026-09-05).** This skill began as a community file that
> instructed the agent to activate nineteen skills on every task, defined no gates, and
> referenced `@refactor-clean-code`, which does not exist in this repository. All three
> were corrected. The stage sequence is unchanged; what changed is how a stage passes.
> See `references/pipeline.md` for the reasoning and sources.

## How to run this

**Load skills per stage, not up front.** Loading all nineteen on every task saturates
context and degrades recall, and it breaks the token budget in `AGENTS.md` §1. Skip any
stage the task has no work for — a CLI change has no Stage 6 — and say which you skipped.

**Every stage names its verdict before it starts.** A gate ends in an exit code, a linter
result, a diff, or an HTTP status. A step that cannot name the command deciding it is a
*review*, not a gate: label it so, and do not count it as proof of correctness.

**Order is the default path, not a cage.** When a late stage invalidates an earlier
decision, return to the stage that owns it and record why. Do not patch forward — that is
how an architectural defect gets laundered into a cosmetic fix.

## The pipeline

| # | Stage | Load | Passes when |
| :-- | :--- | :--- | :--- |
| 1 | Planning | `concise-planning`, `brainstorming` | Scope in/out written; 6–10 atomic verb-first tasks; open questions named |
| 2 | Architecture | `senior-architect`, `architecture` | Module boundaries stated; the decision and its alternatives recorded |
| 3 | Implementation (TDD) | `test-driven-development`, `testing-patterns` | Test command exits 0 — **intent encoded, not capability verified** |
| 4 | Clean code | `clean-code`, `code-refactoring-refactor-clean` | Domain logic concentrated; no pass-through seams added |
| 5 | Technical validation | `lint-and-validate`, `systematic-debugging`, `error-handling-patterns` | Linter and typecheck exit 0; failure paths have declared behaviour |
| 6 | UX visual validation | `ui-visual-validator`, `ui-ux-pro-max`, `frontend-design`, `web-design-guidelines` | Rendered and inspected at real viewport sizes; defects fixed, not noted |
| 7 | Production review | `production-code-audit`, `code-reviewer`, `kaizen` | Audit run; every finding either fixed or explicitly accepted with a reason |
| 8 | Final verification | `verification-before-completion` | The build/test command run **in the reporting message**, against something you did not author |

## Stage notes that carry weight

**Stage 2 — the deletion test.** Ousterhout's principle is deep modules: substantial
capability behind a narrow interface. The operational check — imagine deleting the
module; if complexity vanishes it was a pass-through, if it reappears across callers it
earned its keep — is a practitioner operationalisation of that principle, not Ousterhout's
own term. Use it; attribute it correctly.

**Stage 3 — what green means.** You wrote the code and you wrote the tests. That is a
declaration of intent, not a result. Say so unprompted rather than reporting a pass count
as settled. Coding agents are documented to overwrite tests, delete assertions, and
hardcode expected outputs to obtain a passing score — so a suite you authored is not an
independent oracle for the code you authored. Capability is claimed at Stage 8, not here.

**Stage 6 — when it cannot run.** This gate needs a rendered surface and, for a design
alignment check, a human. In a non-interactive session (CI, subagent, headless) do not
silently skip it and do not block: proceed under a stated written assumption, and flag it
for review in the final summary. Never assume aesthetics — retrieve a visual reference
and align on it before writing UI code where a human is available to confirm.

**Stages 5, 7, 8 — do not stack self-reviews.** Three passes of the same model reading
its own work is one opinion repeated, not three confirmations. Peer-reviewed results show
LLM self-verification is unreliable enough to be counterproductive. Each of these stages
must end in an external verdict; if it cannot, report it as a review and say what remains
unverified.

## Output

Report which stages ran, which were skipped and why, the verdict command for each gate,
and what remains unverified. Never deliver a broken UI. Never report completion without
having run the verifying command in the same message.

## Limitations

- For a one-line fix or a pure question, this pipeline is overhead. Use it for work that
  ships something.
- It does not substitute for environment-specific validation or expert review.
- Stop and ask if required inputs, permissions, safety boundaries, or success criteria
  are missing.
