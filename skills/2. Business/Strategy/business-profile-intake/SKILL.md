---
name: business-profile-intake
description: "Interviews a small-business owner once per business, project or folder and writes profil-entreprise.md: services, area served, customers, offers and price ranges, voice, compliance limits, and accounts held (names only). Also writes the product-marketing-context file that marketing skills read. Use at setup, when a workspace or new project folder has no profile, when the owner asks to create or update the business profile, or when the business changes."
metadata:
  source: "business-owner pack, self-authored (2026-11)"
  pack: business-owner
---

# Business profile intake

Build the one file every other task reads first: `profil-entreprise.md`. It holds what the business is, who it
serves, how it talks, and what it must never say. Ask once, write it down, and stop asking the owner the same things.

## Hard rules

- **Never secrets.** The profile lists accounts by service name and purpose only. Never ask for, write, or repeat a
  password, key, token, two-factor or recovery code, login e-mail, or account number. If the owner pastes one, do not
  copy it into any file; tell him to change it and store it in his secret store.
- **Never customer identity.** No customer names, phone numbers, e-mails or street addresses. Describe customers as
  types ("propriétaires de maisons unifamiliales"), and refer to a specific customer only by file or dossier number.
- **No invented facts.** Prices, dates, licence numbers, certifications and claims come from the owner or from a page
  opened in this session. Anything drafted from the website or documents is marked `(à confirmer)` until the owner
  confirms it.
- **Compliance limits are the owner's statements**, not legal advice. When a limit sounds like a legal question, write
  it under « Questions ouvertes » for a professional.
- Reading the owner's website and documents needs no approval. Writing the profile is part of the task the owner asked
  for.

## When it runs

- The owner asks for it (« fais mon profil d'entreprise », « mets à jour le profil »).
- Automatically, when work starts in a workspace or a project folder that has no `profil-entreprise.md`.
- When the business changes: a new service, a new territory, new prices, a new account.

## Where the file goes

| Environment | Business profile | Project profile (optional) |
| --- | --- | --- |
| Claude Code (workspace or computer) | `profil-entreprise.md` at the workspace root | `projets/<nom>/profil-entreprise.md`, holding only what differs from the root profile |
| claude.ai | Deliver the finished file in the conversation (a downloadable Markdown file or one code block) and tell the owner to add it to the Project files. Do not claim it is saved. | Same, named `profil-entreprise-<nom>.md` |

A project profile starts with `Voir aussi : ../../profil-entreprise.md` and repeats nothing from it.

## Interview

1. **Look before asking.** If there is a website, existing documents or an older profile, read them and draft what
   you can, marked `(à confirmer)`. Offer the owner the choice: review a draft, or answer from scratch.
2. **One section at a time**, in the owner's language (Québec French by default), short questions, examples of good
   answers. Do not dump every question at once.
3. **Push for the customers' own words.** The phrases customers use are worth more than polished descriptions.
4. **Confirm each section** in two or three lines before moving on. Skip what does not apply.
5. **Ranges, not promises.** For prices, ask for ranges and what moves a job up or down the range. Record who gave the
   figure and when.
6. **Write the file**, show it, ask « Qu'est-ce qui manque ou qu'est-ce qui est inexact ? », and correct it.

## Template (`profil-entreprise.md`)

The headings are in French because the owner reads this file. Keep them exactly: other skills refer to its sections
by number and title (for example section 11, the compliance limits).

```markdown
# Profil d'entreprise

_Dernière mise à jour : AAAA-MM-JJ — Portée : entreprise_

## 1. Identité
- Nom utilisé auprès du public :
- Secteur d'activité :
- Licences et numéros publics (ex. licence d'entrepreneur) :
- Langue(s) de service :
- Site web :

## 2. Services offerts
- Service : ce qu'il comprend, ce qu'il ne comprend pas

## 3. Territoire desservi
- Villes ou régions :
- Limites (distance, types de bâtiments, saisons) :

## 4. Clientèle
- Types de clients (jamais de noms) :
- Problèmes qui les amènent :
- Déclencheurs d'achat :
- Clients qui ne conviennent pas :

## 5. Offres et fourchettes de prix
| Offre | Fourchette | Ce qui fait varier le prix | Source et date |
| --- | --- | --- | --- |

## 6. Concurrence et différenciation
- Concurrents directs (même solution) :
- Autres solutions (faire soi-même, ne rien faire) :
- Ce qui nous distingue, avec preuve :

## 7. Objections fréquentes
| Objection | Réponse |
| --- | --- |

## 8. Vocabulaire des clients
- Comment ils décrivent le problème (citations) :
- Mots à utiliser :
- Mots à éviter :

## 9. Ton et voix
- Ton :
- Tutoiement ou vouvoiement :
- Trois adjectifs :

## 10. Preuves
- Réalisations (photos réelles, avec consentement écrit) :
- Avis réels (avec consentement écrit pour réutilisation) :
- Certifications et garanties vérifiables :

## 11. Limites de conformité
| Sujet | Formulation permise | Formulation interdite |
| --- | --- | --- |

## 12. Objectifs
- Objectif principal :
- Action attendue du visiteur (appel, formulaire, visite) :

## 13. Comptes détenus (noms seulement)
Jamais de mot de passe, de clé, de jeton, de code ni d'identifiant de connexion dans ce fichier.

| Service | Usage | Administré par |
| --- | --- | --- |

## 14. Questions ouvertes
- 
```

## The marketing-context file (Claude Code only)

Several marketing skills (`product-marketing-context`, `content-strategy`, `revops`, `sales-enablement`,
`ad-creative`, `lead-magnets`) read `.agents/product-marketing-context.md` before asking questions. After writing or
updating the root profile, write that file at the workspace root from the profile, with the exact structure
`product-marketing-context` uses. Content stays in the owner's language; the headings stay as below.

```markdown
# Product Marketing Context

*Last updated: AAAA-MM-JJ — generated from profil-entreprise.md by business-profile-intake. Edit the profile, then rerun the intake; do not edit this file by hand.*

## Product Overview
**One-liner:**            <- §1 and §2
**What it does:**         <- §2
**Product category:**     <- §1 secteur
**Product type:**         service
**Business model:**       <- §5

## Target Audience        <- §3 and §4
## Personas               <- §4 (skip for residential customers)
## Problems & Pain Points <- §4
## Competitive Landscape  <- §6
## Differentiation        <- §6
## Objections             <- §7
## Switching Dynamics     <- §4 déclencheurs, §7
## Customer Language      <- §8
## Brand Voice            <- §9
## Proof Points           <- §10
## Goals                  <- §12
```

Drop the `<- §n` pointers when you fill the file. Never copy §13 (accounts) or §11 (compliance) into it; marketing
skills must still read `profil-entreprise.md` §11 before writing copy.

In claude.ai there is no `.agents/` folder: the profile in the Project files is the context. If a marketing skill asks
for its context file, point it to `profil-entreprise.md`.

## Done when

- `profil-entreprise.md` exists (or was delivered in claude.ai) with every section filled or marked « sans objet ».
- Every figure has its source and date; every drafted value is confirmed or still marked `(à confirmer)`.
- In Claude Code, `.agents/product-marketing-context.md` matches the profile.
- No secret and no customer identity anywhere in either file.
- The answer ends with « En clair : » and two to four plain sentences saying what was written and where.
