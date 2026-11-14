<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Example Structure: Marketplace Projection (Transaction Value and Take Rate)

A structure to fill, not a case: every value is a placeholder. No take rate, growth rate or margin here is a
benchmark.

## Assumptions

| Name | Value | Unit | Basis |
| --- | --- | --- | --- |
| Active buyers, month 1 | [B0] | count | [ ] |
| New buyers per month | [b] | count | [ ] |
| Buyer monthly retention | [rb] | % | [ ] |
| Transactions per active buyer per month | [f] | count | [ ] |
| Average transaction value | [v] | $ | [ ] |
| Take rate (commission) | [t] | % | pricing decision |
| Payment processing cost | [p] | % of transaction value | provider's price page, opened [date] |
| Active sellers needed per [N] transactions | [k] | count | [ ] |
| Cost to acquire a buyer / a seller | [CACb] / [CACs] | $ | [ ] |

## Monthly formulas

```
Active buyers (m)            = Active buyers (m−1) × rb + b
Transactions (m)             = Active buyers (m) × f
Gross transaction value (m)  = Transactions (m) × v
Net revenue (m)              = Gross transaction value (m) × t
Processing cost (m)          = Gross transaction value (m) × p
Contribution (m)             = Net revenue (m) − Processing cost (m) − variable support (m)
Sellers needed (m)           = Transactions (m) / N × k
Acquisition spend (m)        = b × CACb + new sellers (m) × CACs
```

## Annual summary

| Year | Gross transaction value | Net revenue | Contribution | Acquisition spend | Closing cash |
| --- | --- | --- | --- | --- | --- |
| 1 | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2 | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3 | [ ] | [ ] | [ ] | [ ] | [ ] |

## Checks

- [ ] Revenue is net revenue (the commission), not gross transaction value.
- [ ] Both sides of the market are modelled; supply limits are visible.
- [ ] Money held for sellers is not counted as the business's cash available for operations.
