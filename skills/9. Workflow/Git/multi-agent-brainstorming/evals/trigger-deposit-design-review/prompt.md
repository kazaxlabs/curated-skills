---
description: A user hands over a signed-off design and asks for a rigorous review before implementation. The skill should fire. Runs have no Agent tool, so reviewer roles are simulated in the reply; the rubric checks role separation, per-objection arbitration, a final disposition and a decision log.
tags: [trigger, value]
runs: 3
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Before we implement this, I want it put through a proper peer review: hidden assumptions, failure modes, anything that will bite us in production. The owner has already signed off on the requirements and on the design below, so review it as written.

Design: online deposits for a small catering business
- A customer picks an event date on the website and pays a 30% deposit through Stripe Checkout.
- Stripe's checkout.session.completed webhook calls one serverless function. It marks the date as booked in a Google Sheet and emails the owner.
- If two customers pay for the same date, the first webhook to arrive wins; the same function refunds the other customer automatically.
- There are no customer accounts. Confirmation is by email only.
- Expected volume: about 20 bookings a month, up to 5 a day in December.
