---
type: llm
---

The reply should return the restyled component and apply the skill's explicit bans, not only a calmer colour scheme. Judge the component code in the final message.

PASS if all of these hold:
- Typography: the Inter font is gone and is not replaced by Roboto or Open Sans, and the main headline uses a serif typeface (for example Newsreader, Instrument Serif, Playfair Display or Lyon).
- Banned defaults: the component no longer imports icons from lucide-react (it uses Phosphor, Radix icons or inline SVG instead), contains no emoji, and the "Elevate", "seamlessly", "Unleash" and "next-gen" wording and the Lorem ipsum text are replaced by plain, specific copy about crew scheduling.
- Surfaces: there is no gradient background and no `shadow-lg` or `shadow-xl`; the cards use a thin 1px light-gray border; text is off-black or charcoal rather than pure black (`text-black` or #000).

FAIL if any of these hold:
- Any of the three points above is not met in the returned code.
- The reply describes changes but does not return the updated component code.

Rubric history: v1 (2026-10-31).
