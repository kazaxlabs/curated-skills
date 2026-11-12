<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Industry Templates

Formula templates by market type, following the "Industry-Specific Considerations" section of `SKILL.md`. Brackets are
placeholders; each input needs a source or a labelled assumption.

## Local services (residential)

```
Households in territory        = [ ]  (statistics agency, by town)
Share of eligible households   = [ ]  (housing type, age, ownership — source)
Annual need rate               = [ ]  (share needing the service in a year — source or own history)
Average job value              = [ ]  (own price list or accepted quotes)
Market (territory, per year)   = households × eligible share × need rate × average job value
```

## Local services (commercial)

```
Businesses in territory by type and size = [ ]  (business registry or statistics agency)
Share that buys this service            = [ ]
Purchase frequency per year             = [ ]
Average contract value                  = [ ]
Market = Σ by type: businesses × share × frequency × contract value
```

## Subscription software

```
Target organisations           = [ ]
Average annual contract value  = [ ]
Market = target organisations × annual contract value × (1 + expansion share [ ])
```

## Marketplace

```
Category transaction value in territory = [ ]
Expected take rate                      = [ ]  (pricing decision)
Market (net revenue) = transaction value × take rate
```

## Consumer products

```
Target users or households      = [ ]
Purchases per year              = [ ]
Average purchase value          = [ ]
Market = users × purchases per year × average value
```

## Regulated or subsidised markets (for example, financial services or energy upgrades)

Add two inputs: the share of customers eligible under the current rules (from the program or regulator page opened at
the time) and the time the program is expected to run (from the same source). Never treat a subsidy as permanent or
universal.
