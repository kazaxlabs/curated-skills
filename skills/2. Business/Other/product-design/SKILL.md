---
name: product-design
description: "Apple-level product design — visual systems, UX flows, accessibility, proprietary visual language, design tokens, prototyping, and handoff. Covers Figma, design systems, typography, color, spacing, motion design, and cognitive design principles."
risk: none
source: community
date_added: '2026-03-06'
author: renat
tags:
- design
- ux
- design-systems
- accessibility
- figma
tools:
- claude-code
- antigravity
- cursor
- gemini-cli
- codex-cli
---

# PRODUCT DESIGN — Apple-Level

## Overview

Apple-level product design — visual systems, UX flows, accessibility, proprietary visual language, design tokens, prototyping, and handoff. Covers Figma, design systems, typography, color, spacing, motion design, and cognitive design principles. Activate to: create design systems, define visual language, review UX, accessibility, design tokens, product branding, and UI critique.

## When to Use This Skill

- When you need specialized assistance with this domain

## Do Not Use This Skill When

- The task is unrelated to product design
- A simpler, more specific tool can handle the request
- The user needs general-purpose assistance without domain expertise

## How It Works

> "Design is not just what it looks like and feels like. Design is how it works."
> — Steve Jobs

---

## The 10 Principles of Jony Ive / Apple

1. **Radical simplicity** — remove everything that is non-essential
2. **Material honesty** — every element exists for a reason
3. **Less is more** — restraint is a design decision
4. **Systemic coherence** — everything is part of a single unified system
5. **Details matter** — the user feels them, even without noticing
6. **Function defines form** — aesthetics serve purpose
7. **Durability** — design that ages well
8. **Accessibility by default** — not as an add-on
9. **Continuity across screens** — unified experience
10. **Delightful surprise** — the unexpected that charms

## Cognitive Design

- **Zero cognitive load** — the user should never have to stop and think
- **Clear affordances** — what is clickable looks clickable
- **Immediate feedback** — every action has a visual response
- **Error prevention** — design that makes mistakes impossible

---

## Structure of an Elite Design System

```
design-system/
├── tokens/
│   ├── colors.json       # full palette with semantic mapping
│   ├── typography.json   # typographic scale
│   ├── spacing.json      # grid and spacing scale
│   ├── shadows.json      # elevation and depth
│   ├── motion.json       # duration and easing
│   └── radius.json       # border radii
├── components/
│   ├── atoms/            # Button, Input, Icon, Badge
│   ├── molecules/        # Card, Form, NavItem
│   └── organisms/        # Header, Sidebar, Modal
├── patterns/
│   ├── onboarding.md     # first-time user experience
│   ├── empty-states.md   # zero-data states
│   ├── loading.md        # loading states
│   └── errors.md         # error handling
└── guidelines/
    ├── voice-tone.md     # voice and tone
    ├── imagery.md        # photography and illustration
    └── accessibility.md  # WCAG 2.1 AA
```

## Design Tokens — Auri Example

```json
{
  "color": {
    "brand": {
      "primary": "#6C63FF",
      "primary-dark": "#5A52E0",
      "accent": "#FF6B6B",
      "surface": "#F8F7FF"
    },
    "semantic": {
      "success": "#22C55E",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#3B82F6"
    },
    "neutral": {
      "900": "#111827",
      "800": "#1F2937",
      "600": "#4B5563",
      "400": "#9CA3AF",
      "200": "#E5E7EB",
      "50":  "#F9FAFB"
    }
  },
  "typography": {
    "display": { "size": "48px", "weight": "700", "line": "1.1" },
    "h1": { "size": "36px", "weight": "700", "line": "1.2" },
    "h2": { "size": "28px", "weight": "600", "line": "1.3" },
    "body": { "size": "16px", "weight": "400", "line": "1.6" },
    "small": { "size": "14px", "weight": "400", "line": "1.5" }
  },
  "spacing": {
    "xs": "4px", "sm": "8px", "md": "16px",
    "lg": "24px", "xl": "32px", "2xl": "48px", "3xl": "64px"
  },
  "radius": {
    "sm": "4px", "md": "8px", "lg": "12px",
    "xl": "16px", "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 3px rgba(0,0,0,0.12)",
    "md": "0 4px 12px rgba(0,0,0,0.15)",
    "lg": "0 8px 24px rgba(0,0,0,0.18)",
    "xl": "0 20px 60px rgba(0,0,0,0.22)"
  },
  "motion": {
    "fast": "150ms ease-out",
    "normal": "250ms ease-in-out",
    "slow": "400ms cubic-bezier(0.34, 1.56, 0.64, 1)"
  }
}
```

---

## Structure of a UX Flow

```
1. Entry Point (how the user arrives)
2. Context (what the user knows/wants)
3. Action (what the user does)
4. Feedback (immediate system response)
5. Outcome (what the user achieved)
6. Next Step (what naturally comes next)
```

## Elite Onboarding (First 5 Minutes)

```
Screen 1: Promise — "What you will achieve"
  - One high-impact sentence
  - An image demonstrating the outcome
  - CTA: "Get Started" (not "Create account")

Screen 2: Immediate action — initial value before sign-up
  - Let the user experience something real
  - Minimal form (email only)
  - Visible progress indicator (1 of 3)

Screen 3: Personalization — "Tell us about yourself"
  - Max 3 questions
  - Visual selection, not text entry
  - Skip option always available

Screen 4: Aha Moment — first genuine success
  - The user completes an action that works
  - Genuine celebration (not exaggerated)
  - "You just completed [high-value action]"
```

## Empty States That Delight

```
Do not show: "No items found"
Show instead:
  - Contextual illustration
  - Opportunity-driven message: "There is no [X] yet. Create your first one!"
  - Primary CTA
  - Optional: quick tip on how to get started
```

---

## Unique Principles for Voice UI

1. **Zero visual load** — the user sees nothing (hears only)
2. **Effortless reversibility** — "undo" is always possible
3. **Optional confirmation** — only for irreversible actions
4. **Response variety** — never the exact same phrase twice
5. **Silence is okay** — 2-second pause before asking if help is needed

## Voice Response Structure

```
[Optional Hook] + [Core Answer] + [Action or Follow-up Question]

Bad:  "Sorry, I didn't understand what you said. Could you repeat that?"
Good: "I didn't quite catch that. Could you say it another way?"

Bad:  "Sure! I can help with that. The answer to your question is..."
Good: "The answer is: [direct answer]"
```

## Auri Interaction Scripts

```
First Use:
"Hi! I'm Auri. You can ask me anything — from business decisions
to creative ideas. How can I help today?"

Returning User:
"Welcome back! Where we left off was in [topic]. Want to continue?"

Not Understood:
"I didn't quite catch that. Try saying it another way?"

Sign-Off:
"If you need anything, just reach out. See you soon!"
```

---

## Constructive Critique Framework

```
1. OBSERVATION: What I see (objective, non-judgmental)
   "I notice the primary button is in the bottom-right corner"

2. PRINCIPLE: Which design principle is being tested
   "Visual hierarchy and primary CTA positioning"

3. IMPACT: How this affects the user
   "Users navigating with their thumb have to stretch to reach it"

4. ALTERNATIVE: Constructive suggestion
   "Consider placing it above the fold, centered"

5. TRADE-OFF: What is gained versus lost
   "More accessible, but reduces available content area"
```

## UI Critique Checklist

- [ ] Clear visual hierarchy (the eye instinctively knows where to go)
- [ ] Adequate contrast (WCAG AA: 4.5:1 for body text)
- [ ] Minimum touch target size (44x44px on mobile)
- [ ] Consistency with the design system
- [ ] Defined interactive states (hover/active/disabled/focus)
- [ ] Responsiveness (mobile-first)
- [ ] Loading states and empty states accounted for
- [ ] Error handling with helpful, actionable messages
- [ ] Accessibility (labels, ARIA roles, keyboard navigation)
- [ ] Perceived performance (skeleton screens, optimistic UI)

---

## Visual Concept

Auri is **intelligence with human warmth**. Not a robot — a presence.
The visual identity must communicate: accessible sophistication.

## Primary Palette

```
Auri Purple:   #6C63FF  — identity, intelligence, innovation
Auri Pink:     #FF6B9D  — warmth, empathy, humanity
Pure White:    #FFFFFF  — clarity, space, breathing room
Soft Graphite: #1A1A2E  — authority, depth, nighttime
```

## Typography

```
Display / Headings: Inter (or SF Pro for Apple ecosystem) — Bold 700
Body text:          Inter Regular 400 — 1.6 line height
Mono / Code:        JetBrains Mono — for technical elements
```

## Logo Concept

```
Shape: Stylized audio waveform forming the letter "A"
Color: Purple → pink gradient (left to right)
Negative space: Suggestion of a microphone or ear
Dark / Light versions: Both defined
Minimum size: 24px (icon), 120px (full lockup)
```

---

## Design Stack

| Tool | Usage |
|------|-------|
| Figma | UI design, prototyping, handoff |
| FigJam | User journeys, workshops, ideation |
| Zeroheight | Design system documentation |
| Lottie | Animations (exported from After Effects/Figma) |
| Mobbin | UI pattern reference |
| Screenlane | Real-world UI inspiration |

## 5-Day Design Sprint Process

```
Monday:    Understand — research, user interviews, problem definition
Tuesday:   Diverge — crazy 8s, individual sketches, lightning demos
Wednesday: Decide — vote, storyboard, final decision
Thursday:  Prototype — high-fidelity prototype in Figma
Friday:    Test — 5 users, gather insights, iterate
```

---

## 8. Commands

| Command | Action |
|---------|--------|
| `/design-critique` | Structured design critique |
| `/design-tokens` | Generates tokens for a project |
| `/ux-flow` | Maps experience user flow |
| `/voice-ux` | Voice interaction design |
| `/onboarding` | Creates onboarding flow |
| `/design-system` | Structures complete design system |
| `/accessibility` | Accessibility audit |
| `/visual-identity` | Defines product visual identity |

## Best Practices

- Provide clear, specific context about your project and requirements
- Review all suggestions before applying them to production code
- Combine with other complementary skills for comprehensive analysis

## Common Pitfalls

- Using this skill for tasks outside its domain expertise
- Applying recommendations without understanding your specific context
- Not providing enough project context for accurate analysis

## Related Skills

- `analytics-product` - Complementary skill for enhanced analysis
- `growth-engine` - Complementary skill for enhanced analysis
- `monetization` - Complementary skill for enhanced analysis
- `product-inventor` - Complementary skill for enhanced analysis

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
