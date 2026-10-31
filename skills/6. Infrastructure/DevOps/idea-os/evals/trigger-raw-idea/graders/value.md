---
type: llm
---

The reply should start an idea-to-plan pipeline in order: classify the idea, ask grouped clarifying questions, then stop for answers before any research, requirements or plan.

PASS if all of these hold:
- It states a short classification of the idea on two axes: how complex the idea is (for example a tier such as T1/T2/T3, or weekend utility versus SaaS MVP versus marketplace or regulated product) and how experienced the builder is (for example S1/S2/S3, or non-technical versus hobbyist versus founder).
- It asks clarifying questions grouped under themes that cover who has the pain, the scope or first wedge of the product, and the constraints or goals (for example headings like "Who and Pain", "Scope and Wedge", "Constraints and Goals"; exact wording may differ).
- It ends by waiting for the user's answers: it does not deliver market research findings, a requirements document (PRD) or a build plan in this reply.

FAIL if any of these hold:
- It gives no classification of both the idea's complexity and the builder's experience.
- Its questions are a single ungrouped list, or it asks no questions.
- It delivers research findings, a PRD, a feature list presented as requirements, or a phased build plan in this reply.

Rubric history: v1 (2026-10-31).
