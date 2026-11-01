---
type: llm
---

The reply should give a structured product-management answer: a named prioritization framework applied item by item, SaaS metrics computed with formulas, and a metric that defines success.

PASS if all of these hold:
- It ranks the five candidates with a named prioritization framework (for example RICE, ICE, weighted scoring, Kano or MoSCoW) and shows each candidate's score or category, not only a prose ranking.
- It computes at least two SaaS metrics from last quarter's numbers with the formula written out (for example net new MRR, net or gross revenue retention, MRR churn rate, or SaaS quick ratio) and uses them in the argument for the recommendation.
- It names the metric the recommended work is meant to move (for example a North Star metric, net revenue retention or churn rate) and says how the CEO will see whether it worked.

FAIL if any of these hold:
- The ranking is given in prose with no framework scores or categories per candidate.
- Metrics are named without a formula, or are not computed from the numbers given.
- No target metric or success check is stated.

Rubric history: v1 (2026-10-31).
