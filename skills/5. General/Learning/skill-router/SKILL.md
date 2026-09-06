---
name: skill-router
description: "Use when the user is unsure which skill to use or where to start. Interviews the user with targeted questions — recovering context from conversation history and injected prompt text before asking anything — and recommends the best skill(s) from the *currently installed* library. Also use when the user asks 'what can I do', 'which skill fits', or 'where do I start' even if they don't say skill-router explicitly."
---

# Skill Router

## Architecture

Four sequential phases — run them in order, but skip steps made redundant by prior context.

```
Phase 0: Context Recovery  →  extract what's already known
Phase 1: Repo Audit        →  build live index from installed skills
Phase 2: Gap-Fill          →  ask only unanswered questions (≤2 turns)
Phase 3: Recommendation    →  match + recommend, offer ready-made prompt
```

Token budget rule: emit a **compressed state string** at the end of Phase 0 and again after each interview turn. This lets you discard raw conversation history from your working set before the next phase.

Compressed state format: `[ROUTER | domain:{val} | stack:{val} | spec:{val} | autonomy:{val} | gaps:{list}]`
Example: `[ROUTER | domain:building | stack:Next.js | spec:rough | autonomy:unknown | gaps:[autonomy]]`

---

## Phase 0 — Context Recovery

**Before asking the user anything**, scan two sources:

### 0A — Injected prompt text
Read any text that follows the `@skill-router` invocation in the user's current message.
Extract signals for the four routing dimensions:

| Dimension   | Look for                                                                 |
|-------------|--------------------------------------------------------------------------|
| `domain`    | Action verbs: build, fix, debug, deploy, design, plan, audit, automate  |
| `stack`     | Named tech: React, Next.js, Python, Stripe, AWS, LLM, Supabase, etc.    |
| `spec`      | Precision words: "clear spec", "rough idea", "no idea", "from scratch"  |
| `autonomy`  | Agency words: "just do it", "autonomous", "review each step", "together" |

### 0B — Conversation history scan
Read the last **8 turns** of conversation (not the full history).
Extract the same four dimensions from any user messages, code snippets, file names, or tool results visible in context.

Metadata sharding rule: do NOT read any full SKILL.md file during this phase — only scan headers, names, and descriptions.

### 0C — Build known-answers map
After scanning, mark each routing dimension:
- `[KNOWN]` — confidently extracted from Phase 0A or 0B
- `[INFERRED]` — reasonably implied (e.g., "debugging a React component" implies stack=React)
- `[UNKNOWN]` — not determinable from context

If **3 or more dimensions are KNOWN/INFERRED**, skip Phase 2 entirely and go to Phase 1 → Phase 3 directly.
If **all 4 are UNKNOWN**, run Phase 2 in full.

Emit compressed state string. Example output (internal — do not show to user):
```
[ROUTER | domain:building | stack:Next.js | spec:rough | autonomy:unknown | gaps:[autonomy]]
```

---

## Phase 1 — Live Repo Audit

Build a **routing index from the currently installed skill library** — not from any hardcoded list.

### Step 1: Read available_skills metadata
The system context includes an `available_skills` block with each installed skill's `name`, `description`, and `location`. Read the `name` and `description` fields for every skill — do NOT open or read individual SKILL.md files at this stage.

### Step 2: Build the skill index
For each skill, infer:
- **Category**: one of `[build, debug, test, integrate, ai-agent, devops, design, marketing, document, plan, security, autonomy, route]`
- **Trigger keywords**: 3–6 words from the description that signal when this skill should activate

Store as a compact index (internal working set — not shown to user):
```
skill_index = [
  {name: "docx", category: "document", triggers: ["word", "doc", "report", "memo"]},
  {name: "pptx", category: "document", triggers: ["slides", "presentation", "deck"]},
  ...
]
```

### Step 3: Cluster by category
Group the index by category. This clustering is what you will match against in Phase 3 — it replaces any hardcoded routing reference table.

### Step 4: Fallback reference
If a domain from Phase 0 returns **zero installed skill matches** in Phase 1, fall back to the reference table in `references/fallback-routing.md` to suggest skills the user may want to install. This handles gaps in their library without routing them to wrong skills.

---

## Phase 2 — Gap-Fill Interview

Ask only for **UNKNOWN** dimensions from Phase 0. Ask at most **one question per turn**.
Stop as soon as routing confidence is sufficient to make a recommendation (you don't need all 4).

Opener (use only when ≥2 dimensions are UNKNOWN):
> "Quick question or two so I can point you to the right skill."

Do NOT say "I'll ask a few questions" if context already gave you most of the signal.

### Q1 — Domain (ask only if `domain = [UNKNOWN]`)
> "What's the broad area?"

Present as inline options:
```
1 · Build/code   2 · Debug/fix   3 · Security/pentest
4 · AI/agents    5 · DevOps      6 · Design/UI
7 · Marketing    8 · Plan/docs   9 · Other (describe it)
```

### Q2 — Specificity (ask only if `spec = [UNKNOWN]`)
> "How defined is the task?"

```
1 · Clear spec — I know exactly what I want
2 · Rough idea — needs shaping
3 · Blank slate — no direction yet
```

### Q3 — Stack (ask only if `stack = [UNKNOWN]` AND `domain` implies it matters)
> "What stack or domain? (React, Python, AWS, no-code, etc. — or 'not sure')"
Accept any answer; "not sure" is fine.

### Q4 — Autonomy (ask only if `autonomy = [UNKNOWN]` AND it would change the recommendation)
> "Fully autonomous or collaborative?"

```
1 · Autonomous — just go
2 · Collaborative — I'll review steps
```

After each answer: update the compressed state string internally, then proceed.

---

## Phase 3 — Recommendation

Match the routing dimensions against the **skill_index** built in Phase 1.

### Matching logic
1. Filter `skill_index` by category matching the user's `domain`
2. Within that category, score each skill by how many of its trigger keywords overlap with the user's `stack` and `spec` signals
3. Pick the top scorer as **primary**; second and third as **secondary**

### Installed-skill guard
Before recommending any skill, verify it appears in the `available_skills` block from Phase 1.
If a skill you'd recommend is **not installed**, flag it:
> "⚠️ `@skill-name` would be ideal here but isn't in your library — you may want to install it."

### Output format

**✅ Primary: `@skill-name`**
*Why:* [1–2 sentences — be specific to what the user described, not generic]
*Invoke:*
```
@skill-name [user's goal here]
```

**🔁 Also consider:**
- `@skill-name-2` — [one sentence: when to layer this in]
- `@skill-name-3` — [one sentence: when to layer this in]

*Only include secondary skills that are actually installed.*

### After the recommendation

Always offer:
> "Want me to write a ready-to-use prompt you can paste in?"

If yes: compose a complete, specific prompt using everything learned from Phases 0–2. Apply atomic output — no preamble, start with the prompt directly.

---

## Token Budget Rules

Apply these throughout all phases:

1. **Metadata sharding** — Scan skill names + descriptions only. Never open a SKILL.md during routing unless Phase 3 produces a tie that requires reading two skills' bodies to break.

2. **Skip-if-known** — Never ask a question whose answer was recovered in Phase 0. Asking a question the user already answered is a quota waste and degrades UX.

3. **State compression** — After each turn, compress the accumulated routing state into the state string. Use this in subsequent turns rather than re-scanning raw context.

4. **Atomic output** — No bridge phrases ("Based on your answers…", "I've analyzed…", "Great!"). Start immediately with the recommendation block.

5. **1 primary + ≤2 secondary hard limit** — Never list more skills than this regardless of how many match. Token cost of reading 5 skill suggestions is higher than the user's actual decision cost.

6. **Ambiguity halt** — If after Phase 0 + Phase 2 a dimension is still ambiguous and would change the recommendation significantly, ask exactly one clarifying question rather than hedging across multiple recommendations.

---

## Constraints

- Only recommend skills found in the live `available_skills` index (Phase 1). Flag but do not silently substitute missing skills.
- If the user's goal spans multiple categories, recommend the most upstream skill (e.g. planning before building).
- Do not expose the compressed state string or skill_index to the user — they are internal working state.
- Always include exact `@invoke` syntax so users can copy-paste.
- After recommending, always offer the ready-made prompt.

---

## Reference

See `references/fallback-routing.md` for skill suggestions to make when the user's goal maps to a category with no installed skills. This file is the only place the hardcoded routing table lives — it is a fallback of last resort, not the primary routing mechanism.