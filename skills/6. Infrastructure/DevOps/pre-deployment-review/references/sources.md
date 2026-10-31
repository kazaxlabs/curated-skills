# Sources ledger

Every rule in `rules/*.json` cites one or more of these. Tier per AGENTS.md §2:
standards body > primary vendor > industry educator > practitioner. A rule with
severity `block` must rest on a standards or vendor source fetched with HTTP 200, or
state a durable principle. Re-fetch before citing in a new session; dates drift.

| Tier | Source | URL | Fetched | Status | Used for |
| :--- | :--- | :--- | :--- | :--- | :--- |
| standards | OWASP HTTP Headers Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html | 2026-10-27 | 200 | header values (HSTS 63072000, nosniff, frame-ancestors, Referrer-Policy, Permissions-Policy, remove Server/X-Powered-By) |
| standards | OWASP Secrets Management Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html | 2026-10-27 | 200 | secrets out of source (§8.1, §9.2), short-lived CI credentials (§3.2.2, §3.3), no Docker ENV/ARG secrets (§5.1), rotation (§2.7.2) |
| standards | NIST SP 800-218 SSDF v1.1 landing page | https://csrc.nist.gov/pubs/sp/800/218/final | 2026-10-27 | 200 | existence and title only; practice ids PS.1–PS.3, PW.9 are **model-prior** (page showed abstract, not practices) |
| standards | OpenSSF Scorecard checks | https://github.com/ossf/scorecard/blob/main/docs/checks.md | 2026-10-27 | 200 | Branch-Protection, Pinned-Dependencies, Token-Permissions, Dangerous-Workflow, CI-Tests, SAST, Vulnerabilities |
| vendor | Firebase launch checklist | https://firebase.google.com/support/guides/launch-checklist | 2026-10-27 | 200 | rules, emulator testing, App Check, separate projects, budget alerts, API key restriction, auth providers |
| vendor | Firebase manage functions | https://firebase.google.com/docs/functions/manage-functions | 2026-10-27 | 200 | runtime set via firebase.json or engines; firebase.json wins |
| vendor | Cloud Run functions runtime support | https://docs.cloud.google.com/functions/docs/runtime-support | 2026-10-27 | 200 (301 from cloud.google.com) | Node runtime deprecation/decommission dates |
| vendor | Firebase Hosting GitHub integration | https://firebase.google.com/docs/hosting/github-integration | 2026-10-27 | 200 | `firebase init hosting:github` stores a JSON key secret (why the skill rejects that path) |
| vendor | google-github-actions/auth README | https://github.com/google-github-actions/auth | 2026-10-27 | 200 | v3, `workload_identity_provider`, `service_account`, `id-token: write`, pool/provider commands, `roles/iam.workloadIdentityUser` |
| vendor | GitHub — Security hardening for GitHub Actions | https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions | 2026-10-27 | 200 | SHA pinning, least-privilege GITHUB_TOKEN, OIDC, pull_request_target risk |
| vendor | Next.js production checklist | https://nextjs.org/docs/app/guides/production-checklist | 2026-10-27 | 200 | env files ignored, NEXT_PUBLIC_ only for public values, Server Action auth, CSP, error pages, robots |
| vendor | Django deployment checklist | https://docs.djangoproject.com/en/stable/howto/deployment/checklist/ | 2026-10-27 | 200 | `manage.py check --deploy`, SECRET_KEY from env, DEBUG False, ALLOWED_HOSTS, secure cookies |

## Contradictions recorded

- **Node 20 status.** Firebase manage-functions (fetched 2026-10-27) lists Node 20 as
  supported; the Cloud Run functions runtime-support table (last updated 2026-10-26)
  lists Node 20 deprecated since 2026-04-30 and decommissioned 2026-10-30. Ruling: the
  dated table wins; `firebase.functions.runtime-not-decommissioned` treats 20 as
  failing. Re-fetch before relying on it.
- **Attribute condition scope.** The google-github-actions/auth README example
  restricts the OIDC provider by `repository_owner`; this skill's reference restricts by
  `repository`. Ruling: tighter scope, stated in the report when used.

## Refresh procedure

1. Re-fetch every URL above; update `Fetched` and `Status`.
2. For each changed page, diff the extracted items against the rules that cite it.
3. Edit rules, run `node scripts/test.mjs`, record the delta in this file's history.
4. Rules whose source no longer resolves drop to `unverified` and lose `block`
   severity until re-sourced.
