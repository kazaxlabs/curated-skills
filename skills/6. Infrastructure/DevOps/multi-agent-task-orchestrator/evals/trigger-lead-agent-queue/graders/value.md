---
type: llm
---

The user asked for a lead (orchestrator) agent design for four coding agents and a walk-through of a queue. One new request (the login page bounce-back bug) duplicates in-progress task #41.

PASS if all of these hold:
- The lead agent's role is defined with an explicit list of what it must NOT do itself (for example: it does not write code, run tests or do research; it only decomposes, delegates and verifies).
- New work is checked against pending and in-progress tasks before it is assigned (a task registry, similarity or duplicate check), and in the walk-through the login bounce-back request is identified as a duplicate of #41 and is not handed to a second agent.
- Delegations in the walk-through state a scope (which files or area the agent may touch) and a verification command or check the work must pass.
- A task is marked done only on evidence, and the completion check includes at least: files were actually changed (for example a non-empty diff), tests pass, and a check that no secrets or credentials were introduced.

FAIL if any of these hold:
- The lead agent is allowed to do specialist work itself, or no NOT-list is given.
- The login bounce-back request is assigned as a new task to any agent.
- Delegations carry no scope or no verification command.
- "Done" rests on the agent's own report or a prose review, or the completion check omits the diff check, the tests or the secrets check.

Rubric history: v1 (2026-10-31).
