# Contributing

## Scope and evidence

Use the [backlog](./files/tickets.md) and [PRD](./files/MASTER_PRD.md). Complete only the authorised work; keep synthetic/reference-host behaviour distinct from real AICTE capabilities. Mark a subtask complete only when its deliverable and validation exist. An external approval remains pending until the actual authority provides it.

## Grouped subtickets and branch workflow

Start from a clean `main` synced with `origin/main`. Group two or three coherent subtickets per commit on a descriptive branch such as `docs/regulatory-source-baseline` or `feat/source-mapping`. Review the diff, run appropriate checks and update completed backlog checkboxes/evidence. Stage only intended changes; unfinished acceptance remains unchecked.

Review and update [README.md](./README.md) and [.gitignore](./.gitignore) with every task commit: describe current progress/setup/checks and add relevant local/generated/secret exclusions. Do not add arbitrary ignore patterns solely to produce a diff. Ask the project owner before introducing required API keys, model/provider choices, paid services or other external setup; never ask them to paste secrets into Git or a committed file. Public-source research and offline fixture checks need no model/key.

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
