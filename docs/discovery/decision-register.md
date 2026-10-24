# Discovery decisions, owners and authority gates

Date: 25 October 2026 | Status: prototype coordination baseline; external approvals pending

## Named coordination and approval boundaries

**Working project decision coordinator: Daivya Patel**, based on the repository owner/author identity. This is a provisional, reversible project planning assignment; direct confirmation or a teammate roster can replace it. The coordinator tracks the decisions below, gathers evidence, identifies the actual approving authority and keeps the backlog current. This assignment does not make the coordinator an AICTE process owner, committee authority, compliance verifier, privacy/security signatory or government host administrator.

No additional teammate names or appointed regulatory signatories were supplied. Do not fabricate them. Every decision below has a named coordination owner, a required-by gate and an explicit external approver gap. Actual approvers must be named and their mandates/evidence recorded before the dependent real action. Synthetic implementation may proceed with the bounded defaults in the PRD and [integration decision](./integration-mode.md).

## Decision register

`Prototype selected` is a design choice, not a live approval. `Pending authority` means no real activation until named authority and evidence exist. Relative gates are used because the team schedule/deadline has not been supplied; do not invent calendar commitments.

| ID | Decision and current status | Named coordination owner | Required approver / current gap | Required by | Next action / blocking evidence |
|---|---|---|---|---|---|
| D01 | **Prototype selected:** synthetic reference host; actual host unknown | Daivya Patel | Actual host owner unassigned | Before T014 real-host onboarding / G3 | Supply host name, owner, code/sandbox scope and point of contact; reopen host inventory if supplied |
| D02 | **Pending authority:** no real API/event/export/SSO/write entitlement | Daivya Patel | Host/API/identity owner unassigned | Before any real connector credentials, data read or write; T014/G3 | Obtain supported contracts, field/action delegation, auth/scopes, version/dedup semantics and support path |
| D03 | **Pending authority:** complete current APH/amendments and category/year bindings | Daivya Patel | Authorised process/rule publisher unassigned | Synthetic source fixtures in T002; before real policy activation/G3 | Retrieve missing updated addendum; record sources/versions, approved interpretation and route fixtures |
| D04 | **Prototype bounded:** explicit synthetic deficiency/return/hearing/appeal branches | Daivya Patel | Competent workflow/process authority unassigned | Before binding real routes/actions; T019 pilot validation/G3 | Confirm correction scope, triggers, negative/appeal outcomes, hold/withdraw/reopen powers and official decision mandate |
| D05 | **Prototype bounded:** synthetic committee/availability constraints only | Daivya Patel | Actual committee selection/scheduling authority unassigned | Before any real committee selection, assignment or EVC booking; T024–T026 real use/G3 | Supply mandated selection/composition/exclusions, visit modes and authoritative calendars |
| D06 | **Prototype bounded:** PRD demo date-only/working-day/cutoff conventions | Daivya Patel | Deadline/calendar/extension authority unassigned | Before sending any real deadline notice or deriving real due action; G3 | Confirm anchors, inclusivity, holidays, pauses, extensions and timestamp authority per applicable rule |
| D07 | **Prototype bounded:** explicit synthetic obligations and validity rules | Daivya Patel | Compliance/document verification authority unassigned | Before real condition activation/evidence intake/verification; G3 | Confirm lease applicability/horizon, evidence requirements, due derivation and reviewers |
| D08 | **Prototype bounded:** in-app + test mail sink; no real recipients | Daivya Patel | Administrative escalation/channel policy owner unassigned | Before external notices or real escalation; G3 | Approve recipient hierarchy, channel/template policy, repeat limits, maker-checker and technical-failure handling |
| D09 | **Proposed targets:** PRD load/planner/file limits; actual volume/budget unknown | Daivya Patel | Sponsor/capacity owner unassigned | Before T052 target sign-off and T049 capacity/budget commitment | Confirm institution/case/attachment/concurrency counts, team capacity, demo date and cost ceiling; re-estimate backlog |
| D10 | **Pending authority:** synthetic development only; real hosting/data/records policy unknown | Daivya Patel | Hosting, security/privacy/records and procurement owners unassigned | Before real data or account/deployment commitment; T048–T049/G3 | Approve deployment/data paths, applicable privacy/security rules, retention/holds/disposal and incident plan |
| D11 | **Prototype selected:** embedded reference UI; optional extension deferred | Daivya Patel | Real host/browser/accessibility owner unassigned | Before real embedding or extension rollout; T056/G3 | Confirm permitted origins/CSP/SSO/browser policies and applicable accessibility acceptance |
| D12 | **Pending authority:** no production support or statutory signatories appointed | Daivya Patel | Operational owner, sponsor and regulatory signatories unassigned | Before T054/G3; no availability/recovery promise before T049 evidence | Name team/support contacts, escalation/on-call ownership, policy signatories and measured service commitments |

The coordinator is responsible for chasing each input, not approving the underlying regulatory matter. Team delegation can split coordination ownership when named people accept it. Record the date, scope and authority of any later decision instead of silently replacing this history.

## Permission register

| Scope | Evidence/current permission | Consequence |
|---|---|---|
| Work in this repository | User requested setup and first-ticket work in this session | Repository documentation/discovery and the scoped next deliverables are authorised |
| Branch, commit, push and merge into `main` | User explicitly requested a new branch/push/merge for each completed subticket | Use ordinary Git and descriptive messages without ticket names; retain branches; no force-push/protection bypass |
| Synthetic reference-host prototype | PRD fallback plus absent supplied host; selected as reversible prototype design | Design/build only within synthetic scope; runtime activation still requires implemented controls |
| Read/change a government or institutional system | No entitlement supplied | Disabled; no portal probing, scraping, credentials or inferred private APIs |
| Real personal/institution evidence | No processing/records approval supplied | Do not ingest, upload, expose or include in fixtures |
| Actual regulatory verification/decision | No competent mandate supplied to this service | Never inferred from project coordination; no autonomous approval/refusal/sanction |
| Real recipients/channels | No approved recipient/channel policy | Local test mail sink only; no external messages from synthetic workflows |
| Cloud spending, real hosting commitments and production retention locks | No budget/account/procurement/records decision supplied | Prepare design and estimates; seek concrete approved configuration before commitments |

## Outstanding questions and safe progress

The coordinator should supply an actual host if one exists, confirm the coordinator/team roster, identify a process reviewer, set team capacity/demo date/budget and name the pilot sponsor. Real owners can remain pending while synthetic routing fixtures and the technology compatibility proof proceed. Do not describe this register as G0 completion: regulatory baseline/fixtures and scope/measurement work in the remaining discovery tickets are still open.

## First-ticket completion evidence

| Subtask | Evidence | Completion scope |
|---|---|---|
| Repository/host inventory | [Inventory](./host-inventory.md) | Supplied repository inventoried; no existing host falsely assumed |
| Ownership and delegated actions | [Authority matrix](./ownership-and-authority.md) | Field/entity ownership, planned action allowlist and live denial defined |
| Initial mode and fallback | [Integration decision](./integration-mode.md), [design profiles](../../config/discovery/integration-profiles.json) | Concrete synthetic event/API reference path, read-only import and freshness contract |
| Owners, gates and open questions | This register | Named provisional project coordination and required-by gates for D01–D12; real signatories explicitly unresolved |

This closes the first ticket's prototype discovery scope, not the external approvals or the entire discovery epic. No runtime implementation or production AICTE integration is claimed.
