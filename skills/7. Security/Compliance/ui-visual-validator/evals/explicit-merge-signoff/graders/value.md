---
type: llm
---

The run has no screenshots or browser: the user's written description of their screenshot is the only visual evidence. The reply should judge each goal from that evidence, treat a goal as not achieved until the evidence proves it, and refuse to accept code as proof.

PASS if all of these hold:
- It states what the described screenshot actually shows, kept separate from what the CSS is meant to do, before or alongside its verdicts (for example opening with "From the visual evidence, I observe ...").
- It gives a separate verdict for each of the three goals and does not approve the merge.
- Goal 1 (contrast): it says white text on #4CAF50 at 16px regular weight does not reach the WCAG AA 4.5:1 ratio (it is roughly 2.8:1), so the goal is not achieved.
- Goal 2 (chevron): it treats the expanded row's down-pointing chevron as evidence that the goal is NOT achieved, even though a rotate rule exists in the CSS.
- Goal 3 (mobile nav): it says the goal is unverified because there is no visual evidence below 768px wide, and asks for a screenshot or visual check at a mobile width. Accepting the media query as done, even with a "worth double-checking" caveat, does not count.

FAIL if any of these hold:
- Any of the five points above is missing.
- It marks any goal as achieved on the strength of the code alone.
- It says the change is ready to merge.

Rubric history: v1 (2026-10-31).
