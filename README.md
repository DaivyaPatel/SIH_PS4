# AICTE approval orchestration and compliance

An integration-first project for approval workflow coordination, EVC scheduling, undertaking compliance, document validity, reminders and audit. Regulatory scrutiny and decisions remain with competent authorities.

## Current status

Prototype discovery is complete: host/authority boundaries, regulatory-source/synthetic-fixture baseline, MVP journeys, low-fidelity flows and the measurement plan are documented. This repository contains planning, provenance records and executable synthetic specifications, with no application runtime or live AICTE integration. The initial prototype uses a clearly labelled synthetic reference host unless an authorised host is supplied. Technology compatibility and the shared transaction boundary are the next implementation step. Team capacity and demo date remain unassigned.

## Project documents

- [Master PRD](./files/MASTER_PRD.md)
- [Delivery backlog and progress](./files/tickets.md)
- [Consolidated research context](./files/AICTE_Workflow_Master_Context.md)
- [Host and repository inventory](./docs/discovery/host-inventory.md)
- [Source of truth and delegated actions](./docs/discovery/ownership-and-authority.md)
- [Initial integration decision](./docs/discovery/integration-mode.md)
- [Decision owners, gates and outstanding approvals](./docs/discovery/decision-register.md)
- [Regulatory source register](./docs/regulatory/source-register.md)
- [Amendment findings and remaining gaps](./docs/regulatory/amendment-review.md)
- [Synthetic route/compliance fixtures and offline checks](./docs/regulatory/synthetic-policy-guide.md)
- [Process-owner review and activation checklist](./docs/regulatory/process-owner-validation.md)
- [MVP scope and five core journeys](./docs/product/mvp-scope.md)
- [Contextual workspace and console wireframes](./docs/product/ux-flows.md)
- [Measurement plan](./docs/evaluation/measurement-plan.md) and [planned benchmark manifest](./config/evaluation/benchmark-manifest.json)
- [Contribution and branch workflow](./CONTRIBUTING.md)

## Getting started

Clone the repository and read the PRD, backlog and discovery inventory. There are no application install/start commands yet. Runtime scaffolding follows the stack/transaction proof; do not assume the presence of a Java service, UI, database or Docker environment.

Use synthetic data for development. Do not commit credentials, government records, institution evidence or private exports.

Next work: prove compatible Java/Spring/Flowable/PostgreSQL/OR-Tools choices and their shared transaction behaviour before scaffolding application modules. See the backlog dependencies for the delivery order. Ask before required provider/model choices, credentials, paid services or other external setup; none is required to read/validate the current discovery package.

The regulatory source catalogue now records downloaded-PDF checksums, clause/page anchors, supplied-context hashes and unavailable endpoints. A government-hosted 2026–27 amendment copy was retrieved; its equivalence to the unavailable Updated file and completeness of later notices remain unconfirmed. No real policy is activated.

Run the offline provenance check with `python scripts/check_source_register.py`. If public PDFs have been downloaded into ignored local research storage, add `--cache-dir .local/research` to verify their hashes. No keys, models or third-party Python dependencies are needed for this check.

Run `python scripts/check_synthetic_policy.py` for three synthetic route definitions and 74 expected route/compliance cases. It checks guards, branches, date boundaries, submission-vs-review, document validity and responsibility-aware notice classification. This is an offline executable specification, not proof of backend authorisation, persistent timers or actual message delivery. All policy activation flags remain false; real rule publication requires the owner-review checklist and complete current sources.

The evaluation manifest defines future 24-case walkthrough, service-load, alert and planner workloads plus a consented task-timing protocol. The datasets/generators, runtime benchmarks and participant study are explicitly not run or implemented. Raw evaluation output and participant records are ignored; commit only deliberately reviewed summaries. Prototype discovery completion does not imply regulatory approval or a working application.

## Delivery workflow

Group two or three coherent subtickets per commit, use a descriptive topic branch, push it, merge into `main` and push `main`. Commit and merge messages contain no ticket identifiers. Review/update this README and `.gitignore` with each task commit. Keep the backlog/evidence current and ask before required keys, model/provider choices or external service setup. See the contribution guide for exact steps and safeguards.
