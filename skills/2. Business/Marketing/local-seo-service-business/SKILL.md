---
name: local-seo-service-business
description: "Local search plan and audit for a service business that serves customers in a defined area: Google Business Profile completeness, review requests to real customers with their consent, service-area pages with real local content, and name-address-phone consistency across directories. Every factual claim about ranking or platform rules is cited from a page opened in the session. Use to plan, audit or improve a local business's visibility in local search and maps."
metadata:
  source: "business-owner pack, self-authored (2026-11)"
  pack: business-owner
---

# Local SEO for a service business

For a business that goes to its customers (contractors, cleaners, movers, technicians) or receives them locally,
most new demand starts with a local search. This skill plans the work and checks it. It does not promise rankings.

## Hard rules

- **The owner signs in.** Google Business Profile, Search Console, directories and review platforms are the owner's
  accounts. He signs in, verifies the business (postcard, call, video) and accepts terms. You may prepare text, fill
  non-sensitive fields he asks you to fill, and tell him where to click; you never type passwords or codes.
- **Real reviews only.** Ask only real customers, after a real job. Never write, buy, swap or gate reviews, and never
  post a review on someone's behalf. Publishing a customer's review or photo on the website needs his written consent.
- **No customer identity** in files or replies: refer to jobs by dossier number. Review replies never reveal a
  customer's details or the job's private details.
- **Evidence:** platform rules and ranking factors change. Before you state one (what a policy allows, what affects
  ranking), open the current official page in this session and cite it. Otherwise label it « hypothèse ». The
  primary sources are the Google Business Profile Help Center (its guidelines for representing a business), Google
  Search Central (its spam policies and local-business documentation) and the Search Console Help Center. Find the
  current page by search; do not cite from memory.
- Read `profil-entreprise.md` first: services, area served and compliance limits (section 11) bound every page and
  every reply.

## Workflow

### 1. Baseline (audit)

Ask the owner for: the profile link or a screenshot of it, the website address, the list of directories he knows he
is in, and the towns he wants to serve. Then fill this checklist, marking each line `ok`, `à corriger` or `inconnu`:

| Element | What to check |
| --- | --- |
| Business name | Same name the business uses on its sign, invoices and website; nothing added |
| Primary category | The category that matches the main service; secondary categories for other real services |
| Service area | Towns or regions actually served; address hidden if customers are not received there |
| Contact | One main phone number and the website, identical everywhere |
| Hours | Real hours, holiday hours updated |
| Services | Each real service listed, with a short plain description |
| Description | What the business does, where, for whom; no claims the owner cannot prove |
| Photos | Real photos of real work, with the customer's written consent when the property is recognisable |
| Reviews | Count, recent activity, replies to each review |
| Questions and posts | Recent, useful, consistent with the website |

### 2. Name, address, phone consistency (citations)

Build one table of every listing found (directories, associations, suppliers' "find a contractor" pages, social
profiles): source, name as listed, address as listed, phone as listed, website, status. The canonical values come from
`profil-entreprise.md`. Each mismatch becomes a correction task for the owner (he signs in to fix it).

### 3. Review requests

- Timing: when the job is accepted and the customer is satisfied.
- Channel: the one the customer already uses with the business (SMS or e-mail), sent by the owner or his system.
  Commercial electronic messages in Canada fall under the anti-spam law (CASL). Before automating review requests,
  open the official CASL guidance and check which consent covers a message to a recent customer; until then, send
  them one by one at the owner's request.
- Draft two short templates in the owner's voice (one SMS, one e-mail) with the direct review link, no incentive, and
  no wording that asks only happy customers to review.
- Replies: a template for positive reviews and one for negative reviews (thank, acknowledge, move the details to a
  private channel, no customer details, no argument).

### 4. Service-area pages

One page per area only when there is something specific and true to say: jobs done there (by dossier, with consent
for photos), local conditions that change the work, travel or scheduling particulars. Pages that only swap the town
name are thin and risky; check the current spam policy before creating many. Each page: the service, the area, real
proof, a clear call to action, and consistent contact details. Hand the drafting to the copywriting skill and the
compliance check to section 11 of the profile.

### 5. Measure

Use what the owner's own accounts show (profile performance, Search Console for the website, calls and form requests
received). State the period and N with every number. Compare like periods; do not attribute a change to one action
without evidence.

## Output

Save (Claude Code) `projets/<nom>/livrables/referencement-local.md`, or deliver it in claude.ai, with:
1. the baseline checklist;
2. the citation table;
3. a prioritised action list (owner tasks and agent tasks separated; each with an estimated effort only if the owner
   gives one);
4. the review-request and reply templates;
5. a list of the official pages opened, with their URLs, and the claims that remain « hypothèse ».

End the answer with « En clair : » and two to four plain sentences.

## Related skills

`seo-plan` (its local-service template covers site architecture), `copywriting` for page text, `evidence-gate` for
claims, `social-proof-architect` for placing reviews on the site.
