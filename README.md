# AICTE approval orchestration and compliance

An integration-first project for approval workflow coordination, EVC scheduling, undertaking compliance, document validity, reminders and audit. Regulatory scrutiny and decisions remain with competent authorities.

## Current status

Repository setup and the first discovery ticket are complete. The rest of discovery remains open. This repository currently contains planning, research and discovery contracts, with no application runtime or live AICTE integration. The initial prototype will use a clearly labelled synthetic reference host unless an authorised host is supplied. Proposed technology choices are not installed or implemented by this documentation setup.

## Project documents

- [Master PRD](./files/MASTER_PRD.md)
- [Delivery backlog and progress](./files/tickets.md)
- [Consolidated research context](./files/AICTE_Workflow_Master_Context.md)
- [Host and repository inventory](./docs/discovery/host-inventory.md)
- [Source of truth and delegated actions](./docs/discovery/ownership-and-authority.md)
- [Initial integration decision](./docs/discovery/integration-mode.md)
- [Decision owners, gates and outstanding approvals](./docs/discovery/decision-register.md)
- [Contribution and branch workflow](./CONTRIBUTING.md)

## Getting started

Clone the repository and read the PRD, backlog and discovery inventory. There are no application install/start commands yet. Runtime scaffolding follows the stack/transaction proof; do not assume the presence of a Java service, UI, database or Docker environment.

Use synthetic data for development. Do not commit credentials, government records, institution evidence or private exports.

Next work: establish the regulatory source/fixture baseline and prove the technology/transaction choices before scaffolding application modules. See the backlog dependencies for the delivery order.

## Delivery workflow

Each completed subticket is developed on a new branch, committed with a descriptive message without ticket identifiers, pushed, merged into `main` and followed by a push of `main`. The backlog and discovery evidence are updated with the work. See the contribution guide for exact steps and safeguards.
