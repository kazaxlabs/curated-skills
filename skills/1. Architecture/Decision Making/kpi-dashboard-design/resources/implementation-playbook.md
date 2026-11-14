<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# KPI Dashboard Design Implementation Playbook

Worksheets for the patterns in `SKILL.md`. Brackets are placeholders; no target or threshold here is a benchmark.
Set targets from the business's own history or from a source opened and cited at the time.

## 1. KPI selection worksheet

Start from the decision, not from the data that happens to exist.

| Decision the owner makes | Question it needs answered | Indicator | Formula | Source system | Frequency | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| [e.g. how much to spend on ads] | [ ] | [ ] | [ ] | [ ] | [weekly/monthly] | [ ] |

Keep five to seven indicators on the main view. For each one, confirm:
- [ ] it changes a decision (otherwise it is a vanity metric);
- [ ] it has a clear formula and one source of truth;
- [ ] it can be compared with something (previous period, target, same period last year);
- [ ] someone is responsible for acting on it.

## 2. KPI definition card (one per indicator)

```markdown
### [Indicator name]
- Definition: [what it measures, in one sentence]
- Formula: [numerator] / [denominator], over [period]
- Source: [system, report or file]; extracted by [person or tool]
- Frequency: [ ]
- Target: [value] — basis: [own history over period X | cited source | owner's decision of date Y]
- Alert threshold: [value or rule] — action when crossed: [ ]
- Caveats: [what can distort it]
```

## 3. Layout template (one page)

```
┌────────────────────────────────────────────────────────────┐
│ Period: [dates]      Data as of: [date]      Source: [ ]   │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ KPI 1        │ KPI 2        │ KPI 3        │ KPI 4         │
│ value        │ value        │ value        │ value         │
│ vs prev: [ ] │ vs prev: [ ] │ vs prev: [ ] │ vs prev: [ ]  │
├──────────────┴──────────────┴──────────────┴───────────────┤
│ Trend of the most important KPI over [N] periods (line)    │
├────────────────────────────────────────────────────────────┤
│ Breakdown that explains it (sorted bar by [dimension])     │
├────────────────────────────────────────────────────────────┤
│ Alerts and actions: [indicator] crossed [threshold] → [ ]  │
└────────────────────────────────────────────────────────────┘
```

## 4. Indicator families for a small service business (choose, do not copy all)

| Area | Candidate indicators (define each with the card above) |
| --- | --- |
| Demand | requests received, by channel; cost per request by channel |
| Sales | quotes sent; quotes accepted; acceptance rate; time from request to quote |
| Delivery | jobs completed; rework or callbacks; time from acceptance to completion |
| Money | revenue invoiced; gross margin per job; receivables over [N] days; cash on hand |
| Customers | reviews received; complaints; repeat or referred customers |

## 5. Building it without code

A spreadsheet is enough to start: one tab of raw data per source, one tab of calculations using the formulas from the
definition cards, one tab for the one-page view. Move to a BI tool only when the spreadsheet becomes the bottleneck.

## 6. Review checklist

- [ ] Every indicator has a definition card.
- [ ] Every target states its basis; none is an unsourced "industry standard".
- [ ] Period, data date and source are visible on the page.
- [ ] Colours carry meaning consistently, and meaning is not carried by colour alone.
- [ ] Each alert names the action and who takes it.
