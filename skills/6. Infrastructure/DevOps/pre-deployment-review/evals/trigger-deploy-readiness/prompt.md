---
description: A deploy-readiness request. The skill should fire. Value over baseline needs a fixture project and Bash, so this pilot measures triggering only; the skill's own tests/ suite covers its rules.
tags: [trigger]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Before we push this Firebase web app to production for the first time, do a pre-deployment review: is it ready to ship?
