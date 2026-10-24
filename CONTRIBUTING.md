# Contributing

## Scope and evidence

Use the [backlog](./files/tickets.md) and [PRD](./files/MASTER_PRD.md). Complete only the authorised work; keep synthetic/reference-host behaviour distinct from real AICTE capabilities. Mark a subtask complete only when its deliverable and validation exist. An external approval remains pending until the actual authority provides it.

## One branch per subticket

Start from a clean `main` synced with `origin/main`. Create a descriptive branch such as `docs/host-inventory` or `feat/source-mapping`. After completing the subtask, review the diff, run appropriate checks and update its backlog checkbox/evidence. Stage only intended changes.

Commit messages use descriptive conventional subjects such as `docs: record host integration inventory`. Do not include ticket IDs or ticket names in commit subjects, bodies or merge messages. Keep messages at most 72 characters on the subject line.

Push the branch, return to `main`, fetch and fast-forward `main` if needed, then merge the branch with an explicit descriptive merge message and push `main`. Example, after a reviewed commit:

```powershell
git push -u origin docs/host-inventory
git switch main
git fetch origin
git merge --ff-only origin/main
git merge --no-ff docs/host-inventory -m "docs: merge host integration inventory"
git push origin main
git status --short --branch
```

Verify the topic branch is an ancestor of `main` and local `main` matches `origin/main`. Keep remote topic branches for traceability unless the owner asks for cleanup. This project currently uses local Git merges; creating a pull request is a separate action if requested or required by branch protection.

If GitHub rejects a direct merge/push due to branch protection, retain the published topic branch and use the required review process. Do not bypass protections, force-push, discard unrelated changes, disable hooks, disable signing or rewrite published commits.

## Repository hygiene

Use UTF-8, LF line endings and relative Markdown links within documents. Do not commit secrets, build output, dependency directories, runtime state or actual institutional evidence. Add example configuration with placeholders only. Keep actual environment files local. Repository formatting defaults are in [.editorconfig](./.editorconfig) and [.gitattributes](./.gitattributes).
