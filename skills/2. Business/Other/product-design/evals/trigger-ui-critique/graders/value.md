---
type: llm
---

The reply should critique the described invoice screen using the specific standards the product-design skill prescribes, not only generic UX tips.

PASS if all of these hold:
- It sets a 7:1 contrast target (WCAG AAA) for the body or reading text such as the client names and amounts, not only the 4.5:1 AA minimum.
- It replaces the "Are you sure?" delete modal with immediate deletion plus a way to undo it (for example an undo toast, soft delete or a restorable trash), rather than keeping or rewording the confirmation dialog.
- It expresses its recommended fixes as named design tokens (for example a semantic token such as text.secondary or a spacing step such as space.md, mapped to a raw colour or pixel value), not only as raw hex codes and pixel values.

FAIL if any of these hold:
- The only contrast target it gives for the body text is 4.5:1, or it gives no target ratio.
- It keeps a confirmation dialog as the main safeguard for deleting a single invoice.
- Its fixes are given only as raw hex values, pixel values or general advice, with no named tokens.

Rubric history: v1 (2026-10-31).
