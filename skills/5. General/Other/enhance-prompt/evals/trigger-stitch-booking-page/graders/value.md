---
type: llm
---

The user gave a one-line UI idea for Google Stitch and asked for a better prompt to paste. The reply should return a structured, paste-ready UI generation prompt.

PASS if all of these hold:
- It returns a rewritten prompt ready to paste, not only advice about how to write prompts.
- The prompt contains a design-system block that states the platform and theme and gives colours each as a descriptive name plus a hex code plus the role that colour plays (for example "Deep Teal (#0f766e) for primary buttons").
- The prompt organises the screen into numbered sections from top to bottom (for example header, service list with prices, drop-off time picker, confirm button).
- Because the user supplied no design file, the reply recommends keeping the design system in a DESIGN.md file (or a similarly named shared design file) so later screens stay consistent.

FAIL if any of these hold:
- It gives tips without a rewritten prompt.
- Colours are missing, given without hex codes, or given as hex codes with no stated role.
- The page structure is not broken into numbered sections.
- It does not mention keeping a shared design-system file for consistency across screens.

Rubric history: v1 (2026-10-31).
