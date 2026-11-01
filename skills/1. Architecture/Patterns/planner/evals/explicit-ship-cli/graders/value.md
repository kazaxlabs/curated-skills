---
type: llm
---

The reply should lay out a gated delivery pipeline for the tool, not just a task list or the code.

PASS if all of these hold:
- The work is split into named stages, and each stage states what decides that it passed: a concrete command or machine result (for example a test command exiting 0, a linter or typecheck exit code, a diff), or the stage is explicitly labelled a review because no such command exists.
- It names at least one stage it skips and says why (for example a visual or UI check, because the tool has no interface).
- It says that tests it writes for its own code do not by themselves prove the tool works, and that final verification has to run against something it did not author (such as a real timesheet file, an external command, or a person).
- It states what remains unverified, for example because nothing could be run in this session.

FAIL if any of these hold:
- Its steps have no stated pass condition.
- It presents its own passing tests as proof that the tool is correct.
- It claims the tool is built, tested or ready to ship.

Rubric history: v1 (2026-10-31).
