<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Startup Financial Modeling Implementation Playbook

How to run the seven-step process in `SKILL.md` as a spreadsheet. Brackets are placeholders. The ratios and ranges
quoted in `SKILL.md` are not sourced; treat them as assumptions to test, never as targets.

## Workbook layout

| Tab | Content |
| --- | --- |
| `Assumptions` | every input, one per row: name, value, unit, source or basis, date, owner |
| `Revenue` | drivers by month (see `references/model-templates.md`) |
| `Costs` | direct costs, fixed costs, people (see templates) |
| `Cash` | opening cash, inflows, outflows, closing cash, months of runway |
| `Metrics` | unit economics and ratios (see `references/unit-economics.md`) |
| `Scenarios` | the three cases (see `examples/scenario-analysis.md`) |
| `Financing` | loans, credit lines, equity, grants (see `references/fundraising-scenarios.md`) |
| `Checks` | the validation checklist below, each with a pass or fail cell |

Rule: no number typed directly into a calculation tab. Every input lives in `Assumptions` with its basis.

## Assumption register (template)

| Assumption | Value | Unit | Basis | Date | Confidence note |
| --- | --- | --- | --- | --- | --- |
| [new customers per month] | [ ] | count | [own history, period X / owner estimate / cited source] | [ ] | [what would change it] |
| [average price per job] | [ ] | $ | [ ] | [ ] | [ ] |
| [payment delay] | [ ] | days | [ ] | [ ] | [ ] |

## Step checklist

1. Business model defined: revenue drivers named and each linked to an assumption.
2. Revenue projected monthly for year 1, from drivers (not from a growth percentage typed in).
3. Costs split fixed and variable; variable costs tied to the driver that causes them.
4. People plan: role, start month, fully loaded cost (salary plus the employer charges that apply, from the payroll
   provider or an accountant, not a rule of thumb).
5. Cash: revenue collected when it is paid (payment terms), costs paid when they are paid; sales taxes collected and
   remitted shown separately.
6. Metrics computed from the tabs, not typed.
7. Three scenarios, each a set of assumption values, not a percentage applied to the result.

## Validation checklist

- [ ] Every input has a basis and a date.
- [ ] Closing cash of month n equals opening cash of month n+1.
- [ ] Revenue in the model reconciles with invoicing history for the months that already happened.
- [ ] Taxes collected on sales are not counted as revenue.
- [ ] The lowest cash point and its month are visible, in every scenario.
- [ ] An accountant has reviewed the model before it is used for a loan or an investor.
