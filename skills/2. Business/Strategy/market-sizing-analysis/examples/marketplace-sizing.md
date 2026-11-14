<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Example Structure: Marketplace Market Sizing

A structure to fill, not a worked case: every value is a placeholder. Fill each from the source log in
`resources/implementation-playbook.md`.

## 1. Definition

- Platform: connects [buyers] with [sellers] for [category] in [territory].
- Revenue: commission of [t] on each transaction.

## 2. Bottom-up: demand side

| Input | Value | Source / basis |
| --- | --- | --- |
| Potential buyers in territory | [B] | [ ] |
| Share who buy the category in a year | [s] | [ ] |
| Transactions per buyer per year | [f] | [ ] |
| Average transaction value | [v] | [ ] |
| Category transaction value (TAM, gross) | B × s × f × v | |
| TAM (net revenue at take rate t) | gross × t | |

## 3. Supply-side check

| Input | Value | Source / basis |
| --- | --- | --- |
| Sellers active in territory | [S] | [ ] |
| Transactions a seller can handle per year | [c] | [ ] |
| Supply ceiling (gross) | S × c × v | |

The serviceable market cannot exceed what sellers can deliver.

## 4. SAM and SOM

```
SAM = TAM restricted to [segments and areas served at launch]
SOM = MIN(SAM × achievable share, supply recruited × capacity × v × t)
achievable share basis: [competing platforms counted, their visible activity, own pilot results with N]
```

## 5. Top-down check

Category total from [report, geography, year] × territory share [ ] × online share [ ] = [ ]. Compare with the
bottom-up gross value; explain any wide gap.

## 6. Result

| Level | Gross transaction value | Net revenue | Basis summary |
| --- | --- | --- | --- |
| TAM | [ ] | [ ] | [ ] |
| SAM | [ ] | [ ] | [ ] |
| SOM ([N] years) | [ ] | [ ] | [ ] |
