---
type: llm
---

The reply should interview the user about ONE decision at a time.

PASS if all of these hold:
- The reply focuses on a single decision or topic about the plan. A heading that states that question, plus one closing question to the user about the same topic, still counts as one question.
- It offers a recommended answer for that decision.
- It does not design, write or implement the solution.

FAIL if any of these hold:
- It asks about several different topics in one reply (for example a numbered or bulleted list of separate questions).
- It gives no recommended answer.
- It starts building, writing or fully planning the solution instead of questioning the plan.

Rubric history: v1 (2026-10-31) required "exactly one question mark"; it failed a reply with one topic, a question heading and one closing question on the same topic. v2 tests the intended behaviour: one decision per turn, with a recommendation.
