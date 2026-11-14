<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Example Structure: Three-Year Subscription Model with Cohorts

A worked structure, not a worked case: every value is a placeholder to fill from the business's data. No figure here
is a benchmark.

## Assumptions (tab `Assumptions`)

| Name | Value | Unit | Basis |
| --- | --- | --- | --- |
| New subscribers, month 1 | [N0] | count | [ ] |
| Monthly growth in new subscribers | [g] | % | [ ] |
| Monthly price, plan A | [pA] | $ | price list |
| Share of new subscribers on plan A | [sA] | % | [ ] |
| Monthly price, plan B | [pB] | $ | price list |
| Retention after month k (curve) | [R1 … R36] | % | own cohort history or stated assumption |
| Direct cost per subscriber per month | [c] | $ | [ ] |
| Acquisition spend per month | [S] | $ | budget |

## Cohort table (tab `Revenue`)

Rows are signup months, columns are calendar months. Each cell:

```
Active(cohort i, month j) = New(i) × R(j − i)      for j ≥ i
Revenue(month j)          = Σ_i Active(i, j) × blended price
blended price             = sA × pA + (1 − sA) × pB
```

| Cohort \ Month | 1 | 2 | 3 | … | 36 |
| --- | --- | --- | --- | --- | --- |
| 1 | New(1) | New(1)×R1 | New(1)×R2 | … | … |
| 2 | | New(2) | New(2)×R1 | … | … |
| … | | | | | |

## Monthly outputs

```
Recurring revenue (j)   = Σ active × price
Gross margin (j)        = revenue − active × c
New recurring revenue   = revenue(j) − revenue(j−1) + revenue lost to cancellations (j)
CAC (j)                 = S(j) / New(j)
Payback (months)        = CAC / (blended price − c)
```

## Annual summary

| Year | Revenue | Gross margin | Operating costs | Operating result | Closing cash | Subscribers at year end |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Checks

- [ ] Retention curve basis stated (history with N, or an explicit assumption).
- [ ] Revenue counted when earned, cash when collected (annual prepayments shift cash, not revenue).
- [ ] Sales taxes excluded from revenue.
