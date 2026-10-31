---
description: A near-miss git question about a conflict between two agents, with a one-command answer. The skill must not fire, and the answer must still name a git command.
tags: [trigger, near-miss]
runs: 3
max_turns: 3
allowed_tools: [Read, Glob, Grep, Skill]
---

Two of my agents edited the same file and the merge stopped with a conflict. What git command shows me which files are still conflicted? Reply with just the command.
