<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Financial Model Templates by Business Model

Driver structures for the business models in `SKILL.md`. Each template lists the drivers (inputs), the formulas, and
the outputs. Brackets are placeholders; fill them from the assumption register.

## Services (projects or jobs)

Drivers: requests per month [ ], quote rate [ ], acceptance rate [ ], average job value [ ], capacity in jobs per
month [ ], direct cost per job (materials [ ], labour hours [ ] × hourly cost [ ], subcontracting [ ]).

```
Quotes            = Requests × Quote rate
Jobs won          = Quotes × Acceptance rate
Jobs delivered    = MIN(Jobs won + backlog, Capacity)
Backlog (next)    = Backlog + Jobs won − Jobs delivered
Revenue           = Jobs delivered × Average job value
Direct costs      = Jobs delivered × Direct cost per job
Gross margin      = Revenue − Direct costs
```

Watch: capacity, seasonality (a monthly factor per month), deposits and progress billing (cash timing).

## Recurring revenue (subscriptions, maintenance contracts)

Drivers: new contracts per month [ ], monthly price [ ], monthly cancellation rate [ ], price changes [ ].

```
Active (m)        = Active (m−1) × (1 − Cancellation rate) + New (m)
Recurring revenue = Active (m) × Monthly price
Annualised        = Recurring revenue × 12
```

Watch: cohorts (contracts signed the same month) behave differently; model them by cohort when history allows.

## Marketplace or commission

Drivers: transactions per month [ ], average transaction value [ ], commission rate [ ], payment processing cost [ ].

```
Gross transaction value = Transactions × Average value
Net revenue             = Gross transaction value × Commission rate
Contribution            = Net revenue − Processing costs − Variable support costs
```

## Product sales (retail or e-commerce)

Drivers: visitors or footfall [ ], conversion rate [ ], average order value [ ], purchase frequency [ ], product
cost [ ], shipping and fees [ ], returns rate [ ].

```
Orders        = Visitors × Conversion rate
Revenue       = Orders × Average order value × (1 − Returns rate)
Product costs = Orders × Average product cost
Gross margin  = Revenue − Product costs − Shipping and fees
```

Watch: inventory ties up cash before sales happen; model purchases separately from sales.

## Common cost block (all models)

| Line | Fixed or variable | Driver | Monthly formula |
| --- | --- | --- | --- |
| Rent and utilities | fixed | — | [ ] |
| Vehicles and equipment | fixed or per job | [ ] | [ ] |
| Insurance and licences | fixed | — | [ ] |
| Software | fixed | users [ ] | [ ] |
| Marketing | variable | requests targeted [ ] | [ ] |
| Professional fees | fixed | — | [ ] |
| People | fixed per role | start month | fully loaded cost × headcount |

## Output summary (per month, then per year)

Revenue, direct costs, gross margin, operating costs, operating result, cash in, cash out, closing cash.
