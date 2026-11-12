@instructions-agent.md

# Espace de travail: workspace rules

These rules add to the instructions imported above, which win on any conflict. They speak to you, the agent.
Address the owner in Québec French (or the language `profil-entreprise.md` names): short, plain, professional,
no invented colloquialisms. Skill names below are the French names installed by the francisation command; the
repository name follows in brackets.

## At the start of every session

1. Read `profil-entreprise.md` and `memoire/passation.md`. The SessionStart hook prints a summary of both and the
   open tasks; open the files themselves before you rely on a detail.
2. No `profil-entreprise.md` yet: run `profil-entreprise` [business-profile-intake] before any substantive work.
3. The memory index is imported at the end of this file. Open a memory file only when the task needs it.
4. **On a computer** (`CLAUDE_CODE_REMOTE` isn't `true`): if `git status --porcelain` is empty and the branch has an
   upstream, run `git pull --ff-only`, so work merged from a phone session arrives. If it fails, say so in one line and
   go on; never force, reset or rebase.
5. **In a cloud session** (`CLAUDE_CODE_REMOTE=true`): you work on the session's own branch. Before the session ends,
   push that branch and tell the owner to merge its pull request, or the computer won't see this session's work.

## While you work

- **Keep `memoire/etat-en-cours.md` current** after each step: what is in progress, what is done, the next step,
  open questions. Anything that lives only in the conversation can be lost at compaction. The Stop hook asks for
  this once if you changed files and the file is unchanged since the session started.
- **Delegate independent parts** to the roles in `.claude/agents/`:
  - `coordination`: splits a multi-part job, delegates, merges, keeps `taches.md`;
  - `recherche`: facts and sources with links, assumptions marked;
  - `redaction`: copy in the owner's voice from `profil-entreprise.md`;
  - `analyse`: numbers, tables, reports, always with N and the period;
  - `revision`: independent review; it never writes what it reviews.

  At most 3 subagents at once; `.claude/settings.json` caps the session at 3
  (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`). Give each one a self-contained brief: the goal, the files to read,
  where to write, what "done" means.
- **Before anything goes out** (published, sent, signed, submitted): `revision` reviews it, then the owner says
  « oui ». A review is prose, not a gate; say so when you report it.
- **Decisions:** when the owner settles something, write it to the decision log without asking:
  `registre-des-decisions.md` for the business, `projets/<nom>/registre-des-decisions.md` for a project
  (`registre-des-decisions` [decision-log]). Check the log before you reopen a settled question.
- **Lessons** worth keeping go to `memoire/lecons.md`; one line per session or notable event to `memoire/journal.md`.
- **Documents:** list each kept document in `connaissances/INDEX.md` (one line: path, what, date, source). To find
  something, read the index first, then run `node outils/recherche.mjs "<mots clés>"`
  (`recherche-documentaire` [document-search]).

## Standard layout

| Path | Holds |
| --- | --- |
| `profil-entreprise.md` | the business profile: services, area, customers, offers, voice, compliance limits, accounts (names only) |
| `memoire/` | the agent's memory: `MEMOIRE.md` (index), `etat-en-cours.md`, `passation.md`, `journal.md`, `lecons.md` |
| `registre-des-decisions.md` | decisions about the business |
| `connaissances/` | reference documents, listed in `INDEX.md` |
| `projets/<nom>/` | one folder per project, copied from `projets/_modele/` (`dossier-de-projet` [project-folder]): `README.md`, `taches.md`, `registre-des-decisions.md`, `sources/`, `livrables/`, `notes/` |
| `outils/` | `recherche.mjs` (search), `sauvegarde.mjs` (auto-save), `verifier-secrets.mjs` (secret and contact check) |
| `.claude/` | `agents/` (roles), `hooks/`, `skills/` (installed skills), `settings.json`; `cache/` is local and ignored |

A new project gets its folder before any work starts. Deliverables go in `livrables/` only after `revision`.

## Memory never holds

- **A secret:** no password, key, token or two-factor code, not even in part, not "for later". Keys live in the
  owner's secret store.
- **Customer identity:** no customer name, phone, email or street address. Refer to a customer by dossier number;
  customer data stays in the business's CRM (Québec Loi 25). The business's own contact lines may be listed in
  `memoire/.autorises`.

`.githooks/pre-commit` and `outils/sauvegarde.mjs` both run `outils/verifier-secrets.mjs`. When it blocks, remove
the value. Never bypass it (`--no-verify`, editing the checker, moving the value to another file). If Claude Code's
own auto memory is on, the same two rules apply there; durable memory belongs in `memoire/`, which is versioned,
checked and reaches cloud sessions.

## Saving

- The hooks save on their own: Stop (memory changed, last save older than 10 minutes) and SessionEnd run
  `node outils/sauvegarde.mjs`, which commits only the memory paths (`memoire/`, `registre-des-decisions.md`,
  `projets/`, `connaissances/`, `profil-entreprise.md`, `.claude/skills/`) and pushes them to the current branch's
  upstream. Run it yourself after an important memory change. It is off while `memoire/.sauvegarde-desactivee`
  exists.
- Any other commit: stage named files only, never `git add -A`, and commit or push only when the owner asks.

## At the end of a session

Write `memoire/passation.md` (`note-de-passation` [handoff-note]): where things stand, the next step, open
questions. Add one line to `memoire/journal.md`.

## Memory index

@memoire/MEMOIRE.md
