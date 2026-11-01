#!/usr/bin/env node
// make-fixtures.mjs — regenerates tests/fixtures/* deterministically. Run: node tests/make-fixtures.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const F = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const w = (rel, content) => { const p = path.join(F, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n'); };
const ok = 'node -e "process.exit(0)"';
fs.rmSync(F, { recursive: true, force: true });

// ---------- firebase-react-pass ----------
w('firebase-react-pass/package.json', { name: 'fx-firebase-react', private: true, engines: { node: '22' }, scripts: { typecheck: ok, lint: ok, test: ok, build: ok, 'test:rules': ok }, dependencies: { react: '^19.0.0', firebase: '^11.0.0' }, devDependencies: { typescript: '^5.6.0', vite: '^6.0.0', vitest: '^2.0.0', '@firebase/rules-unit-testing': '^4.0.0' } });
w('firebase-react-pass/package-lock.json', { name: 'fx-firebase-react', lockfileVersion: 3, packages: {} });
w('firebase-react-pass/functions/package.json', { name: 'functions', engines: { node: '22' }, dependencies: { 'firebase-admin': '^13.0.0', 'firebase-functions': '^6.0.0', express: '^4.21.0' } });
w('firebase-react-pass/.gitignore', '.env\n.env.*\n!.env.example\n*-adminsdk-*.json\nservice-account*.json\n.firebase/\nfirebase-export*/\n.local/\n');
w('firebase-react-pass/.env.example', 'VITE_FIREBASE_API_KEY=\nVITE_FIREBASE_AUTH_DOMAIN=\n');
w('firebase-react-pass/firebase.json', { hosting: { public: 'dist', headers: [
  { source: '**', headers: [
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' } ] },
  { source: '/admin/**', headers: [ { key: 'Content-Security-Policy', value: "default-src 'self'; frame-ancestors 'none'" }, { key: 'X-Robots-Tag', value: 'noindex' } ] } ] },
  firestore: { rules: 'firestore.rules' }, functions: { source: 'functions', runtime: 'nodejs22' }, emulators: { firestore: { port: 8080 }, auth: { port: 9099 } } });
w('firebase-react-pass/.firebaserc', { projects: { default: 'acme-site-prod', emu: 'demo-local' } });
w('firebase-react-pass/firestore.rules', `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /allowlist/{uid} { allow read: if request.auth != null && request.auth.uid == uid; allow write: if false; }
    match /consents/{id} { allow create: if request.auth != null; allow update, delete: if false; }
    match /{document=**} { allow read, write: if false; }
  }
}
`);
w('firebase-react-pass/README.md', '# fx\n\n## Rollback\n\n`firebase hosting:rollback`\n');
w('firebase-react-pass/scripts/deploy-guard.sh', '#!/usr/bin/env bash\nset -euo pipefail\n[ -z "$(git status --porcelain)" ] || { echo "Refusing: dirty tree"; exit 1; }\n');
w('firebase-react-pass/.github/workflows/deploy.yml', `name: deploy
on: { pull_request: {}, push: { branches: [main] } }
permissions: { contents: read, id-token: write }
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm ci && npm test
  production:
    if: github.ref == 'refs/heads/main'
    needs: check
    environment: production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: google-github-actions/auth@6fc4af4b145ae7821d527454aa9bd537d1f2dc5f # v3
        with: { workload_identity_provider: projects/1/locations/global/workloadIdentityPools/github/providers/repo, service_account: deployer@acme.iam.gserviceaccount.com }
`);
w('firebase-react-pass/expected.json', { exit_code: 0,
  facets: { runtime: ['node'], framework: ['react', 'vite', 'firebase-web-sdk'], hosting: ['firebase'], database: ['firestore'], compute: ['firebase-functions'], node_version: ['22', 'nodejs22'], ci: ['github-actions'], package_manager: ['npm'], test_tool: ['firebase-rules-unit-testing'], emulator: ['firebase-emulators'], auth: ['firebase-auth'] },
  must_pass: ['core.secrets.env-not-tracked', 'core.secrets.gitignore-covers-env', 'firebase.rules.catch-all-deny', 'firebase.hosting.hsts', 'firebase.project.not-demo', 'firebase.functions.runtime-not-decommissioned', 'gha.actions.not-floating', 'gha.auth.no-key-file-secrets', 'node.gate.typecheck', 'node.gate.build', 'firebase.gates.rules-tests', 'core.rollback.documented', 'core.deploy.guard-script'],
  must_not_apply: ['django.check-deploy', 'nextjs.csp.present', 'docker.no-secrets-in-env-arg'] });

// ---------- firebase-fail ----------
w('firebase-fail/package.json', { name: 'fx-firebase-fail', dependencies: { react: '^19.0.0', firebase: '^11.0.0' }, scripts: { build: 'node -e "process.exit(1)"' } });
w('firebase-fail/.env', 'VITE_API_KEY=AIza-REAL-LOOKING\n');
w('firebase-fail/.gitignore', 'node_modules\n');
w('firebase-fail/firebase.json', { hosting: { public: 'dist' }, firestore: { rules: 'firestore.rules' }, functions: { source: 'functions', runtime: 'nodejs18' } });
w('firebase-fail/.firebaserc', { projects: { default: 'demo-project' } });
w('firebase-fail/firestore.rules', `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{id} { allow read, write: if request.auth != null; }
  }
}
`);
w('firebase-fail/config.js', 'const salt = "local-salt";\nexport const cfg = { apiKey: "demo" };\n');
w('firebase-fail/.github/workflows/deploy.yml', `name: deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@main
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with: { firebaseServiceAccount: "\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}" }
`);
w('firebase-fail/expected.json', { exit_code: 1,
  facets: { hosting: ['firebase'], env_file: ['.env'], ci: ['github-actions'] },
  must_fail: ['core.secrets.env-not-tracked', 'core.secrets.gitignore-covers-env', 'firebase.rules.catch-all-deny', 'firebase.rules.no-open-write', 'firebase.project.not-demo', 'firebase.functions.runtime-not-decommissioned', 'firebase.hosting.hsts', 'gha.actions.not-floating', 'gha.auth.no-key-file-secrets', 'gha.token.permissions-declared', 'node.lockfile.present', 'core.secrets.placeholder-sweep', 'node.gate.build'] });

// ---------- nextjs-vercel ----------
w('nextjs-vercel/package.json', { name: 'fx-next', scripts: { build: ok }, dependencies: { next: '15.0.0', react: '19.0.0', 'next-auth': '5.0.0', '@prisma/client': '6.0.0' }, devDependencies: { typescript: '5.6.0' } });
w('nextjs-vercel/package-lock.json', { name: 'fx-next', lockfileVersion: 3 });
w('nextjs-vercel/vercel.json', { headers: [ { source: '/(.*)', headers: [ { key: 'Strict-Transport-Security', value: 'max-age=63072000' } ] } ] });
w('nextjs-vercel/.gitignore', '.env*\n!.env.example\n');
w('nextjs-vercel/.env.example', 'DATABASE_URL=\nNEXT_PUBLIC_APP_URL=\n');
w('nextjs-vercel/app/global-error.tsx', 'export default function GlobalError(){return null}\n');
w('nextjs-vercel/expected.json', { exit_code: 0, skip_commands: true,
  facets: { framework: ['nextjs', 'react'], hosting: ['vercel'], auth: ['nextauth'], database: ['prisma'], language: ['typescript'] },
  facets_absent: { hosting: ['vercel-implied'] },
  must_pass: ['nextjs.env.no-secret-in-public-prefix', 'nextjs.headers.security', 'nextjs.error-pages.present', 'node.lockfile.present'],
  must_fail: ['nextjs.csp.present', 'core.ci.present'],
  must_not_apply: ['firebase.hosting.hsts', 'vercel.headers.security'] });

// ---------- django ----------
w('django/requirements.txt', 'django>=5.1\npsycopg[binary]\npytest\n');
w('django/manage.py', '#!/usr/bin/env python\nimport sys\n');
w('django/mysite/settings.py', 'import os\nSECRET_KEY = os.environ["SECRET_KEY"]\nDEBUG = False\nALLOWED_HOSTS = ["example.org"]\nSESSION_COOKIE_SECURE = True\nCSRF_COOKIE_SECURE = True\n');
w('django/.gitignore', '.env\n');
w('django/expected.json', { exit_code: 0, skip_commands: true,
  facets: { runtime: ['python'], framework: ['django'], database: ['postgres'], test_tool: ['pytest'], auth: ['django-auth'] },
  must_pass: ['django.secret-key.from-env', 'django.debug.not-true-literal', 'django.allowed-hosts.no-wildcard', 'django.cookies.secure'],
  must_not_apply: ['node.lockfile.present', 'firebase.rules.file-exists'] });

console.log('fixtures written to', F);
