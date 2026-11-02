---
description: Explicit invocation (the user types /planner). A multi-step engineering task with no UI that ships something. The skill should fire. Runs cannot write files or run commands, so the rubric checks the delivery plan in the reply (stage verdicts, skipped stages, self-authored-test caveat, what stays unverified), not an executed pipeline.
tags: [explicit, value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

/planner I need to ship a new Node.js command-line tool for a landscaping company in Laval. It reads a CSV of weekly crew timesheets (columns: employee, date, hours, job_code) and writes a payroll summary as JSON: total hours per employee per week, and overtime above 40 hours. A `--strict` flag must reject the whole file if any row has missing or negative hours. There is no user interface. Nothing is set up yet and you can't run commands here, so lay out exactly how you would take this from plan to shipped.
