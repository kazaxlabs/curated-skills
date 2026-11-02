---
type: llm
---

The reply should route the user to a starting point, not plan or build the project itself.

PASS if all of these hold:
- It names one primary recommended skill, command or workflow by name, and at most two secondary ones. A recommendation flagged as not installed still counts.
- It gives a ready-to-copy invocation line for the primary recommendation, such as `@name ...` or `/name ...`, filled in with the user's own goal (event bookings with a Stripe deposit on a Next.js site).
- It offers to write a ready-to-use prompt the user can paste, or includes one.
- It does not ask the user again for facts the request already gave: the kind of business, the stack (Next.js, Stripe), that the idea is rough, and that they want to review step by step.

FAIL if any of these hold:
- It answers with a general project plan or step-by-step build advice and names no skill, command or workflow to invoke.
- It recommends more than three skills, commands or workflows.
- It opens with an interview of several questions instead of a recommendation.
- It starts designing or writing the booking feature.

Rubric history: v1 (2026-10-31).
