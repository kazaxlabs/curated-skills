---
name: skill-router
description: "Finds and loads the right skill from the whole Curated Skills library (the installed Core and the ~1,500-skill Archive). Use when the user is unsure which skill to use or where to start, asks 'what can I do', 'which skill fits' or 'where do I start', names a skill or /command that is not installed, or when the Skill tool answers 'Unknown skill'. Recovers context before asking anything, searches the Archive with the collab MCP search_skills tool, recommends, then loads and follows the chosen skill."
---

# Skill Router

Only the **Core** (about two dozen skills) is installed. Every other skill is in the **Archive**:
searchable, not installed, loaded on demand by path. This router covers both.

## Architecture

```
Phase 0: Context Recovery  →  extract what's already known
Phase 1: Search            →  load the search tool, query Core + Archive
Phase 2: Gap-Fill          →  ask only unanswered questions (≤2 turns)
Phase 3: Recommend + Load  →  recommend, then load and follow the chosen skill
```

Compressed state, kept internally after Phase 0 and each interview turn:
`[ROUTER | domain:{val} | stack:{val} | spec:{val} | autonomy:{val} | gaps:{list}]`

**Direct-load shortcut:** if the user names a specific skill (`/skill-router stripe-integration`, "load
stripe-integration", or an `Unknown skill` error just happened), skip Phases 0 and 2: run Phase 1 with that
name, then Phase 3 "Load".

---

## Phase 0 — Context Recovery

Before asking anything, read the text after the invocation and the last 8 turns. Extract:

| Dimension   | Look for                                                                 |
|-------------|--------------------------------------------------------------------------|
| `domain`    | Action verbs: build, fix, debug, deploy, design, plan, audit, automate  |
| `stack`     | Named tech: React, Next.js, Python, Stripe, AWS, LLM, Supabase, etc.    |
| `spec`      | Precision words: "clear spec", "rough idea", "no idea", "from scratch"  |
| `autonomy`  | Agency words: "just do it", "autonomous", "review each step", "together" |

Mark each `[KNOWN]`, `[INFERRED]` or `[UNKNOWN]`. With 3 or more known or inferred, skip Phase 2.

---

## Phase 1 — Search (always runs)

### Step 1: Load the search tool
- **Claude Code:** the tool is `mcp__collab__search_skills`, usually deferred. If its schema is not loaded,
  call `ToolSearch` with `select:mcp__collab__search_skills` first, then call it.
- **Antigravity / other agents:** call the `collab` server's `search_skills` tool.
- **No MCP available** (server not connected, tool missing, or an error): run the command-line search in the
  Curated Skills checkout (on this machine `C:/Curated_Skills`):
  `node C:/Curated_Skills/scripts/search-skills.mjs "<query>" --limit 5`
  It prints the same results as JSON. Never skip the search because the MCP is unavailable.

### Step 2: Query
Build 1–2 queries from the known dimensions (e.g. `stripe payment links tips`, or the exact skill name).
Call with `limit` 5. Each match returns `name`, `tier` (`core` or `archive`), `summary`, `skillPath`, and
`command` (Core only).

### Step 3: Add installed context
Also scan the installed skill list in your context (Core and plugin skills) for names that fit.
Search results and installed skills together form the candidate set. Do not read SKILL.md bodies yet.

---

## Phase 2 — Gap-Fill Interview

Ask only for `[UNKNOWN]` dimensions that would change the pick, one question per turn, at most two turns.

- Domain: `1 · Build/code  2 · Debug/fix  3 · Security  4 · AI/agents  5 · DevOps  6 · Design/UI  7 · Marketing  8 · Plan/docs  9 · Other`
- Specificity: `1 · Clear spec  2 · Rough idea  3 · Blank slate`
- Stack: free text, "not sure" is fine.
- Autonomy: `1 · Autonomous  2 · Collaborative`

Re-run Phase 1 Step 2 if an answer changes the query.

---

## Phase 3 — Recommend + Load

### Pick
Score candidates by fit to domain, stack and spec. Prefer, in order: exact name match; a Core skill;
the most upstream skill when the goal spans several (planning before building). One primary, at most
two secondary.

### Output

**✅ Primary: `skill-name`** · `core` or `archive`
*Why:* 1–2 sentences specific to the user's task.
*Path:* `skillPath` (Archive) or `/skill-name` (Core)

**🔁 Also consider:** up to two, one line each, with tier.

### Load
- If the user asked to go ahead, gave a task with the invocation, or used the direct-load shortcut: load the
  primary now.
- Otherwise ask once: "Load `skill-name` and start?"

To load:
- **Core:** invoke it through the Skill tool (or `/skill-name`).
- **Archive:** Read its `SKILL.md` at `skillPath` in full; read the files it points to (`references/`,
  `scripts/`) by path when it asks. Then follow it for the user's task as if the Skill tool had loaded it.
  Say in one line which skill you loaded and its path.

---

## Rules

- **Search is mandatory.** Never answer "not installed" without running Phase 1. The Archive holds ~1,500
  skills; most tasks have a match.
- **Metadata first.** Read SKILL.md bodies only for the skill being loaded, or to break a tie.
- **Skip-if-known.** Never ask what Phase 0 already recovered.
- **Archive skills are hypotheses.** Most are community-authored and unverified. When one conflicts with
  the repo's contract or observed reality, reality wins; say so.
- **Scripts:** run a script that ships with a skill only after reading it.
- **Nothing fits:** say so plainly and continue without a skill; do not invent one.
- **No bridge phrases.** Start with the recommendation block.
