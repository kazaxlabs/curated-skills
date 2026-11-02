---
description: A multi-screen mobile feature to map before design. The skill should fire; the value rubric checks the skill's mandated output (ASCII flow, screen inventory, loading/empty/error states with recovery, entry and exit), judged from the reply alone.
tags: [trigger, value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We're adding a quote request feature to a landscaping company's customer app (iOS and Android). Customers need to:

- pick a service (lawn care, hedge trimming, snow removal, spring cleanup)
- describe the property: lot size and any notes
- add up to 5 photos of the yard
- choose a preferred visit window
- submit, and get a confirmation

They also need to see their past quote requests with a status (pending, quoted, accepted, declined) and open one to accept or decline the price.

Before anyone designs screens or writes code, map out how the user moves through this: which screens we need and how they connect.
