---
description: A user asks to stress-test a plan against their documented domain language. The glossary and decision record are inline because runs start in an empty workspace and cannot write CONTEXT.md, so the rubric checks the challenge in the reply (glossary conflict called out, one decision at a time, a recommended answer), not file updates.
tags: [trigger, value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Stress-test this plan against our domain language and the decisions we've already documented before I write any code. It's for the crew-scheduling app of a small landscaping company.

From our CONTEXT.md:
- **Quote**: a priced estimate sent to a Customer that the Customer has not accepted yet.
- **Booking**: a confirmed reservation of a crew for a date, created when a Customer accepts a Quote and pays the deposit.
- **Customer**: the person or business that pays for the work.

From docs/adr/0001-deposit-before-booking.md: "No crew date is held until the deposit is paid."

The plan: when a client requests a quote on the website, we immediately create a booking with status "pending" so the date is held. If they don't pay within 7 days, we cancel the booking and email the client. Accounts can log in to a portal to see all their bookings.
