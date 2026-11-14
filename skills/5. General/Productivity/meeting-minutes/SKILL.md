---
name: meeting-minutes
description: "Turns a meeting transcript or rough notes into a meeting report (compte rendu): topics discussed, decisions, and actions with an owner and a due date. Decisions also go to the decision log; customers are referred to by file number only. Use after a meeting, a call, a site visit or a partners' discussion, or when the owner pastes notes or a transcript and asks for a summary."
metadata:
  source: "business-owner pack, self-authored (2026-11)"
  pack: business-owner
---

# Meeting minutes

A meeting report (compte rendu) keeps what was discussed, what was decided and who does what by when. It is not a
transcript and not a formal procès-verbal: a procès-verbal of a board or shareholders' meeting is a legal document,
which stays the owner's job with his advisers.

## Input

A transcript, the owner's notes, a voice-note summary, or his account of the meeting in the chat. If key facts are
missing (date, who attended, what was decided), ask once, in one short list; otherwise write « à confirmer ».

## Steps

1. **Separate** what was discussed from what was decided and from what someone will do. Only a clear agreement is a
   decision; a suggestion nobody accepted is a discussion point.
2. **Actions:** each one gets a verb, one responsible person (role or first name of a team member) and a due date.
   Never invent an owner or a date: write « à confirmer ».
3. **Customers and third parties:** no names, phone numbers, e-mails or addresses in the report. Use the file or dossier
   number (« dossier 2026-014 »). If the transcript contains such details, leave them out.
4. **Numbers:** keep amounts, quantities and dates exactly as said, and mark the ones that were estimates.
5. **Decisions** are also appended to the decision log (`decision-log` skill), one entry each, with this report as
   the reference.
6. **Write the report** with the template below and save it (Claude Code) as
   `projets/<nom>/notes/AAAA-MM-JJ-compte-rendu-<sujet>.md`, or `notes/AAAA-MM-JJ-compte-rendu-<sujet>.md` when there is no
   project. In claude.ai, deliver it in the conversation for the owner to keep.
7. **Do not send it.** Sharing the report with anyone outside the workspace is the owner's call; offer a short e-mail
   version if he wants one.

## Template

```markdown
# Compte rendu — <sujet> — AAAA-MM-JJ

**Participants :** <rôles ou prénoms des membres de l'équipe; tiers par organisation; clients par numéro de dossier>
**Objet :** <une phrase>

## Points discutés
- <sujet> : <l'essentiel en une ou deux phrases>

## Décisions
- <décision> (consignée au registre des décisions)

## Actions
| Action | Responsable | Échéance | État |
| --- | --- | --- | --- |
| <verbe + objet> | <rôle ou prénom> | <AAAA-MM-JJ ou « à confirmer »> | à faire |

## Questions ouvertes
- <question> — qui doit y répondre

## Prochaine rencontre
- <date, ou « à fixer »>
```

## Quality checks before delivering

- Every decision appears in the decision log.
- Every action has a responsible person and a due date, or « à confirmer ».
- No customer identity, no secret, no account credential anywhere in the report.
- Nothing appears that was not in the input. When the input was ambiguous, say so under « Questions ouvertes ».
- End the answer with « En clair : » and two to four plain sentences.
