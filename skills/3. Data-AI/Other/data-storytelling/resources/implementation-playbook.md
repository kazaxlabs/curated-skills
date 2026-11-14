<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Data Storytelling Implementation Playbook

Worksheets and checklists for the patterns in `SKILL.md`. Every bracket is a placeholder for the reader's own data;
no figure here is a benchmark. The figures in `SKILL.md`'s examples are illustrations, not reference values.

## 1. Brief (fill before any chart)

| Question | Answer |
| --- | --- |
| Audience (who reads it, what they already know) | [ ] |
| Decision the story must support | [ ] |
| The one sentence you want them to remember | [ ] |
| Data available (source, period, N) | [ ] |
| Data missing, and how its absence limits the claim | [ ] |
| Format (one page, slides, e-mail, meeting) | [ ] |

## 2. Story structure worksheet

```
Headline (the "so what", one sentence):   [ ]
Context (baseline, period, comparison):   [metric] was [value] over [period] (source: [file or system])
Conflict (gap, change, or surprise):      [what moved, by how much, against what]
Insight (why it moved, with evidence):    [cause] — evidence: [analysis, segment, N] — label: measured | assumed
Resolution (recommendation):              [action], expected effect [range or "unknown"], basis: [ ]
Ask (decision needed, by whom, by when):  [ ]
```

Rules: every number names its source, its period and N; every cause is labelled measured or assumed; an expected
effect without a basis is written "unknown", not estimated.

## 3. Chart choice

| Message | Chart | Avoid |
| --- | --- | --- |
| Change over time | line | 3D, dual axes without labels |
| Comparison across categories | horizontal bar, sorted | pie with many slices |
| Part of a whole (few parts) | stacked bar or a single pie | donut with more than five slices |
| Relationship between two measures | scatter | implying cause from correlation alone |
| Before and after | two bars, or a slope chart | different scales side by side |

One message per chart; the title states the message, not the variable ("[Metric] rose after [event]", not
"[Metric] by month").

## 4. One-page monthly review template

```markdown
# [Business] — monthly review — [month year]

## Headline
[One sentence]

## Key figures (source: [system], period: [dates])
| Indicator | This period | Previous period | Target | Note |
| --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] |

## What is working
- [ ] (evidence: [ ])

## What needs attention
- [ ] (evidence: [ ])

## Recommendation
1. [Action] — owner: [ ] — by: [ ]

## Next month
- [ ]
```

## 5. Review checklist before sending

- [ ] The headline answers "so what" for this audience.
- [ ] Each figure has a source, a period and N; comparisons use like periods.
- [ ] Causes are labelled measured or assumed; no causal claim rests on a single correlation.
- [ ] No invented benchmark ("industry average") without an opened source.
- [ ] Uncertainty is stated as a range or "unknown", never as an invented confidence level.
- [ ] The ask is specific: decision, owner, date.
- [ ] Someone other than the author has reviewed it before it goes out.
