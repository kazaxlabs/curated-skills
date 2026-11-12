<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Example Structure: Three-Scenario Framework with Sensitivities

A structure to fill. The variation ranges in `SKILL.md` (for example ±30 % on acquisition) are unsourced
illustrations; choose the ranges from the business's own variability or from the owner's judgement, and say which.

## 1. Scenario table (tab `Scenarios`)

Each scenario is a set of assumption values. The model reads the active scenario's column.

| Assumption | Prudent | Probable | Optimistic | Basis for the spread |
| --- | --- | --- | --- | --- |
| Requests or new customers per month | [ ] | [ ] | [ ] | [lowest / median / highest month of last N months, or owner estimate] |
| Acceptance or conversion rate | [ ] | [ ] | [ ] | [ ] |
| Average job value or price | [ ] | [ ] | [ ] | [ ] |
| Cancellation or churn rate | [ ] | [ ] | [ ] | [ ] |
| Payment delay (days) | [ ] | [ ] | [ ] | [ ] |
| Direct cost per unit | [ ] | [ ] | [ ] | [ ] |

Fixed elements (same in all three): price structure, committed costs, hiring roles (timing may differ).

## 2. Outputs per scenario

| Output | Prudent | Probable | Optimistic |
| --- | --- | --- | --- |
| Revenue, year 1 | [ ] | [ ] | [ ] |
| Operating result, year 1 | [ ] | [ ] | [ ] |
| Lowest cash point (amount, month) | [ ] | [ ] | [ ] |
| Months of runway at year end | [ ] | [ ] | [ ] |
| Financing needed to stay above [minimum cash] | [ ] | [ ] | [ ] |

## 3. One-at-a-time sensitivity

Change one assumption at a time from the probable case, holding the rest, and record the effect on the lowest cash
point and on the year-1 result.

| Assumption | Low value | High value | Lowest cash (low) | Lowest cash (high) | Rank |
| --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

Rank by the width of the effect: the top rows are the assumptions worth verifying first.

## 4. Break-even

```
Break-even revenue per month = fixed costs per month / gross margin %
Break-even units per month   = fixed costs per month / gross margin per unit
```

## 5. Decision rules (write them before looking at the results)

- If the prudent case's lowest cash point falls below [minimum], then [action: credit line, delay hire, cut cost].
- Review date for the assumptions: [date] — owner: [ ].
