# Firebase / GCP reference for `pre-deployment-review`

Command lists for the Firebase + Google Cloud flavour of the workflow. Section numbers
match the steps in `SKILL.md`. Every command here is read-only unless the section says
**Change-tier**; Change-tier commands are shown so the report can quote them, not so the
agent runs them.

Sources fetched 2026-10-27 (HTTP 200 unless noted):

- `https://github.com/google-github-actions/auth` — v3 usage, inputs, pool/provider commands.
- `https://firebase.google.com/docs/functions/manage-functions` — runtime setting via
  `firebase.json` / `package.json engines`.
- `https://docs.cloud.google.com/functions/docs/runtime-support` — runtime table (the
  `cloud.google.com/...` URL returns 301 to this one).
- `https://firebase.google.com/docs/hosting/github-integration` — preview-channel
  behaviour of the official hosting action.

Re-fetch these in every session before citing them. Dates below are what the pages said
on the fetch date and will drift.

---

## §2 Reconcile docs with the live target (read-only)

```bash
# Who am I, which project is active
firebase login:list
gcloud auth list
gcloud config list

# Real projects vs config
firebase projects:list
gcloud projects list --format="table(projectId,name,projectNumber,lifecycleState)"
cat .firebaserc
grep -n '"projectId"\|projectId' .env.example firebase.json 2>/dev/null

# Inventory, one line each, tag measured
gcloud services list --enabled --project "$P" --format="value(config.name)"
gcloud billing projects describe "$P"
gcloud firestore databases list --project "$P"
firebase apps:list --project "$P"
firebase hosting:sites:list --project "$P"
firebase hosting:channel:list --project "$P"
gcloud projects get-iam-policy "$P" --format=json
gcloud secrets list --project "$P" --format="value(name)"      # names only
gcloud storage buckets list --project "$P" --format="value(name,location)"
gcloud functions list --project "$P" --format="table(name,state,environment,buildConfig.runtime,serviceConfig.uri)"
```

Auth providers and authorized domains have no complete CLI listing; record them from
the console as `review` and say so.

**Change-tier (quote in the report, do not run):**

```bash
gcloud services enable firestore.googleapis.com cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com \
  secretmanager.googleapis.com --project "$P"
gcloud firestore databases create --database='(default)' --location="$REGION" --type=firestore-native --project "$P"
```

The database location is permanent. The report must show the region and wait for a go.

---

## §3 Auth and authorization — files to open

| Concern | Typical location |
| :--- | :--- |
| Firestore / Storage rules | `firestore.rules`, `storage.rules` |
| Server auth middleware | `functions/src/middleware/auth.ts` or similar |
| Client auth service | `src/services/auth.ts`, `src/lib/firebase.ts` |
| Role / permission contract | `shared/permissions.ts` or a generated types file |
| CORS, trust proxy, body limit | the Express/Hono app factory in `functions/src` |

Rules checklist in Firebase terms:

- `match /{document=**} { allow read, write: if false; }` present as the last block.
- Allowlist reads use `exists(/databases/$(database)/documents/allowlist/$(request.auth.uid))`
  or an equivalent, never `request.auth != null` alone on admin paths.
- Write-once: `allow create: if ...; allow update, delete: if false;`.
- Callable/HTTP functions verify the ID token server-side; `context.auth` or
  `admin.auth().verifyIdToken` on every admin route.
- Rate limiting in a Cloud Function instance is per-instance under autoscaling; say so.

---

## §4 Credential and placeholder sweep

```bash
grep -rnE "\.local\b|example\.com|555-?[0-9]{3}-?[0-9]{4}|demo-project|local-salt|not-a-secret|apiKey:\s*['\"]demo|changeme|TODO: replace" \
  --include='*.ts' --include='*.tsx' --include='*.js' --include='*.json' --include='*.env*' --include='*.md' \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git .

# Tracked files that should never be tracked
git ls-files | grep -iE '\.env($|\.)|service-?account|credentials?\.json|firebase-adminsdk|\.pem$|\.p12$|emulator.*export'

# History check for a suspicious name (replace NAME)
git log -p -S'NAME' --all -- . | head -50
```

`.gitignore` must cover at least: `.env`, `.env.*`, `!.env.example`, `*-adminsdk-*.json`,
`service-account*.json`, `firebase-export*/`, `.firebase/`, `*.pem`, `*.p12`, and the
generated-password file path from §5.

---

## §5 Founder account provisioning script (Change-tier against production)

Shape of the script, Admin SDK with ADC. Save under `scripts/provision-founder.ts` (or
the project's scripts folder).

```ts
// Refuses key files; uses Application Default Credentials only.
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Refusing to run with a key file. Unset GOOGLE_APPLICATION_CREDENTIALS and use `gcloud auth application-default login`.');
  process.exit(2);
}
const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT;
if (!projectId || /demo-/.test(projectId)) { console.error('Set GCLOUD_PROJECT to the real project id.'); process.exit(2); }
const email = process.env.FOUNDER_EMAIL;
if (!email) { console.error('Set FOUNDER_EMAIL.'); process.exit(2); }

// 1. getUserByEmail → createUser on not-found (idempotent)
// 2. set custom claims { role: 'owner' } (idempotent)
// 3. allowlist doc: db.doc(`allowlist/${uid}`).set({ email, role: 'owner', updatedAt }, { merge: true })
// 4. if a password was generated: write to `.local/founder-credentials.txt` (git-ignored), print only the path
// 5. read back: getUser(uid) and allowlist doc .exists → exit 1 if either is missing
```

Local run against the emulator is the gate for the script:

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
GCLOUD_PROJECT=demo-local FOUNDER_EMAIL=founder@example.test npx tsx scripts/provision-founder.ts
```

(The demo-id refusal must be bypassable only when an emulator host variable is set.)

Production run, quoted in the report under blockers:

```bash
gcloud auth application-default login
GCLOUD_PROJECT=<real-project-id> FOUNDER_EMAIL=<real email> npx tsx scripts/provision-founder.ts
```

---

## §6 Deploy configuration

Security headers in `firebase.json` → `hosting.headers`:

```json
{ "source": "**", "headers": [
  { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
  { "key": "X-Content-Type-Options", "value": "nosniff" },
  { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
  { "key": "X-Frame-Options", "value": "DENY" },
  { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
]},
{ "source": "/admin/**", "headers": [
  { "key": "Content-Security-Policy", "value": "default-src 'self'; frame-ancestors 'none'; ..." },
  { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
]}
```

Deploy guard (shape; name it `scripts/deploy-guard.sh` or similar):

```bash
set -euo pipefail
P=$(node -p "require('./.firebaserc').projects.default")
case "$P" in demo-*|*-demo|"") echo "Refusing: project id '$P' is a demo/empty id"; exit 1;; esac
[ -z "$(git status --porcelain)" ] || { echo "Refusing: dirty tree"; exit 1; }
git fetch -q origin && [ "$(git rev-parse HEAD)" = "$(git rev-parse @{u})" ] || { echo "Refusing: branch not pushed"; exit 1; }
for v in VITE_FIREBASE_API_KEY VITE_FIREBASE_AUTH_DOMAIN; do [ -n "${!v:-}" ] || { echo "Refusing: $v unset"; exit 1; }; done
```

Runtime check. Fetch `https://docs.cloud.google.com/functions/docs/runtime-support`
in-session and compare with `functions/package.json` `engines.node` and
`firebase.json` `functions.runtime` (when both are set, `firebase.json` wins, per the
manage-functions page).

**Contradiction recorded 2026-10-27:** the Firebase manage-functions page listed Node 22
and 20 as supported and 18 as deprecated; the GCP runtime-support page (last updated
2026-10-26) listed Node 20 as deprecated since 2026-04-30 with decommission on
2026-10-30, Node 22 supported until 2027-04-30, Node 24 supported until 2028-04-30, and
Node 26 in preview. Ruling: the dated runtime-support table wins. Do not hard-code this;
re-fetch and record the status you observed.

---

## §7 CI/CD plan

Workload Identity Federation setup, from the google-github-actions/auth README (v3).
All **Change-tier**; quote in the report.

```bash
gcloud iam workload-identity-pools create "github" --project="$P" --location="global" --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "my-repo" \
  --project="$P" --location="global" --workload-identity-pool="github" \
  --display-name="GitHub repo provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository == '${GITHUB_ORG}/${GITHUB_REPO}'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Deployer service account, least privilege (adjust roles to what the deploy actually touches)
gcloud iam service-accounts create github-deployer --project="$P"
for r in roles/firebasehosting.admin roles/cloudfunctions.developer roles/run.admin roles/iam.serviceAccountUser roles/firebaserules.admin; do
  gcloud projects add-iam-policy-binding "$P" --member="serviceAccount:github-deployer@$P.iam.gserviceaccount.com" --role="$r"
done

# Let the repo's OIDC identity impersonate it
gcloud iam service-accounts add-iam-policy-binding "github-deployer@$P.iam.gserviceaccount.com" \
  --project="$P" --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"
```

The README's own example conditions on `repository_owner`; the skill tightens it to the
single repository. Say which one you used.

Workflow skeleton (pin every action to a tag or SHA):

```yaml
name: deploy
on:
  pull_request:
  push: { branches: [main] }
permissions:
  contents: read
  id-token: write
  pull-requests: write
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci && npm run typecheck && npm run lint && npm test && npm run build
  preview:
    if: github.event_name == 'pull_request'
    needs: check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: google-github-actions/auth@v3
        with:
          workload_identity_provider: projects/${{ vars.PROJECT_NUMBER }}/locations/global/workloadIdentityPools/github/providers/my-repo
          service_account: github-deployer@${{ vars.PROJECT_ID }}.iam.gserviceaccount.com
      - run: npx firebase-tools hosting:channel:deploy pr-${{ github.event.number }} --expires 7d --project ${{ vars.PROJECT_ID }}
  production:
    if: github.ref == 'refs/heads/main'
    needs: check
    environment: production        # required reviewers configured in GitHub
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: google-github-actions/auth@v3
        with:
          workload_identity_provider: projects/${{ vars.PROJECT_NUMBER }}/locations/global/workloadIdentityPools/github/providers/my-repo
          service_account: github-deployer@${{ vars.PROJECT_ID }}.iam.gserviceaccount.com
      - run: npx firebase-tools deploy --only hosting,functions,firestore:rules --project ${{ vars.PROJECT_ID }}
```

Note: `firebase init hosting:github` generates workflows that store a service-account
JSON key as a GitHub secret (per the hosting github-integration page). Do not use that
path; it violates the no-key-file rule.

Branch protection on `main` (quote; Change-tier, and it is outward-facing):

```bash
gh api -X PUT repos/$OWNER/$REPO/branches/main/protection --input - <<'JSON'
{"required_status_checks":{"strict":true,"contexts":["check"]},
 "enforce_admins":true,"required_pull_request_reviews":{"required_approving_review_count":1},
 "restrictions":null,"allow_force_pushes":false,"allow_deletions":false}
JSON
```

Rollback path (quote in the report):

```bash
firebase hosting:rollback --project "$P"                    # interactive pick of previous release
firebase hosting:releases:list --project "$P"
git checkout <previous-good-sha> && npx firebase-tools deploy --only functions --project "$P"
```

---

## §9 Gates on the emulator

```bash
firebase emulators:exec --only firestore,auth,storage --project demo-local "npm run test:rules"
firebase emulators:exec --only firestore,auth,functions --project demo-local "npm run test:e2e"
```

Rules tests use `@firebase/rules-unit-testing`; declare whether they were written this
session.

---

## Change-tier summary (all wait for an explicit go)

| Action | Why it waits |
| :--- | :--- |
| `gcloud services enable …` | billable, enables attack surface |
| `gcloud firestore databases create …` | region is permanent |
| Founder provisioning against production | creates an account with owner role |
| WIF pool/provider/SA/IAM bindings | changes who can deploy |
| Branch protection | outward-facing repository policy |
| `firebase deploy …` | production change |
| `git push` | outward-facing |
