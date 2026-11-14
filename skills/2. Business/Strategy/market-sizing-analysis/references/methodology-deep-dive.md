<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Methodology Deep Dive: Worksheets for the Three Methods

Step-by-step worksheets for the methods in `SKILL.md`. Brackets are placeholders. Percentages in `SKILL.md` such as
"willingness to pay typically 10–30 % of value" or "2–5 % capture" are unsourced; replace them with values you can
source or with explicit, labelled assumptions.

## Method 1: Top-down

| Step | Input | Value | Source / basis |
| --- | --- | --- | --- |
| 1 | Total category size (geography, year) | [ ] | [report, opened on] |
| 2 | Share for the target geography | [ ] | [population or business counts ratio, source] |
| 3 | Share for the target segment | [ ] | [ ] |
| 4 | Growth adjustment to the current year | [ ] | [published growth rate, source] |
| = | SAM estimate | step1 × step2 × step3 × step4 | |

Checks: same currency and year throughout; the category in the report matches the offer (not a broader one).

## Method 2: Bottom-up

| Segment | Count of potential customers | Source | Share with need per year | Average annual spend | Segment market |
| --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] | count × share × spend |
| Total | | | | | Σ |

Then:

```
SAM = Σ segment markets for segments and areas actually served
SOM = MIN(capacity ceiling, SAM × achievable share)
achievable share basis: number of active competitors [n] and own win rate on quotes [r] over [period, N]
```

## Method 3: Value-based

| Step | Question | Value | Basis |
| --- | --- | --- | --- |
| 1 | What does the problem cost the customer per year (money, time, risk)? | [ ] | [measured cases, N] |
| 2 | What share of that cost does the offer remove? | [ ] | [measured or assumed] |
| 3 | Value created per customer | step1 × step2 | |
| 4 | Price the customer would pay | [ ] | [pricing research: interviews N, accepted quotes] |
| 5 | Customers who meet the buying criteria | [ ] | [ ] |
| = | Market (value-based) | step4 × step5 | |

## Sanity checks for all methods

- [ ] Units, currency and year consistent.
- [ ] No double counting between segments.
- [ ] SOM below delivery capacity.
- [ ] Each percentage has a basis written next to it.
