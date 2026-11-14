<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Market Sizing Analysis Implementation Playbook

How to run the six steps in `SKILL.md` and document them so each number can be checked. Brackets are placeholders.
The capture rates and thresholds quoted in `SKILL.md` (for example "2–5 %" or "TAM under $1B") are unsourced
illustrations and investor-oriented; for a local business, derive the obtainable share from capacity and competition
instead.

## 1. Market definition card

```markdown
- Problem solved: [ ]
- Customer: [type of household or business; size; situation that triggers the need]
- Offer: [service or product category, as customers would name it]
- Territory: [towns, regions or radius actually served]
- Time frame: [annual market; horizon of [N] years]
- Exclusions: [customer types or jobs not served]
```

## 2. Source log (every number used)

| Figure | Value | Source (URL or document) | Opened on | Publisher type | Year of the data | Used in |
| --- | --- | --- | --- | --- | --- | --- |
| [number of households in territory] | [ ] | [ ] | [ ] | statistics agency / association / vendor | [ ] | TAM |

A figure without an opened source is listed as an assumption with its reasoning, never as data.

## 3. Calculation sheet

```
Bottom-up
  Potential customers in territory     = [count]                        (source row [n])
  Share with the need in a year        = [%]                            (source or assumption)
  Annual customers in market           = count × share
  Average annual spend per customer    = [ ]                            (own price list or source)
  TAM (territory)                      = annual customers × average spend
  SAM                                  = TAM × share you can serve (segments, distance, job types)
  SOM                                  = MIN(capacity-based ceiling, share-based estimate)
     capacity-based ceiling            = jobs you can deliver per year × average job value
     share-based estimate              = SAM × [share], basis: [competitors counted, own win rate]

Top-down (check)
  Category total from a report         = [ ] (source, geography, year)
  × share for the territory            = [ ] (basis)
  × share for the segment              = [ ] (basis)
```

## 4. Triangulation

| Method | TAM | SAM | SOM | Main uncertainty |
| --- | --- | --- | --- | --- |
| Bottom-up | [ ] | [ ] | [ ] | [ ] |
| Top-down | [ ] | [ ] | [ ] | [ ] |
| Value-based | [ ] | [ ] | [ ] | [ ] |

When methods disagree widely, report the range and explain the main driver of the gap; do not average it away.

## 5. Presentation checklist

- [ ] Definition card shown first.
- [ ] Each figure traceable to the source log.
- [ ] SOM tied to capacity and competition, not to a generic percentage.
- [ ] Assumptions listed with what would change them.
- [ ] Range given where uncertainty is large.
