---
name: product-design
description: "Master-level product design engineering — visual systems, cognitive UX architecture, design tokens, spatial ergonomics, accessibility (WCAG 2.2 AAA), micro-interactions, and Apple/Dieter Rams industrial design principles."
risk: safe
source: curated
date_added: '2026-03-06'
date_updated: '2026-09-07'
author: kazaxlabs
tags:
- design
- ux-engineering
- design-systems
- visual-hierarchy
- typography
- accessibility
- apple-standards
tools:
- claude-code
- antigravity
- cursor
- gemini-cli
- codex-cli
---

# PRODUCT DESIGN — Elite Engineering & Industrial UX Standard

> "Design is not just what it looks like and feels like. Design is how it works."  
> — Steve Jobs

---

## 1. Foundational Tenets: The Apple & Dieter Rams Synthesis

Elite product design is the ruthless elimination of the non-essential until what remains appears inevitable, natural, and effortless.

| Tenet | Engineering Translation | Operational Test |
| :--- | :--- | :--- |
| **1. Radical Subtraction** | Remove every stroke, container, label, and control that fails to alter user behavior. | **The Deletion Test:** If removing a border or label leaves meaning intact, it was visual noise. |
| **2. Material Honesty** | Digital surfaces behave with physical logic — weight, inertia, light, and depth. | **No Fake Metaphors:** Shadows denote z-index elevation, not decoration. Gradients follow directional light. |
| **3. Systemic Coherence** | Every atom, token, and screen derives from a single mathematical and typographic continuum. | **Token Audit:** Zero hardcoded hex codes, pixel sizes, or timing values anywhere in the codebase. |
| **4. Cognitive Transparency** | The interface disappears behind the user's intent. Zero mental calculation required. | **Zero-Load Rule:** The user never calculates where to click, how to revert, or what state the system is in. |
| **5. Emotional Resonance** | Restraint creates quiet luxury; purposeful micro-motion provides tactile pleasure. | **Silent Luxury:** High contrast, pristine whitespace, deliberate rhythm, and buttery spring physics. |
| **6. Deterministic Reversibility** | Safe exploration replaces defensive friction. Undo vaults replace destructive warning modals. | **The Vault Pattern:** Actions execute instantly; reversible safety nets replace confirming prompts. |
| **7. Universal Accessibility** | High contrast, generous touch hitboxes, and screen-reader semantics baked into the substrate. | **WCAG 2.2 AAA Default:** 7:1 contrast for body text, 44×44px touch targets, full keyboard navigability. |

---

## 2. Design Token Architecture (W3C Standard)

A resilient design system enforces a **Three-Tier Token Hierarchy**: Primitive $\rightarrow$ Semantic $\rightarrow$ Component.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PRIMITIVE TOKENS (Raw Palette & Scales)                  │
│    color.slate.900 = #0f172a | font.scale.16 = 1rem         │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. SEMANTIC TOKENS (Contextual & Functional Meaning)        │
│    surface.canvas = color.slate.50 | text.primary = slate.900│
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. COMPONENT TOKENS (Specific Scoped Properties)            │
│    button.primary.bg = surface.brand | card.border = hairline│
└─────────────────────────────────────────────────────────────┘
```

### Production Token Specification (`tokens.json`)

```json
{
  "color": {
    "primitive": {
      "black": "#000000",
      "white": "#ffffff",
      "ink": "#09090b",
      "graphite": "#27272a",
      "slate": "#71717a",
      "hairline": "#e4e4e7",
      "emerald": "#059669",
      "amber": "#d97706",
      "rose": "#e11d48"
    },
    "semantic": {
      "surface": {
        "canvas": "var(--color-primitive-white)",
        "card": "#ffffff",
        "recessed": "#f4f4f5",
        "overlay": "rgba(9, 9, 11, 0.6)"
      },
      "text": {
        "primary": "var(--color-primitive-ink)",
        "secondary": "var(--color-primitive-graphite)",
        "muted": "var(--color-primitive-slate)",
        "inverse": "#ffffff"
      },
      "border": {
        "hairline": "var(--color-primitive-hairline)",
        "hover": "var(--color-primitive-graphite)",
        "focus": "var(--color-primitive-ink)"
      },
      "status": {
        "live": { "fg": "#059669", "bg": "#ecfdf5", "border": "#a7f3d0" },
        "warning": { "fg": "#d97706", "bg": "#fffbeb", "border": "#fde68a" },
        "danger": { "fg": "#e11d48", "bg": "#fff1f2", "border": "#fecdd3" }
      }
    }
  },
  "typography": {
    "fontFamily": {
      "display": "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "mono": "'JetBrains Mono', monospace"
    },
    "scale": {
      "caption": { "size": "0.6875rem", "lineHeight": "1rem", "weight": "600", "tracking": "0.04em" },
      "bodySmall": { "size": "0.75rem", "lineHeight": "1.125rem", "weight": "400", "tracking": "0" },
      "body": { "size": "0.8125rem", "lineHeight": "1.25rem", "weight": "400", "tracking": "-0.01em" },
      "subheading": { "size": "0.9375rem", "lineHeight": "1.375rem", "weight": "600", "tracking": "-0.02em" },
      "heading": { "size": "1.25rem", "lineHeight": "1.75rem", "weight": "700", "tracking": "-0.03em" },
      "display": { "size": "2rem", "lineHeight": "2.25rem", "weight": "800", "tracking": "-0.04em" }
    }
  },
  "spacing": {
    "2xs": "2px",
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "2xl": "32px",
    "3xl": "48px"
  },
  "elevation": {
    "flat": "none",
    "hairline": "0 0 0 1px var(--color-semantic-border-hairline)",
    "card": "0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px var(--color-semantic-border-hairline)",
    "drawer": "-8px 0 24px -4px rgba(0, 0, 0, 0.08)",
    "modal": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
  },
  "motion": {
    "instant": "80ms ease-out",
    "rapid": "150ms cubic-bezier(0.16, 1, 0.3, 1)",
    "deliberate": "250ms cubic-bezier(0.2, 0, 0, 1)",
    "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)"
  }
}
```

---

## 3. Cognitive UX Architecture & Information Ergonomics

### 3.1 Cognitive Laws Applied to UI Engineering

1. **Hick-Hyman Law ($T = b \cdot \log_2(n + 1)$):**  
   Decision time increases logarithmically with the number of choices.
   - *Rule:* Maximum 5 primary actions per view. Collapse secondary tools into contextual overflow menus.
2. **Fitts's Law ($MT = a + b \log_2(2D / W)$):**  
   Target acquisition time is a function of distance ($D$) and target width ($W$).
   - *Rule:* Frequently clicked CTAs and navigation rails must sit on screen edges (infinite width affordance) or floating bottom action sheets for mobile thumbs.
3. **Tesler's Law (Conservation of Complexity):**  
   Every application has an inherent amount of irreducible complexity.
   - *Rule:* Shift the complexity burden from user memory onto the software (e.g. automated draft saves, smart field derivation, undo vaults).

### 3.2 The Onboarding Protocol (The 60-Second Aha Curve)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Value Proof  │ ────► │ 2. Zero-Barrier │ ────► │ 3. Immediate Aha│
│ Single promise  │       │ Instant Sandbox │       │ First real win  │
│ No login walls  │       │ Working default │       │ Dopamine payoff │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

- **Step 1 (First 5 seconds):** Show, don't explain. Present live interactive components with realistic data instead of marketing carousels.
- **Step 2 (Seconds 5–30):** Frictionless engagement. Let the user manipulate sliders, toggle filters, or edit a card before demanding an account.
- **Step 3 (Seconds 30–60):** The Aha confirmation. Celebrate the first genuine action with understated tactile confirmation (micro-confetti, subtle green check pulse, or quiet spring animation).

### 3.3 Zero-Data & Error Ergonomics

- **Never display a cold blank screen:** "No data found" is a developer error, not UX.
- **The Triple-Component Zero State:**
  1. *Contextual SVG Iconography* (32px monochrome glyph, never whimsical illustrations).
  2. *Actionable Pitch:* "No client invoices generated yet. Create your first quote to initialize the financial ledger."
  3. *Primary Action Button:* Direct affordance to create or seed demo records.
- **Error Remediation:** An error dialog that does not offer a 1-click remedy is defective. State: (1) what happened, (2) why it happened, and (3) provide the primary recovery CTA.

---

## 4. Layout, Spacing & The Spatial Grid

### 4.1 The 8-Point Structural Rhythm

All containers, margins, paddings, and column offsets must strictly align to integer multiples of **8px** (with **4px** reserved for micro-spacing inside pills and compact tables).

| Spatial Step | Value | Canonical Purpose |
| :--- | :--- | :--- |
| `2xs` | 2px | Hairline borders, focus rings |
| `xs` | 4px | Internal badge padding, icon-to-text gaps |
| `sm` | 8px | Button inline gaps, input inner padding |
| `md` | 12px | Compact table row padding, card inner gutters |
| `lg` | 16px | Standard card padding, modal content margins |
| `xl` | 24px | Section padding, canvas edge gutters |
| `2xl` | 32px | Grid row gaps, workspace separation |
| `3xl` | 48px | Top-level dashboard module gutters |

### 4.2 Spatial Studio Layout Anatomy

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOPBAR (Height: 56px | Border-Bottom: 1px Hairline)                   │
│ [Breadcrumbs / Active Module]            [Live Toggle] [User Pill]    │
├─────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR │ MAIN WORKSPACE CANVAS (Overflow-Y: Auto)                     │
│ 56px /  │                                                              │
│ 240px   │  ┌────────────────────────────────────────────────────────┐  │
│ Nav     │  │ KPI METRIC CHIPS (4-Col Grid, 16px Gap)               │  │
│ Rail    │  └────────────────────────────────────────────────────────┘  │
│         │                                                              │
│         │  ┌────────────────────────────────────────────────────────┐  │
│         │  │ SPATIAL CONTAINER (Hairline Frame, White Surface)      │  │
│         │  │ ├────────────────────────────────────────────────────┤ │  │
│         │  │ │ Container Header (Title, Pill, Action Slot)        │ │  │
│         │  │ ├────────────────────────────────────────────────────┤ │  │
│         │  │ │ Data Table / Interactive Canvas                    │ │  │
│         │  │ └────────────────────────────────────────────────────┘ │  │
│         │  └────────────────────────────────────────────────────────┘  │
└─────────┴──────────────────────────────────────────────────────────────┘
```

---

## 5. UI Critique & Refactoring Protocol

When inspecting an interface, apply the **4-Phase Deconstruction**:

```
1. OBSERVE   ──► Record raw elements without value judgments.
2. DIAGNOSE  ──► Map observed friction against cognitive & visual laws.
3. PRESCRIBE ──► Provide exact tokenized CSS and structural HTML remedies.
4. VALIDATE  ──► Run the Deletion Test and Contrast Score.
```

### The 10-Point Product Evaluation Rubric

| # | Inspection Dimension | Failure State | Pass State |
| :---: | :--- | :--- | :--- |
| **1** | **Visual Hierarchy** | Everything is bold or colored; eye wanders aimlessly. | Single clear primary focus; secondary elements muted to 60% opacity. |
| **2** | **Touch Ergonomics** | Tiny 24px hit targets on interactive icons. | Generous 44×44px hitboxes with visible focus rings. |
| **3** | **Contrast Compliance** | Low-contrast light gray text on white (`#999`). | Minimum 4.5:1 for UI elements; 7:1 for continuous reading. |
| **4** | **Restraint & Color** | Rainbow badges, competing primary buttons. | Monochrome substrate with single semantic accent colors for signals. |
| **5** | **Typography Pairing** | Generic system fonts with awkward tracking. | Montserrat or Inter paired with JetBrains Mono for metrics; tight negative tracking on display headings. |
| **6** | **State Completeness** | Missing loading skeletons, error screens, or empty states. | Every async boundary has deterministic loading, zero, and failure views. |
| **7** | **Affordance Clarity** | Flat text that turns out to be clickable. | Interactive controls carry subtle hover, active, and cursor affordances. |
| **8** | **Motion Meaning** | Bouncy gratuitous animations that delay user actions. | Snappy 150ms transitions that communicate spatial lineage. |
| **9** | **Reversibility** | Modal popups interrupting flows with "Are you sure?". | Instant execution with 10-second undo toasts and persistent soft-delete vault. |
| **10**| **Data Density** | Wasted screens with excessive scrolling for small tables. | High-density information packing with clean 1px hairline dividers. |

---

## 6. Execution Commands

| Trigger | Operational Output |
| :--- | :--- |
| `/design-audit` | Executes full 10-point evaluation rubric over specified UI screens or component files. |
| `/tokens-generate` | Synthesizes a production `tokens.json` and matching `index.css` tailored to brand guidelines. |
| `/ux-teardown` | Maps user flow friction, cognitive load bottlenecks, and calculates Hick's Law penalty scores. |
| `/zero-states` | Generates high-polish empty-state components with SVG illustrations and creation hooks. |
| `/accessibility-gate`| Runs contrast calculation, ARIA landmark checks, and keyboard traversal audits. |
that 