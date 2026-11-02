---
description: A user asks to be challenged on a plan. The skill should fire and the reply should be a single question with a recommended answer, not an implementation.
tags: [trigger, value]
runs: 3
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

Grill me on this plan before I start building it. I want to move my landscaping client's contact form off a third-party form service and onto a Firebase Cloud Function that stores each lead in Firestore and emails the owner through Brevo. Launch is next week.
