---
description: A near-miss one-line change that ships something but is trivial (the skill's own limits call its pipeline overhead here). The skill must not fire, and the message must still be written.
tags: [trigger, near-miss]
runs: 3
max_turns: 3
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a one-line commit message for a change that fixes a typo in README.md ("recieve" corrected to "receive"). Reply with only the message.
