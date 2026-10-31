---
description: A PM asks what to build next quarter, with backlog and MRR figures inline. The skill should fire. The SKILL.md is thin (it lists frameworks and metrics but mandates no output structure), so the value rubric checks the only behaviours it asks for (a named framework with per-item scores, SaaS metrics with formulas, a target metric).
tags: [trigger, value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm the only PM at a B2B SaaS that sells lease and maintenance software to small property-management firms. We have one engineering squad next quarter and I need to decide what goes first.

Last quarter: starting MRR was $42,000. We added $6,000 of MRR from new customers and $1,500 from upgrades, lost $3,800 to cancellations and $700 to downgrades. We have 120 customer accounts. Most of the accounts that cancelled said we lack an accounting integration.

Candidates, with engineering estimates:
1. QuickBooks integration: requested by 18 accounts, about 6 weeks.
2. Tenant mobile app: sales says it would help close deals, about 12 weeks.
3. Bulk lease renewals: about 40 accounts keep a spreadsheet workaround, about 3 weeks.
4. Single sign-on: two enterprise prospects asked for it, about 2 weeks.
5. Dashboard redesign: the CEO wants it, about 5 weeks.

What should we build first, and how do I justify it to the CEO?
