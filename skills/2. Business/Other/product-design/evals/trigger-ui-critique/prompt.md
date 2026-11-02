---
description: A UI critique of a described screen. The skill should fire. The value rubric checks three prescriptions the skill mandates (7:1 AAA body contrast, undo instead of a confirm modal, fixes expressed as design tokens). The screen is described in text because runs have no files or browser.
tags: [trigger, value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Do a design critique of this screen and tell me exactly what to change. It's the invoice list in a web app we built for a small catering business in Montréal; the owner uses it on a laptop and on her phone between events.

- Top toolbar: seven buttons in a row (New invoice, Export, Print, Filter, Sort, Archive, Settings), each a different colour.
- Table columns: client name, event date, amount, status. Client names and amounts are #999999 text on a white background, 12px.
- Each row ends with three 24×24px icon buttons (edit, duplicate, delete) with no labels.
- Deleting an invoice opens a modal: "Are you sure? This cannot be undone." with Cancel and OK.
- When there are no invoices yet, the page shows the text "No data found".
- If the server call fails, a red banner says "Error 500".
- Paddings are a mix of 5px, 10px, 15px and 18px.
