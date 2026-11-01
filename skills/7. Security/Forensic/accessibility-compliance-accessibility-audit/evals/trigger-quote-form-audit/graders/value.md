---
type: llm
---

The run has no browser or scanner, so the audit can only read the HTML. The reply should still follow the skill's audit method: fix the scope, map each finding to a WCAG criterion with severity, and say how the fixes will be verified rather than declaring compliance from a code read.

PASS if all of these hold:
- It states the conformance target it audits against (a WCAG version and level, for example WCAG 2.1 or 2.2 Level AA) and the scope (this page or the quote request journey), either as a stated assumption or by asking the user to confirm while still giving the audit.
- Each reported issue cites a specific WCAG success criterion number (for example 1.1.1, 1.3.1, 1.4.3, 2.1.1, 2.4.7, 4.1.2) and carries a severity or priority rating.
- It identifies at least five of these: the image has no alt text; inputs are labelled only by placeholders; the div-based nav and "Send request" control are not keyboard operable or exposed as links/buttons; the focus outline is removed; the hint text or button text has insufficient contrast; required fields are indicated by colour alone; the html element has no lang attribute; the confirmation message is not announced to assistive technology; the page title is not descriptive; the headings start at h3 with no h1.
- It includes a verification or re-test step that goes beyond reading code: it names an automated scanner (for example axe, pa11y, Lighthouse or WAVE) AND manual testing (a keyboard-only walkthrough and/or a screen reader such as NVDA, JAWS or VoiceOver) to confirm the fixes or produce the compliance evidence.

FAIL if any of these hold:
- Any of the four points above is missing.
- It states that the page is, or after the fixes will be, compliant without that testing.

Rubric history: v1 (2026-10-31).
