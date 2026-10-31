---
type: llm
---

The reply should open a structured design conversation, not deliver a design.

PASS if all of these hold:
- It asks the user one question about the idea, for example its purpose, who it is for, a constraint, or what success looks like. A short heading plus that one question counts as one.
- It offers concrete answer options for that question for the user to pick from (multiple choice).
- It does not yet propose a design: no architecture, data model, screens, feature list or code.

FAIL if any of these hold:
- It asks several separate questions on different topics in one reply.
- It proposes a design, solution approach, feature list or implementation before the user has answered anything.
- It asks no question at all.

Rubric history: v1 (2026-10-31).
