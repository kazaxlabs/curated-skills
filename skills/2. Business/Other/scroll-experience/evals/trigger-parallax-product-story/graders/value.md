---
type: llm
---

The reply should rebuild the scroll story the way the skill prescribes: smooth, accessible to motion-sensitive users, toned down on phones, and content-first.

PASS if all of these hold:
- It replaces the raw scroll listener that sets `top`/`left` with a performant approach (GSAP ScrollTrigger, CSS scroll-driven animations, IntersectionObserver, or a requestAnimationFrame-throttled handler) and moves elements with `transform` and `opacity` instead of `top`/`left`.
- It adds a reduced-motion path: a `prefers-reduced-motion` check in CSS or JavaScript that disables or tones down the parallax and the reveals.
- It reduces or disables the parallax effect itself on phones or small screens (for example smaller movement, fewer animated layers, or a static layout below a breakpoint), not only a faster implementation of the same effect.
- It makes the hero headline and the pre-order link visible on page load, without needing a scroll and without depending on JavaScript. Either it points out that they start at opacity 0 behind a scroll-triggered reveal, or its code clearly leaves the hero content and call to action visible from the start.

FAIL if any of these hold:
- Any of the four points above is missing.
- The proposed code still animates `top`, `left`, `width` or `height` on scroll.

Rubric history: v1 (2026-10-31).
