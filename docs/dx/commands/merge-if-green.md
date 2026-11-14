---
description: Merge one pull request only if every check passed; otherwise report why not. Invoking this is the owner's go for that one PR.
---

Merge a pull request in the current repository if, and only if, it is green. My invoking this command is the go to merge the PR named here, nothing else: $ARGUMENTS
If no PR number was given, use the PR for the current branch (`gh pr view --json number`). If there is none, say so and stop.

1. `gh pr view <n> --json number,title,state,isDraft,baseRefName,headRefName,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,url`.
2. Do not merge, and say why, when any of these hold:
   - it is draft, closed or already merged;
   - a check is pending: list the pending checks and their URLs, then stop. Do not wait or poll;
   - a check failed: name it, run `gh run view <run-id> --log-failed` (last 60 lines), and give the likely cause in one sentence;
   - `reviewDecision` is `CHANGES_REQUESTED`;
   - `mergeable` is `CONFLICTING`: list the conflicting files from `git diff --name-only --diff-filter=U` after a local test merge in a temporary worktree. Do not resolve them.
3. If `mergeStateStatus` is `BEHIND` and everything else is green, run `gh pr update-branch <n>` once and report that CI is re-running. Stop there.
4. Merge method:
   - First, the repo's written convention. `grep -i -E 'squash|merge commit|rebase' CLAUDE.md AGENTS.md CONTRIBUTING.md docs/*workflow*.md`; say which file it came from.
   - Then what GitHub allows: `gh api repos/{owner}/{repo} -q '[.allow_merge_commit,.allow_squash_merge,.allow_rebase_merge]'`.
   - Use the convention if GitHub allows it. With no convention, use a merge commit, else squash, else rebase.
   - Never `--admin`, never bypass a ruleset, never `--auto` unless I asked.
5. Merge with `gh pr merge <n> --<method>` and no attribution lines in any message. Then confirm with `gh pr view <n> --json state,mergeCommit` and report the merge commit.
6. If a workflow deploys on push to the base branch, say so and suggest `/check-deploy` in about the time that workflow usually takes (from `gh run list --workflow <file> -L 5`, the median duration).
7. Answer at the top: merged (commit) / not merged and why. End with `**In plain English:**` in 2 sentences.
