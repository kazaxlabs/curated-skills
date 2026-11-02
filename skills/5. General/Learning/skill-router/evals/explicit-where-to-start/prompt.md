---
description: Explicit invocation (the user types /skill-router). A user with a rough goal asks where to start. The skill should fire and route them. Runs load no other skills and the skill's references/fallback-routing.md does not exist, so the rubric checks the recommendation's shape (one primary, at most two secondary, invoke line, prompt offer, no re-asking known facts), not whether the named skills are installed.
tags: [explicit, value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill-router I'm not sure where to start with this. I run a small catering business and I want customers to book an event date on our Next.js website and pay a deposit with Stripe. It's only a rough idea so far, and I'd rather go step by step with you, reviewing as we go, than have everything built in one shot. What should I start with, and what can you help me with here?
