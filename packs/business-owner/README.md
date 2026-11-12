# Business-owner pack

A reusable pack that turns a small-business owner's Claude into a careful, capable assistant. The owner is a
non-developer who works in Québec French; this README is for the person who sets the pack up for him (the
« conseiller »). The owner's guide is [`LISEZMOI.md`](LISEZMOI.md). The build contract is [`SPEC.md`](SPEC.md); where
this README and the spec disagree, the spec wins.

The pack holds no organisation's data. Client-specific facts (names, domains, ids, profiles, filled playbooks) never
enter this repository.

## What the owner gets

- **Instructions** ([`instructions/instructions-agent.md`](instructions/instructions-agent.md)): the hard rules (one
  « oui » per phase; sign-ins, keys, payments, terms and legal documents are always the owner's; no secrets or
  customer identity in memory), the evidence gate, gates vs reviews, the « En clair : » ending, and the skill list.
  A short version for claude.ai profile preferences: [`instructions/preferences-profil.md`](instructions/preferences-profil.md).
- **Skills renamed in French** (`pack.json`, `noms-fr.json`), packaged as ZIPs for claude.ai or installed into Claude
  Code.
- **Eight playbooks** ([`playbooks/`](playbooks/)): browser-agent prompts for Claude in Chrome, in English with
  owner-facing parts in Québec French, each ending its phases with an English RAPPORT block that never holds a secret.
- **The « Mise en route » Project** ([`projet-claude-ai/mise-en-route.md`](projet-claude-ai/mise-en-route.md)): the
  order of the playbooks and the « prochaine étape » procedure.
- **The workspace template** (`workspace-template/`): the owner's private « espace de travail » repository, with
  memory files, decision log, project folders, agent roles, hooks and keyless search.

## Layout

```
packs/business-owner/
  SPEC.md                       the build contract
  README.md                     this file (English, for the conseiller)
  LISEZMOI.md                   the owner's guide (Québec French)
  installation-mac-iphone.md    one text to paste on a Mac: tools, workspace, project package, iPhone
  pack.json, noms-fr.json       skills in the pack, their French names and targets
  instructions/
    instructions-agent.md       Project instructions; imported by the workspace CLAUDE.md
    preferences-profil.md       claude.ai profile preferences (≤ 1,500 characters)
  projet-claude-ai/
    mise-en-route.md            the Project's entry document
  playbooks/
    acces-equipe.md             team access, roles, unknown admins, two-factor sign-in
    conformite-quebec.md        Loi 25, photo and review consent, CASL, LPC itinerant merchant, OPC permit (checklist)
    courriel-domaine-dns.md     email-sending provider (Brevo), DKIM and DMARC at the DNS host, API key stored
    protection-site-web.md      bot check (Cloudflare Turnstile Invisible), keys, privacy-policy line
    presence-google.md          GA4, Google Business Profile, Search Console sitemap
    alertes-texto.md            SMS provider (Twilio), number, credentials, CASL notes
    publicite-meta-prospects.md Meta lead ads: app, system user, secrets, draft form, webhook, ads_read, domain TXT
    espace-de-travail.md        the owner's private workspace repo: phone-only or computer path
  workspace-template/           the espace de travail (SPEC §8)
scripts/ (repository root)
  pack-skills.mjs               ZIP builder
  install-pack.mjs              installs the pack's skills with their French names
  validate-pack.mjs             pack validator
```

`workspace-template/CLAUDE.md` imports `@instructions-agent.md`, a copy of `instructions/instructions-agent.md`. Edit
the one in `instructions/`, then copy it into the template, so the two never drift.

## Set up a new owner, in order

1. Build the ZIPs (below).
2. With the owner, set up the claude.ai Project « Mise en route »: `projet-claude-ai/mise-en-route.md`, section 1
   (Project instructions, Project files, skill ZIPs, profile preferences, Claude in Chrome).
3. The owner runs `profil-entreprise` in the Project and adds `profil-entreprise.md` to the Project files.
4. The owner says « prochaine étape » and works through the playbooks. He pastes each RAPPORT in the Project and sends
   it to you.
5. When he wants Claude Code from his phone or computer: `playbooks/espace-de-travail.md`. With a Mac and an iPhone,
   send him instead the one text in [`installation-mac-iphone.md`](installation-mac-iphone.md), filled in: it installs
   the tools with Homebrew, sets up the workspace and, if you prepared one, a private project package for this client,
   then the iPhone (Remote Control and cloud sessions).

## Build the skill ZIPs (claude.ai)

From a clone of this repository:

```
node scripts/pack-skills.mjs --pack business-owner
```

The ZIPs land in `dist/business-owner/zips/` (git-ignored), one per skill, with the French-named folder at the ZIP
root. The owner uploads each one at claude.ai › Customize › Skills; code execution must be on in his settings
([Claude help, skills](https://support.claude.com/en/articles/12512180-using-skills-in-claude), opened 2026-11-11). You
can send him the ZIPs or upload them with him.

## Install the skills (Claude Code)

**Computer target** (the owner's own Claude Code):

```
node scripts/install-pack.mjs --pack business-owner --target computer --dest ~/.claude/skills
```

In PowerShell, write the destination as `"$HOME/.claude/skills"`, which works in Bash too.

**Workspace target** (the owner's private repo, so cloud sessions see the skills):

```
node scripts/install-pack.mjs --pack business-owner --target workspace --dest <workspace repo>/.claude/skills
```

Then commit `.claude/skills` in the owner's repository and push. A cloud session loads the repository's
`.claude/skills/`, `.claude/agents/` and `CLAUDE.md`, and in a single-repository session its `.claude/settings.json`
hooks ([Claude Code, cloud environments](https://code.claude.com/docs/en/cloud-environments), opened 2026-11-11).

Skills without a reviewed French name print under `A NOMMER:`. Resolve them with the `francisation-des-competences`
skill (it proposes names and asks the owner to confirm). If a name is generic, add it to `noms-fr.json` here so the
next owner gets it. Some skills have one target only (`skill-router`: computer; `canvas-design`: workspace;
SPEC §4.1). Re-running the command after an update is safe.

## Create the owner's workspace

Both paths are written out in [`playbooks/espace-de-travail.md`](playbooks/espace-de-travail.md).

- **Phone only:** the owner creates an empty private repository on github.com (with a README, so it isn't empty),
  installs the Claude GitHub App on that repository only, and starts a cloud session; the agent copies
  `workspace-template/`, installs the skills (workspace target), commits and pushes.
- **Computer:** the owner installs Git, Node, the GitHub CLI and Claude Code (he runs the installers); he signs in with
  `gh auth login`; the agent clones this repository, copies the template, installs the skills (both targets), creates
  the private repository with `gh repo create <name> --private --source=. --push`, and the owner turns on Remote
  Control.

**Open risk on the phone-only path.** In Anthropic-hosted cloud sessions, GitHub traffic goes through a proxy that
serves the repositories attached to the session; API requests and archive downloads for another repository get a 403,
« even a public one » (cloud environments page, above). Whether a plain `git clone` of this public repository works
from a session attached only to the owner's repository is unverified. The playbook first tries to attach both
repositories to the session, then tries the clone, and stops with the exact message if it fails. If it does, fill the
repository from your own machine or use the computer path.

## Filling a client-specific playbook

The playbooks here stay generic. For a client:
1. Copy the playbook **outside this repository**: into the owner's Project files, his private workspace, or your own
   client folder.
2. Fill every `[À REMPLIR]` from `profil-entreprise.md` and from what you measured yourself. In the header above the
   first `---`, record how each fact is known (measured in the client's account, read from a provider's screen,
   sourced with a link, or assumed), and what you do after the last RAPPORT. Above the line is for you; the owner
   pastes only what is below it.
3. Ids, domains and account names are fine in the client's copy. Secrets never are, anywhere.
4. Sources were opened on 2026-11-11. Provider screens change: re-open the cited pages before a client run, and keep
   the rule « if the screen doesn't match, stop and describe it ».
5. Before committing anything to this repository, check that no client value leaked in, for example
   `rg -n -i "<client name>|<client domain>|<an id>" packs/business-owner` (must print nothing), plus a scan for long
   digit runs: `rg -n "[0-9]{8,}" packs/business-owner`.

## Verification (SPEC §10)

| Gate | Command | Kind |
| --- | --- | --- |
| Pack matches the spec | `node scripts/validate-pack.mjs` | Self-authored: proves the pack matches SPEC, not that claude.ai accepts it |
| Repository integrity | `node scripts/validate.js`, `node scripts/check-structure.mjs`, `node scripts/build-skill-index.js --check`, plus the rest of `.github/workflows/ci.yml` | Repository checks, run in CI |
| Keyless search | `node workspace-template/outils/recherche.mjs` on a fixture folder returns the expected document first | Self-authored |
| Hooks | each hook script run with a sample stdin payload | Self-authored |
| Instruction lengths | `node -e "for (const f of process.argv.slice(1)) console.log(f, [...require('fs').readFileSync(f,'utf8')].length)" packs/business-owner/instructions/*.md` (≤ 8,000 and ≤ 1,500) | Measured, self-authored limit |
| claude.ai accepts a skill | upload one ZIP at Customize › Skills | **External**, run by the conseiller |
| The workspace works in the cloud | one private repo from the template, then one cloud session that shows the hooks fire, the agents are listed, `profil-entreprise` runs, and the files are pushed | **External**, run by the conseiller |

Only the two external gates show that the pack works for a real owner. The self-authored checks show intent.

## Known assumptions and open items

- **SPEC §8 assumptions, against the docs opened on 2026-11-11** (still to be confirmed by the external gate):
  - Hooks, agents and skills from the repository load in a single-repository cloud session: documented. A thread in a
    Claude Code « project » loads only `CLAUDE.md` and `.claude/rules/` from the repository.
  - Node in cloud sessions: documented (Node 20, 21 and 22; 22 on the path).
  - `SessionEnd` fires in cloud sessions: not stated on the pages opened. Still an assumption.
- **Skills twice in the cloud.** Cloud sessions also load the skills enabled on claude.ai (cloud environments page). An
  owner with both the uploaded ZIPs and `.claude/skills` in his repository may see each skill twice; behaviour
  unverified.
- **Pages that could not be opened** (HTTP 403, not worked around): Légis Québec (the private-sector privacy act), the
  CRTC's CASL pages, Brevo's help centre. So the Québec law is cited through the CAI's pages without article numbers,
  CASL through ISED and the Justice Laws website, and Brevo's current DKIM form (TXT or two CNAMEs) is « à vérifier »:
  the email playbook copies whatever Brevo's screen shows.
- **Provider details left « à vérifier »** in the playbooks: the Twilio number registration for the chosen country;
  whether a Meta system-user token or a Twilio API key secret shows only once (treated as once); the Meta Instant Form
  editor, Leads Access Manager and Lead Ads Testing Tool screens; whether Instant Forms require a privacy-policy link;
  the address of Cloudflare's Turnstile Privacy Addendum; the contract and cancellation pages of the OPC.
- **`ads_read` for ad figures** comes from SPEC §7, not from a page opened here.
- **Approval model.** The playbooks ask one « oui » per phase, after listing every change in that phase (SPEC §2.1).
  The client prompts the spec was modelled on asked one « oui » per action. The spec wins; a conseiller who wants
  per-action approval for a risky client can say so in the client copy.
- **Profile preferences** are written in French, in the owner's voice, because he pastes them as his own. claude.ai's
  own length limit for that field was not checked; the file stays under the spec's 1,500 characters.
