---
description: A user running four coding agents on one repo asks for a lead-agent design and how it would handle a queue that contains a near-duplicate of in-progress work. The skill should fire; the reply should define a NOT-list, catch the duplicate, scope each delegation with a verification command, and gate completion on evidence. The run has no Bash or git, so the quality gates are graded as described in the reply, not executed.
tags: [trigger, value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I run four AI coding agents on the same repo: a code agent, a test agent, a docs agent and a security agent. It's chaos. Yesterday two of them fixed the same login bug in parallel, and the test agent reported "done" on a task where it hadn't changed a single file.

I want one lead agent that coordinates the other four. Design how that lead agent should work: its role, how it assigns tasks, how it avoids duplicate work, and how it decides a task is really finished. Then show me how it would handle this morning's queue.

In progress:
- #41 "Fix authentication redirect bug on /login" (security agent, started 09:10)
- #42 "Add pagination to GET /api/orders" (code agent, started 09:25)

New requests:
- "Login page bug: users get bounced back to the sign-in screen after entering their password"
- "Write unit tests for the orders pagination"
- "Update the README with the new environment variables"
- "Check the new upload endpoint for path traversal"
