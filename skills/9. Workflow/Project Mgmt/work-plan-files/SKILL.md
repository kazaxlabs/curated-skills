---
name: work-plan-files
description: "Keeps a project's working plan on disk in three files in the project folder: taches.md (goal, phases, state markers), constats.md (what was learned, with sources) and avancement.md (session log). Re-reads the plan before decisions, updates it after each step, logs errors and never repeats a failed action. Use for any task of three or more steps, research that spans several searches, or work that will continue in another session."
metadata:
  source: "business-owner pack (2026-11); adapted from planning-with-files"
  adapted-from: planning-with-files
  upstream: "https://github.com/OthmanAdi/planning-with-files (MIT, Copyright (c) 2026 Ahmad Adi)"
  pack: business-owner
---

# Work plan in files

The conversation is short-term memory: it gets summarised and loses detail. Files in the project folder are the
long-term memory. Anything that matters for the next step goes into a file.

## The three files (in `projets/<nom>/`, or at the workspace root for work with no project)

| File | Purpose | Update |
| --- | --- | --- |
| `taches.md` | goal, phases, state of each step, errors | after each phase or step |
| `constats.md` | facts found, with their source and label (sourced, measured, assumed) | after every discovery |
| `avancement.md` | dated log of what was done, files touched, results of checks | during the session |

Decisions do not go here: they go to the project's `registre-des-decisions.md` (`decision-log` skill). The plan only
points to them.

## Rules

1. **Plan first.** No task of three or more steps starts without `taches.md`.
2. **Two-action rule.** After every two searches, page views or document reads, write what you learned to
   `constats.md`. Images, PDFs and web pages do not survive a summary; text in a file does.
3. **Read before deciding.** Re-read `taches.md` before each important choice, so the goal stays in view.
4. **Update after acting.** When a step is done, change its marker and add one line to `avancement.md`.
5. **Log every error** in the « Erreurs » table of `taches.md`: what failed, which attempt, what was done.
6. **Never repeat a failed action.** Change the approach:
   - attempt 1: read the error and fix the cause;
   - attempt 2: a different method or tool;
   - attempt 3: question the assumptions, re-plan;
   - then stop and tell the owner what was tried, the exact error, and the choice he has.
7. **State markers** (counted, not estimated): `- [ ]` to do, `- [~]` in progress, `- [x]` done with its result.

## Templates

`taches.md`:

```markdown
# Plan — <titre>

**But :** <une phrase : le résultat attendu>
**Phase en cours :** 1

## Phases
### Phase 1 — Comprendre la demande
- [ ] Préciser le besoin et les contraintes
- [ ] Noter les constats dans constats.md

### Phase 2 — <titre>
- [ ] <étape>

## Décisions
Voir registre-des-decisions.md (entrées du AAAA-MM-JJ).

## Erreurs
| Erreur | Tentative | Ce qui a été fait |
| --- | --- | --- |
```

`constats.md`:

```markdown
# Constats — <titre>

## Besoins
- <ce que le propriétaire a demandé, en ses mots>

## Faits trouvés
- <fait> — sourcé : <URL ouverte le AAAA-MM-JJ> | mesuré : <fichier, N, période> | supposé : <pourquoi>

## Ressources
- <chemin ou URL> — <ce que c'est>
```

`avancement.md`:

```markdown
# Avancement — <titre>

## AAAA-MM-JJ
- <heure> — <ce qui a été fait> — fichiers : <chemins> — résultat : <ok, échec, à vérifier>
```

## The five-question check

When resuming, you should be able to answer from the files alone:

| Question | File |
| --- | --- |
| Where am I? | `taches.md`, current phase |
| Where am I going? | `taches.md`, remaining phases |
| What is the goal? | `taches.md`, « But » |
| What have I learned? | `constats.md` |
| What have I done? | `avancement.md` |

If you cannot, update the files before continuing.

## When to skip

A single question, a one-file edit, or a quick lookup does not need a plan.

## Rules from the pack

- No secrets and no customer identity in any of the three files; refer to customers by dossier number.
- Facts in `constats.md` carry their origin (see `evidence-gate`).
- Keep `memoire/etat-en-cours.md` pointing to the active plan (`context-in-files`).

## Credits

Adapted from `planning-with-files` by Ahmad Adi (github.com/OthmanAdi/planning-with-files, MIT licence), via this
repository's community copy. Changes: French file names (`taches.md`, `constats.md`, `avancement.md`) in the project
folder, decisions moved to the decision log, evidence labels added, templates inlined, no plugin paths and no shell
scripts.
