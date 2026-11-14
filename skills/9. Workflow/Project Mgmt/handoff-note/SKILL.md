---
name: handoff-note
description: "Writes the handoff note for the next session in the owner's workspace: memoire/passation.md (where things stand, next step, open questions, files to read, skills to use) and one dated line in memoire/journal.md. Saves in the workspace repo, never in a temporary folder, and references existing files instead of copying them. Use at the end of a work session, before stopping mid-task, or before handing the work to another session or agent."
metadata:
  source: "business-owner pack (2026-11); adapted from handoff"
  adapted-from: handoff
  upstream: "https://github.com/mattpocock/skills (MIT, Copyright (c) 2026 Matt Pocock)"
  pack: business-owner
---

# Handoff note

The next session starts cold: it knows only what is written down. The handoff note is the first thing it reads.

## Files

| File | How it is written |
| --- | --- |
| `memoire/passation.md` | replaced each time: it describes the situation now |
| `memoire/journal.md` | append one line per handoff; never rewrite older lines |

Both live in the workspace repo. Never write the handoff to a temporary folder: a temporary folder does not survive
the session.

## Steps

1. **Bring the state file up to date** (`memoire/etat-en-cours.md`, see `context-in-files`), then write the handoff
   from it.
2. **Reference, do not copy.** Plans, decisions, meeting reports and deliverables already exist as files: name their
   paths. Copy only what exists nowhere else.
3. **Tailor it.** If the owner said what the next session is for, write the note for that purpose.
4. **Write `memoire/passation.md`:**

   ```markdown
   # Passation

   _Rédigée le AAAA-MM-JJ HH:MM_

   ## Où en sont les choses
   - <projet ou sujet> : <état en une phrase>

   ## Prochaine étape
   <la première action de la prochaine séance, précise>

   ## Questions ouvertes
   - <question> — qui doit répondre (le propriétaire, un associé, un fournisseur)

   ## À lire en premier
   - <chemin> — <pourquoi>

   ## Compétences utiles
   - <nom de la compétence> — <pour quoi faire>

   ## En attente du propriétaire
   - <ce que lui seul peut faire : connexion, paiement, signature, approbation>
   ```

5. **Append to `memoire/journal.md`** one line:

   ```markdown
   - AAAA-MM-JJ HH:MM — <ce qui a été fait, en une ligne> — voir memoire/passation.md
   ```

6. **Save.** The workspace's automatic save commits and pushes memory files. If it is not active in this session,
   run `node outils/sauvegarde.mjs` when that file exists; otherwise tell the owner the files are written but not yet
   saved to the repo.

## Rules

- Redact everything sensitive: no password, key, token, code or account identifier; no customer name, phone, e-mail
  or address (dossier numbers only).
- Say plainly what is unfinished or unverified. A handoff that hides a failed step costs the next session more than
  it saves.
- End with « En clair : » and two to four plain sentences for the owner.

## Credits

Adapted from `handoff` by Matt Pocock (github.com/mattpocock/skills, MIT licence; see `NOTICE.md`). Changes: written to
`memoire/passation.md` in the workspace repo instead of the system temporary folder, a journal line added, a French
template for a business owner, the pack's redaction rules made explicit.
