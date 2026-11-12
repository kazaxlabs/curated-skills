---
name: project-folder
description: "Creates a project folder projets/NAME/ in the owner's workspace with the standard layout (README, decision log, task list, sources, deliverables, notes), adds it to the knowledge index, and runs the business profile intake when the workspace or project has no profile. Use when the owner starts a new project, mandate, campaign or business-client file, or asks to set up a folder for some work."
metadata:
  source: "business-owner pack, self-authored (2026-11)"
  pack: business-owner
---

# Project folder

Every piece of work that lasts more than one session gets its own folder, so its sources, decisions, tasks and
deliverables are found in one place by the owner, by the agent roles and by the next session.

## Standard layout

```
projets/<nom>/
  README.md                   what the project is, its goal, status, key files
  registre-des-decisions.md   this project's decisions (decision-log skill)
  taches.md                   the task plan (work-plan-files skill)
  sources/                    documents received and pages saved, each with its origin and date
  livrables/                  what is produced for the owner or for others
  notes/                      meeting reports, working notes, agent role outputs
```

If the workspace has a template at `projets/_modele/`, copy it: it is the reference layout. Otherwise create the
layout above. Git does not keep empty folders, so put an empty `.gitkeep` file in `sources/`, `livrables/` and `notes/`.

## Steps

1. **Name the folder.** Lowercase, unaccented, words joined by hyphens, short (« site-web-2027 », « soumission-dossier-2026-014 »).
   Never a customer's name, phone number or address: use the dossier number for customer work. Check that
   `projets/<nom>/` does not already exist; if it does, open it instead of creating a second one.
2. **Create the layout** (copy `projets/_modele/` or create the files above).
3. **Fill `README.md`** from what the owner said:

   ```markdown
   # <Titre du projet>

   - **But :** <ce que le projet doit produire ou changer>
   - **Pour qui :** <client par numéro de dossier, ou interne>
   - **Échéance :** <AAAA-MM-JJ ou « à fixer »>
   - **État :** démarré le AAAA-MM-JJ
   - **Fichiers clés :** taches.md, registre-des-decisions.md, livrables/
   ```

4. **Start the files:** `registre-des-decisions.md` with its title line (`# Registre des décisions — <nom>`), and
   `taches.md` with the goal and the first phase (see `work-plan-files`).
5. **Index it:** add one line for the README to `connaissances/INDEX.md`, in the format the index already uses (by
   default: path, what it is, date, source).
6. **Profile check:** if `profil-entreprise.md` is missing at the workspace root, run `business-profile-intake` now.
   If this project concerns a different line of business, brand or territory, offer a project profile
   (`projets/<nom>/profil-entreprise.md`, differences only).
7. **Update `memoire/etat-en-cours.md`** with the new project and its next step.

## Rules

- Creating the folder is part of the task the owner asked for; it needs no separate approval.
- No secrets and no customer identity in any file name or file.
- Documents received from customers that contain personal information stay in the business's own systems (CRM, file
  storage), not in the workspace; the project records only the dossier number and where the document lives.
- End with « En clair : » and two to four plain sentences: what was created and what comes next.
