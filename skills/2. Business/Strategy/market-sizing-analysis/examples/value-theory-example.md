<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Example Structure: Value-Based Market Sizing

For a new kind of offer where no market report exists. A structure to fill: every value is a placeholder, and the
pricing share must come from the business's own evidence (interviews, accepted quotes, tests), not from a rule of
thumb.

## 1. The problem's cost to one customer

| Cost item | How measured | Value per year | N cases | Label |
| --- | --- | --- | --- | --- |
| Money lost or spent | [invoices, bills] | [ ] | [ ] | measured / assumed |
| Time spent | [hours × value of an hour] | [ ] | [ ] | [ ] |
| Risk avoided | [probability × cost, with basis] | [ ] | [ ] | [ ] |
| Total cost of the problem | | Σ | | |

## 2. Value of the solution

```
Value per customer per year = total cost × share of the cost the solution removes [ ] (basis: [ ])
```

## 3. Price customers would pay

| Evidence | N | Result |
| --- | --- | --- |
| Interviews (price acceptability questions) | [ ] | [range] |
| Quotes accepted / sent at price [p] | [ ] | [rate] |
| Test offer at [p1] vs [p2] | [ ] | [result] |

Chosen price for sizing: [p] — basis: [row above].

## 4. Customers

```
Customers with the problem in [territory]  = [ ]  (source)
Customers who meet buying criteria         = [ ]  (budget, decision power, timing — basis)
```

## 5. Sizing

```
TAM = customers with the problem × p
SAM = customers who meet buying criteria × p
SOM = MIN(SAM × adoption share [basis], capacity × p)
```

## 6. Caveats to state with the result

- The value estimate rests on [N] cases; state the range across cases.
- Adoption share is [measured in a pilot / assumed]; say which.
- New categories take time to adopt; give a time frame and what would confirm it.
