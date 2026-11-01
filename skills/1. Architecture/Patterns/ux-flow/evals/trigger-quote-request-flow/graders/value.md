---
type: llm
---

The reply should design the flow before any screens, in the structure the skill mandates.

PASS if all of these hold:
- It includes an ASCII or plain-text diagram (boxes, arrows or an indented tree drawn in text) showing the screens and the transitions between them, covering both submitting a request and viewing or answering past quotes.
- It gives a screen inventory: each screen is named with its one primary purpose.
- It covers loading, empty AND error states, and gives each an explicit recovery path (for example: an empty quote history offers a way to request a quote; a failed photo upload offers retry or skip; a failed submit keeps the entered data and offers retry).
- It names where the flow starts (entry point) and what counts as finishing it (a success or exit condition, such as a confirmation screen after submit or a status change after accepting a quote).

FAIL if any of these hold:
- Any of the four points above is missing. A diagram drawn only in Mermaid or another diagram language, with no text drawing, counts as missing the ASCII diagram.
- It moves on to visual design, component code or styling instead of laying out the flow.

Rubric history: v1 (2026-10-31).
