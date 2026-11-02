# Rule files

One JSON array per overlay. `core.json` always applies; every other file is a facet
overlay selected by each rule's `applies_when`. The runner loads every `*.json` here.

## Rule schema

```json
{
  "id": "firebase.rules.catch-all-deny",
  "title": "Firestore rules end with a catch-all deny",
  "severity": "block | warn | info",
  "applies_when": { "all": ["hosting=firebase"], "any": ["database=firestore"], "none": [] },
  "check": { "type": "grep", "pattern": "...", "include": ["firestore.rules"], "expect": "present" },
  "remediation": "one line the report can quote",
  "sources": [ { "title": "...", "url": "...", "tier": "standards|vendor|educator|practitioner|model-prior", "fetched": "2026-10-27", "status": 200 } ],
  "skills": ["firebase"]
}
```

`applies_when` predicates are `facet=value` or `facet=*` (facet present with any value)
over the stack profile from `scripts/detect-stack.mjs`. `all`, `any`, `none` are each
optional. A rule with no `applies_when` always applies.

## Check types

| type | fields | verdict |
| :--- | :--- | :--- |
| `file_exists` | `paths[]` | pass if any path exists |
| `file_absent` | `paths[]` | pass if none exists |
| `grep` | `pattern`, `flags?`, `include[]` (globs, basename or `**/`), `expect: present/absent` | pass when expectation holds; evidence lists matches |
| `json_path` | `file`, `path` (dot path), `expect: exists/absent/equals/matches`, `value?` | |
| `git_untracked` | `pattern` (regex over `git ls-files`) | pass when no tracked path matches; degraded to filesystem scan when not a git repo |
| `facet` | `facet`, `expect: present/absent`, `value?` | pass when the profile matches |
| `command` | `cmd[]`, `cwd_from_facet?`, `requires_script?`, `expect_exit` (default 0), `mutating` (default false) | exit code; skipped when `requires_script` is not in the profile |
| `review` | `prompt` | never pass/fail; reported as REVIEW with the prompt and `skills` to load |

Severity drives the exit code: any failed `block` rule → exit 1. `warn` and `info`
never change the exit code. `review` items are listed for the agent and count as
prose, not verification.

A rule whose `sources` are all `model-prior` or `practitioner` may not carry
severity `block` unless it states a durable principle; the test runner enforces this.
