---
name: decision-log
description: "Appends an entry to the business decision log (registre-des-decisions.md at the workspace root, or in the project folder) whenever the owner settles something: date, decision, reason, options rejected, who decided, review date. Checks the log before a settled question is reopened. Writes without asking. Use whenever the owner decides, approves or rejects something, and before reopening any question that may already be settled."
metadata:
  source: "business-owner pack, self-authored (2026-11)"
  pack: business-owner
---

# Decision log

A decision that lives only in a conversation gets made again next month. The log keeps each settled question, why it
was settled, and when to look at it again.

## Where

| Scope | File |
| --- | --- |
| The business as a whole (prices, suppliers, policies, tools) | `registre-des-decisions.md` at the workspace root |
| One project | `projets/<nom>/registre-des-decisions.md` |
| claude.ai (no file system) | Write the entry in the answer, in a code block, and tell the owner to add it to the Project file `registre-des-decisions.md`. Do not claim it is saved. |

When unsure, use the project log and add one line to the root log pointing to it.

## When to write

- The owner decides, approves, rejects or chooses between options (« on garde Brevo », « non au paiement en ligne pour
  l'instant »).
- A meeting produces decisions (the `meeting-minutes` skill hands them here).
- A default is adopted because the owner said « fais comme tu proposes ».

Write it **without asking**: recording a decision the owner made is part of doing the work. Do not log your own
proposals as decisions until the owner accepts them.

## Entry format (append at the end of the file; never rewrite older entries)

```markdown
## AAAA-MM-JJ — <titre court de la décision>
- **Décision :** <ce qui est décidé, en une ou deux phrases>
- **Raison :** <pourquoi; les faits sur lesquels elle repose, avec leur source>
- **Options écartées :** <option — pourquoi elle a été écartée>
- **Décidé par :** <le propriétaire ou l'associé, par son rôle ou son prénom>
- **Date de révision :** <AAAA-MM-JJ, ou « aucune »>
- **Références :** <compte rendu, dossier, fichier ou page consultée>
```

If the file does not exist, create it with the title `# Registre des décisions` and one line explaining that entries
are appended, newest last.

## Changing a decision

Never edit or delete an old entry. Write a new entry whose first line is
`Remplace la décision du AAAA-MM-JJ « <titre> ».` and add one line at the end of the old entry:
`- **Remplacée le :** AAAA-MM-JJ (voir plus bas)`. That single added line is the only change allowed to an old entry.

## Check before reopening

Before proposing to revisit a question (a price, a tool, a supplier, a policy):
1. Search the root and project logs for the topic (use `document-search` if the logs are long).
2. If it is settled, quote the entry (date and decision) and ask whether something new justifies reopening it:
   a new fact, a cost change, or the review date being reached.
3. Do not reargue a settled question without that new element.

## Rules

- No secrets, ever: no password, key, token or code, even if the decision is about an account.
- No customer identity: refer to a customer by file or dossier number, never by name, phone, e-mail or address.
- Facts in « Raison » follow the evidence rule: sourced (page opened in the session), measured, or marked « hypothèse ».
- Reviewed decisions: when a review date passes, raise it with the owner once, at the start of the next relevant task.
- Close the answer with « En clair : » when you report that a decision was logged.
