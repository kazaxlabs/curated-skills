---
description: A user asks to improve a vague Stitch UI prompt. The skill should fire and return a structured prompt with a design-system block (named hex colours with roles), numbered page sections and the DESIGN.md tip. The skill would consult the online Stitch guide and look for a DESIGN.md; the run has no web and an empty workspace, so only the rewritten prompt in the reply is graded.
tags: [trigger, value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm generating screens in Google Stitch and my results keep coming out generic. Can you turn this into a much better prompt I can paste in? Here's what I typed last time:

"booking page for my bike repair shop, mobile, friendly, show the services with prices and let people pick a drop-off time"
