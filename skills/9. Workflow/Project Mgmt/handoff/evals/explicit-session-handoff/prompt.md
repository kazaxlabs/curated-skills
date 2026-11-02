---
description: Explicit invocation (the user types /handoff). A user ends a session and asks for a handoff doc a fresh agent can pick up. Runs cannot write files, so the prompt asks for the document in the reply and the rubric checks that reply (suggested-skills section, redaction, artifacts referenced by path); the skill's save-to-OS-temp-dir step is not tested.
tags: [explicit, value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/handoff We're stopping here for today. Turn this session into a handoff document so a fresh agent can pick it up tomorrow; the next session will focus on getting the owner notification email working. I'll save the file myself, so put the whole document in your reply.

Where we are:
- Project: the quote-request form for a small landscaping company in Laval, moving off a hosted form service onto a Firebase Cloud Function that stores each lead in Firestore.
- Done: the `submitQuote` function validates the form and writes to the `leads` collection; 6 unit tests pass locally. Committed as a1b2c3d on branch feat/quote-function.
- The implementation plan is in docs/plans/quote-form-plan.md. Its steps: 1) scaffold the function, 2) validate input with zod, 3) write the lead to Firestore, 4) email the owner through Brevo, 5) add reCAPTCHA, 6) point the site's form at the new endpoint. Steps 1 to 3 are done.
- We chose Firestore over a Google Sheet; the reasoning is in docs/adr/0002-firestore-for-leads.md.
- Blocker: the Brevo sender domain is not verified yet, so test emails bounce.
- While testing I pasted a test key, BREVO_API_KEY=xkeysib-0000-EXAMPLE-NOT-REAL, and we used a sample lead: Sam Gagnon, 450-555-0142, sam.gagnon@example.com.
- Open question: when the owner email fails, should the function retry or only log the failure?
