---
description: Review written content for AI patterns, auto-detect type, score it, and rewrite in an authentic human voice
argument-hint: "<draft text, file path, or empty to review recent text>"
---

The user is invoking **The Humanizer** on the provided content or target draft:

`$ARGUMENTS`

If no content was supplied directly in the arguments, check the user's active document or recent context for the draft to review. If still ambiguous, prompt the user for the text or voice sample.

Execute the full Humanizer review pipeline:

1. **Step 0: Auto-Detect Content Type**: Classify as Email, LinkedIn, Slack, or Blog Post (default to Blog Post if ambiguous). State the detected type clearly at the top.
2. **Step 1: AI Pattern Scan**: Run universal phrase-level & structural markers, plus channel-specific markers for the detected medium. Quote exact snippets and locations.
3. **Step 2: Originality Check & Calibration**:
   - For LinkedIn: Run the Hook vs. Value Calibration check (Stage 1 distribution vs Stage 2 dwell time/saves/comments, saves-worthiness test, comment-quality test).
   - For Email: Run the Clarity & Effectiveness Check (single ask, under 60-second reply, upfront purpose).
   - Check for earned authority vs generic consulting fluff.
4. **Step 3: Score the Content**: Score on the 4 channel-specific dimensions (1–10) with one-line justifications.
5. **Step 4: Structured Review Report**: Output the standardized report format (Overall Assessment, Scores Table, AI Pattern Flags, Originality/Clarity Flags, Top 3 Actionable Changes).
6. **Step 5: Humanized Rewrite**: Provide the complete rewrite adhering strictly to the universal and channel-specific rewrite rules. Never add unstated ideas; never remove substance.
7. **Step 6: Auto-Improvement Loop**: Check for any novel patterns detected in this review and record whether skill self-update was triggered.
