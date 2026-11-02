---
description: A near-miss end-of-day message to a teammate, not a handoff document for another agent. The skill must not fire, and the message must still be written.
tags: [trigger, near-miss]
runs: 3
max_turns: 3
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a two-sentence Slack message to my teammate saying I'm stopping for the day and that the pull request for the quote form is ready for review.
