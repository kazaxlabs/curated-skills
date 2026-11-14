---
description: Report the latest production deploy of this repo (CI run, deployed commit, live site status) in one pass, without polling.
---

Check the production deploy for the repository in the current folder. Read-only: do not push, merge, rerun or deploy.

1. `gh repo view --json nameWithOwner,defaultBranchRef -q '.nameWithOwner+" "+.defaultBranchRef.name'` gives the repo and default branch. `git fetch -q origin <default>` then `git rev-parse origin/<default>` gives the newest commit.
2. List deploy workflows: files in `.github/workflows/` whose name or `name:` contains "deploy" (case-insensitive). Ignore preview/channel workflows unless I passed `preview` as an argument: $ARGUMENTS
3. For each deploy workflow: `gh run list --workflow <file> --branch <default> -L 3 --json databaseId,status,conclusion,headSha,createdAt,updatedAt,event,url`. Take the newest run.
4. Report, one line per workflow:
   - status and conclusion;
   - whether its `headSha` equals origin/<default>. If not, say how many commits are undeployed (`git rev-list --count <headSha>..origin/<default>`);
   - start time and duration.
5. If the newest run failed: `gh run view <id> --log-failed`, keep the last 60 lines, and name the failing step and the likely cause in one sentence. Do not rerun it.
6. If a run is queued or in progress, say so with its URL and stop. Do not wait or poll.
7. Live check: find the production URL. Look first in the deploy workflow (`url:`, `environment.url`, or a hosting site), then in `firebase.json` / `.firebaserc` (`https://<site>.web.app`), then in the README. Run `curl -s -o /dev/null -w "%{http_code} %{time_total}s" <url>` once and report the status and time.
8. Answer at the top: deployed and healthy / deployed but site error / deploy failed / deploy running / newest commit not deployed. Then the lines above, then `**In plain English:**` in 2 sentences.
