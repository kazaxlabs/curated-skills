<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Financing Scenarios

How to model the financing options a business may use, and their effect on cash and ownership. Brackets are
placeholders. Interest rates, terms, valuations and program amounts come from the lender's or program's own documents,
opened at the time; none are given here. Financing decisions and documents are the owner's, with his accountant,
lender or lawyer.

## Debt (term loan)

Inputs: principal [ ], annual rate [ ], term in months [ ], start month [ ], fees [ ].

```
Monthly rate   r = annual rate / 12
Payment        P = principal × r / (1 − (1 + r)^(−term))
Interest (m)   = balance (m−1) × r
Principal (m)  = P − interest (m)
Balance (m)    = balance (m−1) − principal (m)
```

Cash tab: + principal received in the start month; − P every month; fees when paid.

## Line of credit

Inputs: limit [ ], rate [ ], rule for drawing (draw when cash would fall below [minimum]) and repaying.

```
Draw (m)    = MAX(0, minimum cash − cash before draw (m)), capped at available limit
Repay (m)   = MAX(0, MIN(balance, cash before repay (m) − minimum cash))
Interest (m)= balance × rate / 12
```

## Equity

Inputs: amount raised [ ], pre-money valuation [ ], date [ ].

```
Post-money  = pre-money + amount raised
Dilution    = amount raised / post-money
Ownership after = ownership before × (1 − dilution)
```

## Grants and subsidies

Model only programs whose current rules were opened and read: amount [ ], conditions [ ], timing of payment [ ]
(often after the expense). Never count a grant as certain before it is approved in writing.

## Use of funds

| Use | Amount | Month | Milestone it serves |
| --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] |

## Comparing options

| Option | Cash received | Cost over [N] months | Ownership effect | Conditions | Lowest cash point |
| --- | --- | --- | --- | --- | --- |
| No financing | — | — | — | — | [ ] |
| Loan | [ ] | interest + fees [ ] | none | [covenants] | [ ] |
| Line of credit | [ ] | [ ] | none | [ ] | [ ] |
| Equity | [ ] | — | [dilution] | [ ] | [ ] |

Size any financing to reach the next milestone with a buffer the owner chooses, and show the lowest cash point in
each scenario.
