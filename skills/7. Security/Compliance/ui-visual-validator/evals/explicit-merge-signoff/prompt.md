---
description: Explicit invocation (the user types /ui-visual-validator). A sign-off request for three UI goals with a CSS diff and a written screenshot description. The skill should fire. The run has no screenshots or browser, so the written description is the only visual evidence; the value rubric checks that each goal is judged from that evidence rather than from the code.
tags: [explicit, value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/ui-visual-validator Can you verify this UI change visually and sign it off before I merge? The ticket has three goals:

1. The "Get a quote" button text meets WCAG AA contrast.
2. When an FAQ item is opened, its chevron flips to point up.
3. Below 768px wide, the nav links collapse into a single menu button.

What I changed:

```css
.btn-primary { background: #4CAF50; color: #FFFFFF; } /* was #8BC34A */
.faq-item.is-open .chevron { transform: rotate(180deg); }
@media (max-width: 768px) {
  .nav-links { display: none; }
  .menu-toggle { display: block; }
}
```

The screenshot I took after the change (desktop, 1440px wide, light theme): a header with the logo on the left and five nav links on the right; a hero with a medium-green button labelled "Get a quote" in white, 16px regular-weight text; below that, the FAQ list with "Do you work in winter?" expanded and showing its answer, and the chevron at the right of that row pointing down, the same as on the collapsed rows. The media query covers the mobile nav, so that part is done.

Is this good to merge?
