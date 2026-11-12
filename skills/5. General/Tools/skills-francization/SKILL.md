---
name: skills-francization
description: "Installs the business-owner pack's skills under their French names after each clone or update of the curated-skills repository: runs scripts/install-pack.mjs for the workspace or the computer, proposes French names for skills that have none and gets the owner's single approval, records them, re-runs the install, and commits the result in the owner's private workspace repo. Never touches skills it did not install. Use at setup and after every update of curated-skills."
metadata:
  source: "business-owner pack, self-authored (2026-11)"
  pack: business-owner
---

# Skills francization

The pack's skills are written in English under English names. The owner works in French, so each skill is installed
under a French folder name with a French `name` and `description`. The engine is
`scripts/install-pack.mjs` in the curated-skills repository; this skill runs it safely and handles the names it
cannot assign by itself.

## Hard rules

- **One « oui » per phase.** Show the plan, get one « oui », then do the whole phase. Reading and dry runs need no
  approval.
- **The owner signs in.** If GitHub asks for authentication (`gh auth login`, a browser page, a code), the owner does
  it himself. Never type, paste, read out or store a password, token or code.
- **Never touch skills you did not install.** The installer replaces only the folders listed in
  `noms-appliques.json`. If it reports a folder it did not create, leave it and tell the owner; do not delete or rename
  it.
- No secrets and no customer data in any file you write.

## Phase 1: get or update curated-skills (reading; no approval needed)

| Where | Clone location | Command |
| --- | --- | --- |
| Owner's computer | `~/curated-skills` | first time: `git clone https://github.com/kazaxlabs/curated-skills.git ~/curated-skills`; after: `git -C ~/curated-skills pull --ff-only` |
| Cloud session on the workspace repo | a folder outside the workspace repo, e.g. `../curated-skills` or the system temp folder | same commands with that path |

Never clone it inside the workspace repo: it would be committed. Note the commit (`git -C <clone> rev-parse --short HEAD`).

## Phase 2: plan (dry run)

Pick the target and destination:

| Situation | Target | Destination |
| --- | --- | --- |
| The owner's private workspace repo (cloud session or computer) | `workspace` | `<workspace>/.claude/skills` |
| The owner's own Claude Code on his computer | `computer` | `~/.claude/skills` |

Run from the clone:

```bash
node scripts/install-pack.mjs --pack business-owner --target workspace --dest <workspace>/.claude/skills --dry-run
```

Summarise for the owner, in French: how many skills will be installed, replaced and removed, and how many have no
French name yet (`A NOMMER:` list). Ask one « oui » for phases 3 to 5.

## Phase 3: install

Run the same command without `--dry-run`. Read the whole output:
- `installed ...` lines: done.
- `SKIP ... was not installed by this command`: a folder with that name already exists and is not ours. Leave it; tell
  the owner; propose another French name for that skill in phase 4 if needed.
- `FAIL ...`: report the line as is; do not work around it.
- Exit code 1 means at least one SKIP or FAIL. Say so.

## Phase 4: name the skills listed under `A NOMMER:`

For each listed skill, propose a French name and description, all in one table, then ask one « oui » (the owner may
correct any line).

**Name rules (same as the pack's `noms-fr.json`):**
- the standard professional term for **what the skill produces** (« séquence de courriels », « stratégie de prix »,
  « tableau de bord », « compte rendu de réunion »);
- never a folksy or invented term (no « remue-méninges »; use « séance de créativité »);
- lowercase, unaccented (é→e, à→a, ç→c), words joined by single hyphens, apostrophes become hyphens, 1 to 64
  characters, no « claude » or « anthropic »;
- unique: not already used in `noms-fr.json`, `noms-fr.local.json` or the destination folder;
- check the term in the OQLF Grand dictionnaire terminologique (vitrinelinguistique.oqlf.gouv.qc.ca) when the page can
  be opened, and record `"gdt": "verifie"` with the page URL in `gdt_source` only if you opened it and it matched;
  otherwise `"gdt": "non verifie"`. Do not work around a site that blocks automated access.

**Description rules:** plain, professional Québec French; says what the skill does and when to use it; at most 1,024
characters; no `<` or `>`.

After the « oui », add the approved entries to `<destination>/noms-fr.local.json` (create it if absent):

```json
{
  "<repo-name>": { "nom": "<nom-francais>", "description": "<description>", "gdt": "non verifie" }
}
```

This local file survives updates of curated-skills and wins over the pack's names. Then re-run phase 3.
Offer the conseiller (not the owner) to propose the approved names upstream in `packs/business-owner/noms-fr.json`.

## Phase 5: commit (workspace target only)

In the workspace repo:

```bash
git add .claude/skills
git commit -m "competences: francisation (curated-skills <commit court>)"
git push
```

Stage only `.claude/skills`. If the push asks for authentication, the owner does it. On the computer target there is
nothing to commit.

## Report

To the conseiller, in English, a short RAPPORT block: target, destination, curated-skills commit, counts (installed,
replaced, removed, skipped, named in phase 4), any SKIP or FAIL line verbatim, and whether the commit was pushed. No
secret ever appears in it. To the owner: « En clair : » and two to four plain sentences. New skill names may only
appear in a new session; say so if they do not show up in the current one.
