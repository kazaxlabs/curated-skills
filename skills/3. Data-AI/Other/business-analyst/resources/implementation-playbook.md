<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Business Analyst Implementation Playbook

Templates for the response approach in `SKILL.md` (define objectives, assess data, design the analysis, execute,
visualise, recommend, present, monitor). Brackets are placeholders. No benchmark or rate in this file is a reference
value; use the business's own data or a source opened and cited at the time.

## 1. Analysis brief

```markdown
# Analysis brief — [topic]
- Business question: [one question, answerable with data]
- Decision it informs: [ ] — decided by: [ ] — by: [date]
- Success criterion: [what result would change the decision]
- Scope: [period, products or services, customer segments, territory]
- Out of scope: [ ]
- Data sources: [system or file — owner — period available — known gaps]
- Constraints: [time, privacy (no customer identity in outputs), tools]
```

## 2. Data readiness checklist

- [ ] Each source is identified, with its period and record count (N).
- [ ] Definitions agree across sources (e.g. what counts as a "lead", a "sale", a "job").
- [ ] Duplicates, missing values and outliers are counted and their handling written down.
- [ ] Personal data is removed or replaced by dossier numbers before analysis outputs are shared.
- [ ] The extract can be reproduced (query, export settings or file path recorded).

## 3. Method chooser

| Question type | Method | Output |
| --- | --- | --- |
| How much / how many, and the trend | descriptive statistics by period | table + line chart |
| Which segment differs | comparison by segment, with N per segment | sorted bar chart |
| Where people drop off | funnel by stage, stage-to-stage rates | funnel table |
| Did a change work | before/after with a comparable control, or an A/B test | effect with uncertainty |
| Is it profitable | unit economics per job, product or customer | margin table |
| What if | scenario model with named assumptions | three scenarios |

## 4. Funnel template

| Stage | Count (period [ ]) | Rate from previous stage | Note |
| --- | --- | --- | --- |
| [Visits or contacts] | [ ] | — | |
| [Requests] | [ ] | [ ] | |
| [Quotes sent] | [ ] | [ ] | |
| [Quotes accepted] | [ ] | [ ] | |
| [Jobs completed] | [ ] | [ ] | |

## 5. Unit economics template (per job or per customer)

```
Revenue per unit            = [ ]
Direct costs per unit       = materials [ ] + labour [ ] + subcontracting [ ] + other [ ]
Gross margin per unit       = revenue − direct costs
Acquisition cost per unit   = marketing and sales spend over period / units won over the same period
Contribution per unit       = gross margin − acquisition cost
```

State the period and N for every average.

## 6. Findings and recommendations

```markdown
## Finding [n]: [one-sentence statement]
- Evidence: [table or chart reference], N = [ ], period [ ]
- Label: measured | assumed
- Implication: [what it means for the decision]

## Recommendation [n]: [action]
- Expected effect: [range, or "unknown"] — basis: [ ]
- Cost and effort: [ ] — owner: [ ] — by: [ ]
- How we will know: [indicator and review date]
```

## 7. Monitoring plan

| Indicator | Baseline (period) | Review date | Threshold for action | Owner |
| --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] |

## 8. Quality checklist before presenting

- [ ] The answer addresses the business question in the brief.
- [ ] Every number has a source, a period and N.
- [ ] Correlation is not presented as cause without a design that supports it.
- [ ] Limits of the data are stated next to the findings they affect.
- [ ] No customer identity appears in any output.
- [ ] An independent reviewer has read it before it goes out.
