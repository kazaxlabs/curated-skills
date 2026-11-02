---
type: llm
---

The reply should challenge the plan against the stated glossary and decision record, one decision at a time.

PASS if all of these hold:
- It explicitly points out that the plan uses a term or rule in a way that conflicts with the glossary or the recorded decision (for example a "pending" Booking created before the Quote is accepted, when Booking is defined as confirmed; a crew date held before the deposit is paid; or "client" or "account" used where the glossary says Customer), and asks the user which meaning or rule is intended.
- It puts one decision to the user in this reply. It may briefly name other issues it will come back to, but it asks for an answer on only one of them. A heading that states the question plus one closing question on the same topic still counts as one.
- It gives its own recommended answer to that question (for example a canonical term, or which rule should win).

FAIL if any of these hold:
- It asks the user several separate questions, or gives recommendations for several separate issues, in this one reply.
- It gives no recommended answer.
- It never refers to the glossary or the decision record, and critiques the plan only on general engineering grounds.
- It rewrites the whole plan or starts implementing it.

Rubric history: v1 (2026-10-31).
