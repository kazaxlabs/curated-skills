---
type: llm
---

The reply should run a structured, role-based design review that ends in a decision, not give a single list of concerns.

PASS if all of these hold:
- The review is split into separate, labelled reviewer roles taken one after another, including at least: one that assumes the design fails and hunts for failure modes or hidden assumptions, one that checks non-functional constraints (such as security, reliability, scale or cost), and one that speaks for the end user.
- An explicit arbitration or integration step goes through the objections and states, for each one, whether it is accepted or rejected, with a reason.
- It ends with one explicit overall disposition: APPROVED, REVISE or REJECT, or a plainly equivalent verdict.
- It includes a decision log, as a list or table, recording objections or decisions together with how each was resolved.

FAIL if any of these hold:
- The concerns are given as one undifferentiated list with no reviewer roles.
- Objections are not individually accepted or rejected, or there is no overall disposition.
- It writes implementation code.

Rubric history: v1 (2026-10-31).
