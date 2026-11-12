<!-- Repaired for the business-owner pack, 2026-11; self-authored, not upstream. -->
# Sales Automator Implementation Playbook

Templates for the focus areas and outputs in `SKILL.md`. Brackets are placeholders. No reply rate, open rate or
conversion rate here is a benchmark; measure the business's own.

## 0. Before writing any outreach

- [ ] Who is the recipient (role, type of business or household) and why would this message matter to them now?
- [ ] What is the one action asked (reply, call, book a visit, accept a quote)?
- [ ] What proof can be cited truthfully (real work, real reviews with consent, verifiable credentials)?
- [ ] Consent: commercial electronic messages in Canada are subject to the anti-spam law (CASL). Check, on the official
      guidance opened at the time, that the business has the consent required for this recipient, and include the
      sender identification and an unsubscribe mechanism the law requires. When in doubt, do not send.
- [ ] Read the compliance limits in `profil-entreprise.md` (section 11) if the workspace has one.

## 1. Follow-up sequence after a quote (3 to 5 touches)

| Touch | When (relative) | Goal | Content |
| --- | --- | --- | --- |
| 1 | when the quote is sent | make it easy to say yes | summary of scope, price, validity date, one clear next step |
| 2 | [ ] days later | answer doubts | the most common question about this kind of job, answered |
| 3 | [ ] days later | proof | one relevant completed job (dossier number, photos with consent) |
| 4 | before the validity date | decision | reminder of the date, offer a short call |
| 5 | after the validity date | close the loop | ask whether to close the file or update the quote |

Template (e-mail):

```
Subject: [project type] — your quote [number]

Hello [first name],

[One sentence tying back to their situation, in their words.]
[One sentence on what the quote covers and the next step.]

[Single call to action: reply, call [phone], or book [link].]

[Signature: name, business, phone]
[Sender identification and unsubscribe line as required]
```

## 2. Personalisation variables

| Variable | Where it comes from | Fallback if missing |
| --- | --- | --- |
| [first name] | CRM | "Hello," |
| [project type] | quote | "your project" |
| [their words about the problem] | intake notes | omit the sentence |
| [relevant past job] | dossier with consent | omit the proof line |

Never fabricate a personal detail to make a message look personal.

## 3. Proposal and quote template

```markdown
# Proposal — [project] — [dossier number] — [date]
## Your situation        [what the customer described, in their words]
## What we propose       [scope, method, materials]
## What is not included  [ ]
## Schedule              [start window, duration, conditions]
## Price                 [amount, taxes, what can change it] — valid until [date]
## Why us                [two or three verifiable points]
## Next step             [how to accept]
```

Financing, guarantees, subsidies or savings may only be mentioned with the exact wording allowed in the profile's
compliance limits.

## 4. Case study template

```markdown
# [Project type] in [area] — [dossier number]
- Situation before: [facts, measurements if taken]
- What we did: [ ]
- Result: [what changed; measured values only, with how they were measured]
- Customer's words: ["quote"] (written consent on file: yes/no — publish only if yes)
```

## 5. Call script with objection handling

```
Opening:  [who you are, why you are calling, permission to continue]
Discovery: [3 to 5 questions about their situation and timing]
Fit:      [summarise their need; say whether and how the business can help]
Next step: [visit, quote, or a clear no]

Objection: "[price]"      → [acknowledge] + [what the price covers] + [option, if any]
Objection: "[timing]"     → [acknowledge] + [what waiting changes, factually] + [next step]
Objection: "[trust]"      → [verifiable proof: licence, real reviews, past jobs]
```

## 6. Subject line testing

Write two to three subject lines that differ in one dimension only (benefit vs. question vs. specificity). Decide the
sample size and the success measure before sending; report results with N.

## 7. Tracking

| Metric | Definition | Source |
| --- | --- | --- |
| Reply rate | replies / messages delivered | e-mail tool |
| Quote acceptance | accepted / quotes sent, same period | CRM |
| Time to decision | days from quote to acceptance or loss | CRM |
| Unsubscribes and complaints | count per send | e-mail tool |
