---
description: Commit this session's changes on a branch, push it, and open (or update) its PR against `main`. Never pushes to `main`.
---

This repo deploys `main` to GitHub Pages on every merge, so `/save` never touches `main`: it commits on a branch, pushes the branch and keeps one PR per branch. Merging stays a separate, explicit step.

## 1. Look before staging

- `git status --short` (never `-uall`), `git diff --stat HEAD`, `git log -5 --oneline` (match the style: `feat(local): …`, `fix(esa): …`, `tracking: …`).
- **Branch:**
  - On `main` → create `save/$(date -u +%Y-%m-%d-%H%M)` and switch to it.
  - On any other branch (`claude/*`, `feat/*`, `save/*`, …) → stay on it. IF its PR is merged or closed (`gh pr list --head <branch> --state all --json number,state,url`) → switch to `main`, `git pull --ff-only origin main`, branch a fresh `save/...`.
- **Worktrees:** this repo is often checked out twice (`bina-gtm-pages` on `main`, `bina-gtm-pages-<slug>` on a branch). Save in the checkout this session edited.
- **Parallel sessions share a checkout.** IF the changes include files this conversation never touched → ask once: "Commit all, or only mine: <list>?" Then stage with explicit pathspecs, not `git add -A`.
- Never stage `.env`, keys, credentials, screenshots or scratch files that landed in the repo by accident (delete stray test images instead).

## 2. Pre-flight, same commit

- `pnpm build` must pass (it also runs the `scripts/check-*.mjs` guards). IF it fails → fix it, never commit past it.
- `priorities.md`: delete what this commit finishes, add what it opens (open questions, things to confirm before go-live).
- `CLAUDE.md`: only if a rule, a page, a redirect or a pattern changed (e.g. a new page goes in the Pages table).
- Design passes stay visual: no changes to `src/lib/` logic, data values, the lead payload or tracking unless that was the task.

## 3. Commit and push

- Subject ≤72 chars, why over what when the why is not obvious.
- HEREDOC body; end with the Co-Authored-By trailer the session gives.
- `git push -u origin HEAD` if the branch has no upstream, else `git push origin HEAD`.

## 4. Open or update the PR

- PR exists (`gh pr view --json number,url`) → the push updated it; report the URL.
- No PR → `gh pr create --base main --head <branch> --title "<subject>" --body "<body>"`. Body: what changed (short bullets, grouped by page), open questions, and "Merging deploys go.bina.school." End with the PR attribution line the session gives.

## 5. Report

- Branch, commit hash, PR number + URL, files touched, what changed in `priorities.md`.
- Then: what I need to do + what I need from you, or "no action needed".

## Guardrails

- Never push to `main`, never merge (merging deploys).
- Never `--force`, `--no-verify`, amend a pushed commit, `reset --hard`, `clean`, or `checkout --`.
- Never delete a branch without confirming its PR is merged or closed.
