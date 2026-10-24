# Delivery backlog: AICTE approval orchestration and compliance

Version: 1.0 | Date: 25 October 2026 | Status: planned, no implementation claimed

Product authority: [MASTER_PRD.md](./MASTER_PRD.md). Source context: [research folder](./). Requirement IDs, acceptance scenarios AT-01–AT-20 and gates G0–G4 refer to the PRD. Checkboxes and linked evidence track progress; unchecked work remains TODO. No ticket is completed merely because this backlog exists.

## 1. How to use this backlog

- **Hierarchy:** epic `E##` → deliverable ticket `T###` → checkable subticket `T###.n`. Parent completion requires all applicable subtickets and acceptance evidence. Subtickets are implementation slices, not independent regulatory permission.
- **Priority/release:** P0 = complete bounded prototype; P1 = pilot hardening; P2 = measured expansion. P0 is a release requirement, not a claim every item fits one short sprint. Mixed-priority subtickets explicitly state their release.
- **Dependencies:** `Depends` lists direct prerequisites; inherited/transitive dependencies still apply. Within a ticket, follow the listed subtask order unless independent. Gates add external conditions and never bypass dependencies.
- **Size:** S ≈ 1–2 engineering days, M ≈ 3–5, L ≈ 6–10, after discovery; estimates cover the parent including subtasks. They exclude external waiting and assume familiar tools. Re-estimate after the foundation spike; do not sum them into a delivery promise.
- **Owner:** accountable role, to be replaced with a named team member. FE = interface, BE = backend, INT = integration, SEC = security, QA = evaluation, OPS = deployment. One person may cover several roles; approvals still follow the configured separation of duties.
- **Blocked work:** record blocker/decision ID, owner and next action. Continue synthetic/reference-host work where safe; do not invent production permissions, legal rules or committee authority.
- **Evidence:** link code/config, test output, sample receipt/report or walkthrough as appropriate in the eventual issue. Use synthetic data by default. Ticket acceptance includes failure paths, not only screens.

### 1.1 Shared definition of ready

Applicable PRD IDs and release identified; direct dependencies understood; scope/authority boundary explicit; synthetic fixtures available or included as a subtask; acceptance understood. Real host changes additionally need D01/D02 approval; real policy activation needs D03–D08 and G3.

### 1.2 Shared definition of done

Implementation and required migrations/configuration reviewed; acceptance demonstrated; relevant negative/security/retry tests pass; API/UI semantics and receipts agree; consequential writes have audit and version controls; telemetry and operational instructions updated where applicable; no secrets or real unapproved records in fixtures; evidence linked. Business writes cannot be called complete while host outcome is unknown. Reversible documentation/configuration work needs appropriate inspection, not artificial unit tests.

## 2. Delivery sequence and release gates

| Milestone | Work | Exit evidence |
|---|---|---|
| M0 — discovery/G0 | E00; start T004 foundation spike | Host/reference-host decision, authority matrix, rule corpus gaps, named decision owners |
| M1 — dependable foundation/G1 | E01–E04; reference host T013 | Shared transaction proof, scoped auth, durable audit/inbox/outbox, approved synthetic rules |
| M2 — case routing slice | E05, E06, E08 document foundation; T039–T040 contextual UI | Host event → route → deficiency → response → guarded review → acknowledgement/history |
| M3 — complete PS coverage | E07, E09, E10, E12 P0 | EVC, obligations, validity, alerts, role dashboards and reports with correct responsibility |
| M4 — differentiator and G2 | E11, E14 P0, E15 P0 | Planner/baselines, fault demonstrations, scoped staging, restore and accessibility evidence |
| M5 — authorised pilot/G3 | All P1; D01–D12 resolved for pilot scope | Real connector/rules/SSO approvals; security/records/hosting and operations gates |
| M6 — expansion/G4 | E16 P2 | Measured value and approved inference/integrations/channels |

Critical foundation chain: `T001 → T004 → T005 → T007 → T010 → T011 → T015 → T017 → T021`. Identity `T008` and policy discovery `T002` join before guarded routing. Planner execution additionally joins EVC capacity, accepted evidence, calendars and connector receipts. UI mocks can precede APIs, but integration acceptance must use working APIs.

Suggested parallel workstreams after M1: workflow/clocks; evidence/compliance; EVC/planner; UI/reporting/QA. This is an allocation option for the project team, not a claim that agents or developers have been assigned. No fixed sprint dates until capacity and deadline are known.

## 3. Epic index and coverage

| Epic | Scope | Primary PRD coverage | First release |
|---|---|---|---|
| E00 | Discovery and regulatory baseline | INT-01, POL-01, D01–D12 | P0 |
| E01 | Architecture, persistence and reliable transactions | OPS-01, AUD-01, INT-02–03 | P0 |
| E02 | Identity and scoped authority | IAM-01–02, NFR-02 | P0 |
| E03 | Host integration and reference harness | INT-01–05 | P0 |
| E04 | Policy lifecycle and applicability | POL-01–02 | P0 |
| E05 | Approval workflows and human decisions | WF-01–05 | P0 |
| E06 | Calendars, deadlines and durable timers | CLK-01–02 | P0 |
| E07 | EVC lifecycle and constrained scheduling | EVC-01–03 | P0 |
| E08 | Secure evidence and document validity | DOC-01–03 | P0 |
| E09 | Undertakings and compliance review | CMP-01–02 | P0 |
| E10 | Notifications and escalation | ALT-01–03 | P0 |
| E11 | Readiness and recovery planner | PLN-01–04 | P0 |
| E12 | Contextual UI, dashboards and reporting | UX-01, DSH-01–02, RPT-01–02 | P0 |
| E13 | Audit reconstruction and integrity | AUD-01–02 | P0 |
| E14 | Deployment, reliability and governance | OPS-01–02, NFR-03–10 | P0 |
| E15 | Evaluation and release evidence | AT-01–20, G2–G3 | P0 |
| E16 | Optional AI, extension and expansion | AI-01, UX-02 | P2 |

## E00 — Discovery and approved baseline

### T001 — Identify host, authority and integration mode

**P0 · M · Owner: product + INT · Depends: none · Maps: INT-01; D01–D02; G0**

- [x] T001.1 Inventory the repository/host when supplied: architecture, auth, entities, status model, API/event/export/embedding capabilities and ownership. Evidence: [repository and host inventory](../docs/discovery/host-inventory.md). No executable host has been supplied; real-host discovery reopens when one is provided.
- [x] T001.2 Create field/entity ownership matrix and delegated-action allowlist, including official facts/decisions versus service-owned tasks/timers. Evidence: [source-of-truth and delegated-action contract](../docs/discovery/ownership-and-authority.md); live entitlements remain ungranted.
- [x] T001.3 Choose sanctioned host integration or labelled synthetic reference host; document capability flags, read-only fallback and freshness contract. Evidence: [initial integration decision](../docs/discovery/integration-mode.md) and [inactive design profiles](../config/discovery/integration-profiles.json); selected synthetic reference host, no runtime/live integration claimed.
- [ ] T001.4 Assign named owners and required-by gates for D01–D12; record permissions and unanswered questions.

**Acceptance:** one concrete initial integration path is selected; unsupported actions are visibly disabled in the design. No public AICTE API or write entitlement is presumed. Lack of production access has an actionable reference-host fallback.

### T002 — Build regulatory source register and synthetic rule fixtures

**P0 · M · Owner: process analyst + product · Depends: none · Maps: POL-01, WF-01, CLK-01; D03–D08**

- [ ] T002.1 Catalogue APH, amendments, annual notices/orders and older-source limitations with document checksum, clause/page, applicability and supersession evidence.
- [ ] T002.2 Obtain authoritative replacement for the failed updated-addendum URL where possible; unresolved text remains an explicit activation blocker.
- [ ] T002.3 Produce synthetic scrutiny-only, scrutiny + EVC and EVC-only tables with conditional hearing/appeal, deficiency loop, negative outcomes and expected next roles.
- [ ] T002.4 Define demo calendar, obligation/evidence/lease rules, offsets and escalation recipients; label every synthetic rule.
- [ ] T002.5 Prepare a process-owner validation checklist; distinguish research verification from production approval.

**Acceptance:** each fixture has inputs, expected transition, source/synthetic marker and reviewer status. SHC/SAC differ. No invented universal EVC deadline or automatically activated base-APH rule. Production sign-off remains gated by the current complete corpus.

### T003 — Fix MVP boundaries, UX journeys and measurement plan

**P0 · S · Owner: product + UX + QA · Depends: T001, T002 · Maps: UX-01, PLN-04; G0**

- [ ] T003.1 Confirm P0/P1/P2 scope, representative personas and five core journeys: routing, deficiency, EVC/planning, undertaking and renewal/escalation.
- [ ] T003.2 Produce low-fidelity contextual workspace/console flows including stale, blocked, unknown-write and unverified-evidence states.
- [ ] T003.3 Agree proposed benchmark sizes, synthetic-data manifest, demo evidence and pilot user-task timing protocol.

**Acceptance:** journeys trace to PS A–F and PRD IDs; MVP includes every PS area and the planner. Stakeholders can distinguish reference-host proof from live AICTE integration.

## E01 — Technical foundation and transactional integrity

### T004 — Prove the recommended stack and transaction boundary

**P0 · M · Owner: BE lead · Depends: T001 · Maps: OPS-01, WF-01, CLK-02**

- [ ] T004.1 Pin compatible Java, Spring Boot, Flowable OSS, PostgreSQL and OR-Tools Java versions; record licences and native-library packaging.
- [ ] T004.2 Run one human task, one DMN evaluation and one persistent timer using the selected engine.
- [ ] T004.3 Prove rollback/commit coordination for Flowable state, domain row, audit intent and outbox on one datasource/transaction manager.
- [ ] T004.4 Verify OR-Tools deployment on target container architecture; document alternative only if the spike fails.

**Acceptance:** crash/rollback experiment leaves no orphaned task or uncommitted notice. If atomic coordination fails, an explicit receipt/state coordination design is approved before workflow implementation. One engine is authoritative.

### T005 — Scaffold modules, API conventions and local environment

**P0 · M · Owner: BE + FE + OPS · Depends: T004 · Maps: OPS-01, UX-01**

- [ ] T005.1 Create modular backend, TypeScript UI shell and shared API schemas without replacing a supplied host.
- [ ] T005.2 Add local Compose for PostgreSQL, private development object storage, test IdP and mail sink; provide synthetic configuration and startup instructions.
- [ ] T005.3 Add validation, standard error/receipt format, correlation IDs, pagination, health endpoints and configuration separation.
- [ ] T005.4 Add CI build/lint, migration check, dependency/secret scan and meaningful test jobs.

**Acceptance:** documented clean setup starts reliably; CI exercises the actual selected stack; credentials are injected, never committed. Unsupported optional integrations are off by default.

### T006 — Implement domain schema, source links and seeded fixtures

**P0 · L · Owner: BE · Depends: T005, T002 · Maps: PRD §10; NFR-01**

- [ ] T006.1 Add institution/campus/Region/application/request/source-link and historical assignment tables with scoped indexes.
- [ ] T006.2 Add task/iteration/deficiency, rule/version, deadline/calendar, obligation, evidence, EVC and planning relationships needed by P0 modules.
- [ ] T006.3 Establish optimistic versions, source ID uniqueness, effective/observed/server timestamps and migration strategy.
- [ ] T006.4 Seed synthetic institutions, scoped users, categories and known-count histories; include unknown mappings and missing dates.

**Acceptance:** schema constraints reject duplicate source links and invalid references; fixtures are repeatable and contain no real identifiers. Later module migrations can extend the schema without a whole-database reset.

### T007 — Add append-only audit primitive and durable inbox/outbox

**P0 · L · Owner: BE · Depends: T006 · Maps: AUD-01, INT-02–03, ALT-02; AT-03, AT-07**

- [ ] T007.1 Implement scoped audit append with actor/service, action, versions, reason/authority, correlation and rule/evidence references.
- [ ] T007.2 Implement inbox receipt uniqueness, outbox intents, leasing/locking, retries, backoff and dead-letter handling.
- [ ] T007.3 Persist audit/outbox with domain writes in the proven transaction boundary; prohibit ordinary audit updates/deletes.
- [ ] T007.4 Exercise crash after commit/before publish, duplicate consumption and worker restart; expose backlog/lag metrics.

**Acceptance:** committed changes retain required audit and recoverable intents; rollback emits no business effect. Duplicate processing does not duplicate a domain transition. External effects are not claimed exactly once.

## E02 — Identity, jurisdiction and authority

### T008 — Federated login and backend access policy

**P0 · L · Owner: SEC + BE · Depends: T005, T006 · Maps: IAM-01, NFR-02; AT-04**

- [ ] T008.1 Integrate test OIDC and production federation interface; implement secure sessions/PKCE as appropriate, logout and assurance checks.
- [ ] T008.2 Enforce role plus institution/campus, Region, case/committee assignment and action scope centrally.
- [ ] T008.3 Apply scopes to lists, details, aggregates, evidence capabilities, jobs and exports; derive actor from identity.
- [ ] T008.4 Build positive/negative role-jurisdiction fixtures, including guessed IDs and forged host-page context.

**Acceptance:** AT-04 passes through direct APIs and downloads. UI hiding cannot bypass policy. Technical admin and institution roles cannot record official review/decision.

### T009 — Delegation, privileged assurance and separation of duties

**P0 · M · Owner: SEC + BE · Depends: T008, T007 · Maps: IAM-02; AT-04, AT-16**

- [ ] T009.1 Add effective-dated assignments/delegations, expiry, revocation and audited reassignment.
- [ ] T009.2 Require privileged MFA/session assurance and policy author/publisher capability separation.
- [ ] T009.3 Define emergency access and access-review workflow; implementation may be a documented owner-controlled procedure for the synthetic prototype.

**Acceptance:** expired membership cannot act; transfers retain history; policy authors cannot self-publish unless an explicit approved exception policy applies. Delegation does not invent authority beyond the delegator's mandate.

## E03 — Host integration and reference harness

### T010 — Define connector contract and authenticated ingestion

**P0 · L · Owner: INT + BE · Depends: T001, T007, T008 · Maps: INT-01–02; AT-03–04**

- [ ] T010.1 Publish event/command/projection JSON schemas and OpenAPI; document supported actions and source-version semantics.
- [ ] T010.2 Implement signature or service-auth verification, replay handling, schema validation, payload limits and durable receipts.
- [ ] T010.3 Add mapping/provenance and quarantine for unknown entity/status/category; do not guess official status equivalence.
- [ ] T010.4 Test source+ID duplicates, delayed/out-of-order events, version gaps and payload mismatch on reused event IDs.

**Acceptance:** accepted events have durable correlation/receipt; duplicate and stale events do not regress projections or create extra work. Source IDs alone do not grant entitlement.

### T011 — Guarded writeback, command receipts and unknown-outcome reconciliation

**P0 · L · Owner: INT + BE · Depends: T010 · Maps: INT-03–04; AT-03, AT-05**

- [ ] T011.1 Persist command intent with expected source version, authenticated actor/authority and operation-scoped idempotency key.
- [ ] T011.2 Map acknowledged/confirmed/conflict/rejected/safe-retry/unknown outcomes; expose receipt lookup.
- [ ] T011.3 Reconcile timeout-after-effective-write through supported source observation/status lookup before any retry.
- [ ] T011.4 Implement periodic read reconciliation, cursor recovery, gap resync, freshness thresholds and support exception queue.

**Acceptance:** host-accepted timed-out command is confirmed without a second effective action. Unsupported writes stay disabled; stale source version returns conflict. Pending source confirmation is shown explicitly.

### T012 — Validated import and supported polling fallback

**P0 · M · Owner: INT · Depends: T010 · Maps: INT-02, INT-04; AT-03–04**

- [ ] T012.1 Add preview/commit for schema-controlled CSV/JSON with scope, export timestamp, provenance, row errors and idempotent batch receipts.
- [ ] T012.2 Add incremental polling interface, supported cursor/watermark rules and pagination/reconciliation tests.
- [ ] T012.3 Expose coverage/freshness and read-only capability flags in all imported projections.

**Acceptance:** malformed or unscoped rows cannot silently enter a different institution; repeated batch does not duplicate cases. Import/poll data is never labelled live. No unsupported writeback is enabled by an import.

### T013 — Build a labelled reference host and fault harness

**P0 · M · Owner: INT + QA · Depends: T010, T005 · Maps: INT-01–04; AT-03, AT-05, AT-07**

- [ ] T013.1 Provide synthetic existing-case UI, supported test APIs/events, record versions and explicit delegated test commands.
- [ ] T013.2 Add controlled duplicate/delayed events, version conflicts, dropped acknowledgements and source outage switches.
- [ ] T013.3 Integrate the first adapter without host-specific logic in the domain engine.

**Acceptance:** demo shows the same case in host and service with correlation and acknowledged status. Every surface says reference host/synthetic; no simulated government connection claim.

### T014 — Onboard a real sanctioned connector and second adapter

**P1 · L · Owner: INT + host owner · Depends: T011, T012, T013; external D01–D02 · Maps: INT-05; G3**

- [ ] T014.1 Validate written scope, sandbox credentials, field authority, SSO/events/write contracts and support contacts.
- [ ] T014.2 Map a second structurally different source into the same contract and run shared fixtures.
- [ ] T014.3 Compare service/source counts, statuses, evidence links and unknown commands before pilot activation.

**Acceptance:** contract suite passes for both adapters without workflow forks; pilot source is reconciled. If real access is unavailable, second synthetic adapter can prove portability only; live-onboarding subtask remains blocked.

## E04 — Policy governance

### T015 — Rule register, applicability evaluator and reviewed publication

**P0 · L · Owner: BE + process analyst · Depends: T002, T006, T007, T009, T010 · Maps: POL-01, WF-01; AT-01, AT-16**

- [ ] T015.1 Store source-linked bundles, versions, clauses/pages, effective/applicability ranges and supersession.
- [ ] T015.2 Implement draft/review/approve/effective/retire lifecycle and restricted publication API/UI.
- [ ] T015.3 Validate overlaps, missing outcomes/roles/calendars, unreachable edges and incomplete authority; retain immutable published versions.
- [ ] T015.4 Produce routing explanation and unresolved-policy result; pin evaluated case versions.

**Acceptance:** ambiguous applicability holds the case; synthetic bundles are labelled; unpublished or invalid policy cannot route production cases. Prior case decisions do not change when a new rule is published.

### T016 — Policy impact simulation and controlled migration

**P1 · L · Owner: BE + process owner · Depends: T015, T020, T021, T042, T044 · Maps: POL-02; AT-16**

- [ ] T016.1 Compare candidate/current routing, due dates and recipients against a fixed scoped case snapshot.
- [ ] T016.2 Show affected cases, required new evidence, blocked migrations and expected task/timer deltas.
- [ ] T016.3 Add authorised per-case/batch migration with idempotent receipts, version checks and partial-failure recovery.
- [ ] T016.4 Retain before/after policy, authority, approved scope and rollback/reconciliation procedure.

**Acceptance:** simulation causes no live mutation; concurrent case changes invalidate affected migration steps. Failed cases remain inspectable and recoverable, never silently rewritten.

## E05 — Approval routing and authorised human action

### T017 — Execute category-specific workflows and guarded transitions

**P0 · L · Owner: BE · Depends: T015, T011, T013 · Maps: WF-01, WF-03; AT-01, AT-03**

- [ ] T017.1 Implement scrutiny-only, scrutiny + EVC and EVC-only templates with conditional outcomes/next roles.
- [ ] T017.2 Add human task assignment, evidence/outcome guards, expected versions and idempotent completion receipts.
- [ ] T017.3 Keep official source state, workflow state, recommendation and final decision fields distinct.
- [ ] T017.4 Show rule explanation and blocked next prerequisites through readiness API.

**Acceptance:** fixture routes produce exactly the expected work; concurrent/double completion has one effective transition. A task cannot self-approve an institution, and route completion cannot fabricate a host decision.

### T018 — Deficiency response, re-review and authorised return/revert

**P0 · L · Owner: BE + FE · Depends: T017, T027 · Maps: WF-02, CMP-02; AT-02**

- [ ] T018.1 Add deficiency IDs, scope, findings, evidence requests and mandatory reason for return/revert.
- [ ] T018.2 Implement institution response with immutable submission receipt and versioned attachments.
- [ ] T018.3 Create iteration-specific re-review tasks, partial responses and permitted negative/clarification outcomes.
- [ ] T018.4 Prevent generic post-submission editing outside approved correction scope.

**Acceptance:** two review cycles preserve original findings and assessed versions; unauthorised edge/reason omission is rejected. Upload alone does not mark nil deficiency or verified compliance.

### T019 — Hearing, appeal, holds, transfers and official decision handling

**P0 · L · Owner: BE + process analyst · Depends: T018, T009 · Maps: WF-03; AT-01–02, AT-14**

- [ ] T019.1 Add distinct configured SHC and SAC branches, mandate/trigger checks and recommendations.
- [ ] T019.2 Record official decision through authoritative import or delegated command with order reference and competent actor.
- [ ] T019.3 Add authorised hold, withdrawal, transfer, reopening and processing closure semantics with pending-work effects.
- [ ] T019.4 Preserve post-approval obligations and historical Region/ownership after case processing closes.

**Acceptance:** appeal is conditional; recommendation is not final decision. Transfer does not reset clocks implicitly; closed processing does not delete monitoring or audit.

### T020 — Compound requests and evidence-aware joins

**P1 · L · Owner: BE · Depends: T019, T030, T032 · Maps: WF-04; AT-01–02**

- [ ] T020.1 Represent linked application requests/subcases and shared evidence without flattening category routes.
- [ ] T020.2 Define configured dependency/join semantics and aggregate readiness for mixed outcomes.
- [ ] T020.3 Handle one branch returned/withdrawn while another is ready; show source-specific official outcomes.

**Acceptance:** no arbitrary choice of a single category; shared evidence acceptance propagates only through applicable dependency checks. Aggregation never hides a blocked required branch.

### T021 — Standard case summary and communication drafts

**P0 · M · Owner: BE + FE · Depends: T017, T007 · Maps: WF-05; AT-02, AT-17**

- [ ] T021.1 Generate deterministic case summaries from facts, findings, outcomes, pending actions and evidence/rule references.
- [ ] T021.2 Version templates and label drafts; require authorised review for official communication actions.
- [ ] T021.3 Preserve summary generation reference time/version and audit linkage.

**Acceptance:** no invented facts or automatic statutory letter issuance. Updated evidence cannot retroactively alter a previously retained summary.

## E06 — Calendar and deadline engine

### T022 — Implement explicit calendar and deadline calculations

**P0 · L · Owner: BE + QA · Depends: T015, T017 · Maps: CLK-01; AT-06**

- [ ] T022.1 Implement date-only and instant anchors, fixed/offset deadlines, Asia/Kolkata display and versioned working-day/holiday calendars.
- [ ] T022.2 Preserve regulatory/order/internal target types, inclusivity/cutoff, original/current due and authoritative timestamp basis.
- [ ] T022.3 Add permitted pause/extension/reassignment effects without erasing calendar age.
- [ ] T022.4 Test weekend, holiday, leap-year, month/year boundary, delayed-source receipt, unknown anchor and no-deadline cases.

**Acceptance:** section 8 demo semantics have deterministic boundary fixtures. Missing policy or date never becomes an invented due date; pauses/extensions require authority and reason.

### T023 — Durable timer lifecycle and restart reconciliation

**P0 · L · Owner: BE + OPS · Depends: T022, T007 · Maps: CLK-02; AT-07–08**

- [ ] T023.1 Persist engine timer jobs and domain deadline generation; prevent competing independent clock schedulers.
- [ ] T023.2 Atomically invalidate obsolete unsent jobs on extension/resolution and create the replacement generation.
- [ ] T023.3 Add missed-timer recovery sweeper, lock/retry policy, dead-letter inspection and lag metrics.
- [ ] T023.4 Exercise browser closure, worker crash, dependency outage and concurrent due-state change.

**Acceptance:** valid due work survives restart and meets declared recovery target; one logical escalation per rule/subject/generation. Old reminder generation cannot send after an observed accepted extension.

## E07 — EVC coordination and scheduling

### T024 — EVC eligibility, assignment and lifecycle

**P0 · L · Owner: BE + FE · Depends: T017, T022, T008 · Maps: EVC-01; AT-10**

- [ ] T024.1 Create eligible queue only after configured prerequisites and authorised outcomes.
- [ ] T024.2 Store authorised expert pool, selection result/method, committee mandate, availability, exclusions and mode.
- [ ] T024.3 Implement proposed/confirmed/cancelled/rescheduled/conducted/report-pending/outcome-recorded history.
- [ ] T024.4 Expose scoped visit pack, institution availability and report/outcome tasks.

**Acceptance:** incomplete review prevents eligibility; schedule confirmation cannot mark visit conducted. Completed visit with missing report stays pending; committee selection is not silently re-optimised.

### T025 — Bounded constraint scheduler and guarded reservation

**P0 · L · Owner: BE/planning · Depends: T024, T004, T023 · Maps: EVC-02, PLN-02; AT-10–11**

- [ ] T025.1 Encode precedence, supplied committee eligibility/composition, availability, permitted slots and resource non-overlap in CP-SAT.
- [ ] T025.2 Preserve authorised selection and freeze confirmed bookings; document hard constraints and soft objectives.
- [ ] T025.3 Return optimal/feasible/infeasible/unknown/model-invalid/missing-data status with constraints and assumptions.
- [ ] T025.4 Revalidate/reserve atomically under current versions; race two confirmations against one slot.

**Acceptance:** zero hard-constraint violations in reference fixtures; one concurrent booking wins and the other conflicts. Late feasible plan differs from infeasibility; timeout is not proof of impossibility.

### T026 — Cancellation recovery and richer EVC calendars

**P1 · L · Owner: BE/planning · Depends: T025, T014 · Maps: EVC-03; AT-10–11**

- [ ] T026.1 Add owner-validated visit-mode, travel/buffer and richer availability constraints.
- [ ] T026.2 Attempt local rescheduling first; quantify affected bookings and disruption.
- [ ] T026.3 Require authority for confirmed-booking displacement and retain prior confirmations/notifications.

**Acceptance:** cancellation never silently shifts another confirmed visit. Every proposed change remains feasible under current committee and calendar policy.

## E08 — Secure evidence and document validity

### T027 — Quarantined document upload and versioned storage

**P0 · L · Owner: BE + SEC · Depends: T006, T007, T008 · Maps: DOC-01, DOC-03; AT-04, AT-15**

- [ ] T027.1 Add scoped short-lived upload intents, checksum/finalisation, document categories and immutable versions.
- [ ] T027.2 Quarantine until type/content/size/decompression and malware checks pass; isolate parsers and fail closed on scanner outage.
- [ ] T027.3 Add authorised download capabilities, retention class, access audit and private object-store controls.
- [ ] T027.4 Test cross-institution access, disguised content, oversized/compressed inputs and safe external-link/SSRF policy.

**Acceptance:** unscanned/unsafe objects cannot be distributed; prior versions remain intact; hash proves content identity only. No public bucket or arbitrary URL fetching is required.

### T028 — Document metadata, date provenance and version-specific review

**P0 · M · Owner: BE + FE · Depends: T027, T015 · Maps: DOC-01, CMP-02; AT-12–13**

- [ ] T028.1 Store issue/effective/expiry dates, issuer/reference, campus coverage and manual/extracted/confirmed provenance.
- [ ] T028.2 Support unknown, ambiguous, event-dependent and no-expiry values; add review task instead of guessing dates.
- [ ] T028.3 Review exact version and preserve reviewer/outcome/observations; protect current accepted-version pointer.

**Acceptance:** `04/05/2027` without defined interpretation requires confirmation; replacement upload cannot overwrite an accepted document or its review history.

### T029 — Expiry, remaining-validity and renewal workflows

**P0 · L · Owner: BE + FE · Depends: T028, T022, T023 · Maps: DOC-02–03; AT-08, AT-12**

- [ ] T029.1 Evaluate requirement applicability, stated expiry, minimum remaining validity, coverage and configured event horizon separately.
- [ ] T029.2 Create explainable findings and renewal work with rule/date evidence.
- [ ] T029.3 Implement notified/submitted/under-review/clarification/rejected/accepted replacement lifecycle.
- [ ] T029.4 Re-evaluate only linked dependencies on accepted replacement and retain previous findings/history.

**Acceptance:** valid-but-insufficient lease is detected; unverified renewal does not resolve expiry. A timely upload changes pending-action responsibility without falsifying accepted-document validity.

## E09 — Undertakings and compliance

### T030 — Source-linked obligation register and deadline activation

**P0 · M · Owner: BE + FE · Depends: T019, T028, T022 · Maps: CMP-01; AT-13**

- [ ] T030.1 Create one obligation per approved condition with order/passage, applicability, required evidence, owner and verifier.
- [ ] T030.2 Require confirmed deadline derivation or an explicit ambiguity task before activation.
- [ ] T030.3 Add institution and official views with due basis and linked evidence/dependencies.

**Acceptance:** two conditions with different dates create two obligations; missing/ambiguous date is unresolved rather than inferred. Closing approval processing leaves active obligations monitored.

### T031 — Evidence submission, clarification and verified compliance

**P0 · L · Owner: BE + FE · Depends: T030, T023 · Maps: CMP-02; AT-08, AT-13**

- [ ] T031.1 Implement versioned submissions, receipts, review queue, clarification/rejection, partial evidence and permitted resubmission.
- [ ] T031.2 Separate lifecycle/timeliness and institution-response/official-verification responsibility.
- [ ] T031.3 Record exact accepted versions, authority and extension history; resolve dependent checks only after authorised acceptance.
- [ ] T031.4 Exercise reviewer reassignment, unauthorised closure, timely upload awaiting review and late acceptance.

**Acceptance:** evidence upload never automatically closes an obligation. Original due and late/on-time history survive acceptance/extensions; verification delay does not appear as missing institutional submission.

### T032 — Shared evidence dependency propagation

**P1 · M · Owner: BE · Depends: T029, T031 · Maps: CMP-02, DOC-03, WF-04**

- [ ] T032.1 Generalise typed dependency links among documents, conditions, findings and task prerequisites.
- [ ] T032.2 Re-evaluate impacted checks idempotently on accepted/revoked/superseded evidence; retain causality.
- [ ] T032.3 Show affected-case preview before bulk replacement/reverification.

**Acceptance:** a changed campus-specific document cannot resolve unrelated-campus obligations. Repeated change event causes one effective re-evaluation outcome per version.

## E10 — Notifications and responsibility-aware escalation

### T033 — Versioned notification policy and recipient resolver

**P0 · M · Owner: BE + product · Depends: T015, T022, T009 · Maps: ALT-01, ALT-03; AT-08–09**

- [ ] T033.1 Configure triggers, offsets, templates, channels, repeats/max repeats, resolution and escalation destinations.
- [ ] T033.2 Resolve recipients from current responsible action and effective assignment; quarantine missing/ambiguous destination.
- [ ] T033.3 Provide sanitised link-based templates with due basis and source freshness; label demo intervals.

**Acceptance:** officer-review wait resolves to the configured official escalation, not a missing-evidence accusation. Failed channel routes technical alert to operations; no guessed personal recipient.

### T034 — Reliable dispatch, delivery ledger and state recheck

**P0 · L · Owner: BE + INT · Depends: T033, T023, T007, T031, T029 · Maps: ALT-02; AT-07–09**

- [ ] T034.1 Implement in-app and test-email adapters driven by outbox/persisted jobs, stable logical notice keys and bounded retries.
- [ ] T034.2 Re-read current obligation/task/deadline generation and responsibility immediately before dispatch; cancel obsolete unsent notices.
- [ ] T034.3 Record queued/dispatching/provider-accepted/delivered/failed/unknown states; verify and deduplicate callbacks.
- [ ] T034.4 Handle timeout-after-send without claiming exactly-once external delivery; use provider-supported dedup/reconciliation where available.

**Acceptance:** AT-08/09 pass; on-time observed submission suppresses obsolete unsent missing-submission notice. If state changes after dispatch or an event arrived late, audit ordering is explicit rather than claiming the notice could be recalled.

### T035 — Escalation ledger, closure and notification operations

**P0 · M · Owner: BE + FE · Depends: T034 · Maps: ALT-03; AT-08–09**

- [ ] T035.1 Add escalation subject, pending action, level, authority, repeat/resolution state and evidence links.
- [ ] T035.2 Resolve/cancel future escalation when conditions change; preserve earlier notices and authority history.
- [ ] T035.3 Expose failed/unknown delivery and dead-letter handling with safe operator actions.

**Acceptance:** reassignment changes future recipient without altering history; same unresolved generation does not multiply escalations on replay. Deadline expiry never cancels approval.

## E11 — Case Readiness and Recovery Planner

### T036 — Explain evidence-linked readiness and remaining scenarios

**P0 · L · Owner: BE/planning · Depends: T017, T022, T025, T028, T030 · Maps: PLN-01; AT-11**

- [ ] T036.1 Build rule/evidence/dependency-backed readiness result with ready/blocked/unknown states and missing inputs.
- [ ] T036.2 Instantiate remaining task nodes/iterations for bounded outcome scenarios; include unresolved future review outcomes explicitly.
- [ ] T036.3 Compute precedence-only calendar bounds, duration assumptions and freshness checks.

**Acceptance:** submitted-but-unverified evidence blocks only the configured prerequisites; stale or missing inputs suppress executable advice. Re-review loops are not mistaken for a globally acyclic process.

### T037 — Resource-aware baseline and recovery alternatives

**P0 · L · Owner: BE/planning · Depends: T036 · Maps: PLN-02; AT-10–11**

- [ ] T037.1 Reuse EVC resource constraints for baseline and permitted alternative plans; freeze confirmed bookings by default.
- [ ] T037.2 Version objective/weights, durations, planning horizon and scenario assumptions; separate deadline/target/estimate.
- [ ] T037.3 Show schedules, slack, blockers, affected cases, disruption and solver status/runtime.
- [ ] T037.4 Enforce declared case/expert/horizon/branch/time limits and safe unknown/model-invalid responses.

**Acceptance:** demonstrate a blocked case, shared-capacity bottleneck, feasible alternative and disallowed ineligible-expert option. Feasible late, missing data, proven infeasible and timeout are distinct. No predicted approval probability.

### T038 — Proposal review and controlled execution

**P0 · L · Owner: BE + FE · Depends: T037, T011, T025, T009 · Maps: PLN-03; AT-05, AT-11**

- [ ] T038.1 Persist proposal input versions, assumptions, expiry, approver scope, affected bookings and delta preview.
- [ ] T038.2 Revalidate permissions, source/policy/calendar/evidence versions and prerequisites before reserved actions.
- [ ] T038.3 Execute through normal domain commands; expose acknowledgement and any partial/unknown external outcomes.
- [ ] T038.4 Reject/recompute stale proposals; record approval/rejection/execution lineage.

**Acceptance:** source/calendar change between plan and click yields conflict with no invalid booking. An unverified prerequisite permits only a labelled contingent proposal, not premature confirmed progression. Repeated execute call has one logical effect.

## E12 — Contextual interface, dashboards and reporting

### T039 — Embedded case workspace and institution task flows

**P0 · L · Owner: FE + UX · Depends: T003, T008, T017, T027 · Maps: UX-01; AT-04, AT-20**

- [ ] T039.1 Build reusable context module for host ID, official/orchestration state, rule explanation, task/actions, freshness and command receipts.
- [ ] T039.2 Implement institution deficiency/compliance/renewal forms and evidence-version states against actual APIs as available.
- [ ] T039.3 Add focus management, accessible validation, duplicate-click handling, safe drafts and explicit blocked/error/unknown states.
- [ ] T039.4 Validate embedding origin/CSP/session behaviour with the reference host; no host-session cookie copying.

**Acceptance:** core flow works from host context with independent backend authorisation. Pending host confirmation and unverified evidence are clear. Keyboard-only user can submit and retrieve a receipt.

### T040 — Role-based queues, EVC and planner interfaces

**P0 · L · Owner: FE · Depends: T039, T024, T031, T038 · Maps: UX-01, IAM-01; AT-10–11, AT-20**

- [ ] T040.1 Provide institution, reviewer, Region/Bureau and committee queues with scope-limited filters/actions.
- [ ] T040.2 Build EVC schedule/report views and planner baseline/alternative/delta review; show constraints and assumptions.
- [ ] T040.3 Add authorised evidence review and extension/return reason forms; preserve meaningful source receipts.

**Acceptance:** every role sees permitted tasks and failure states; no private evidence leaks through hidden client payloads. Approval/recommendation/completion remain distinguishable in text.

### T041 — Pendency metrics, aggregates and bottleneck drill-down

**P0 · L · Owner: BE + FE · Depends: T019, T022, T024, T031, T029 · Maps: DSH-01–02; AT-04, AT-14**

- [ ] T041.1 Implement PRD metric dictionary, scoped projections and reliable event-driven refresh/reconciliation.
- [ ] T041.2 Separate application/task/visit/obligation counts; show calendar/policy/stage age, due/overdue, median/p90 and sample sizes.
- [ ] T041.3 Add blocker-based explanations, historical ownership and non-overlapping delay treatment.
- [ ] T041.4 Verify known totals, projection lag and case-level drill-down under role scopes.

**Acceptance:** counts reconcile with seeded records and no double-counting. Poll/import freshness remains explicit; elapsed review is not reported as active work hours or causal blame.

### T042 — Six consolidated reports and safe scoped exports

**P0 · L · Owner: BE + FE · Depends: T041, T035, T007 · Maps: RPT-01; AT-04, AT-14–15**

- [ ] T042.1 Implement pendency, EVC, undertakings, validity, overdue and regional-performance templates.
- [ ] T042.2 Capture consistent reference snapshot/time, filters, scope, definitions, policy versions and freshness; retain immutable generated output.
- [ ] T042.3 Define transfers/reopening/withdrawals/cohorts and closure-versus-approval labels.
- [ ] T042.4 Add async export, authorisation recheck/expiry, audit and spreadsheet-formula neutralisation.

**Acceptance:** seeded known totals reconcile; prior saved output stays stable after Region reassignment. Export obeys the caller's current mandate and does not rank officials using unexplained raw counts.

### T043 — Retained analytical snapshots and historical regeneration

**P1 · L · Owner: BE/data · Depends: T042 · Maps: RPT-02; AT-14**

- [ ] T043.1 Retain versioned source/input snapshots and metric definitions under approved retention.
- [ ] T043.2 Regenerate historical reports from snapshot with ownership-at-time and effective-date semantics.
- [ ] T043.3 Validate retention/disposal, denied access and expired-source behaviour.

**Acceptance:** repeated generation from the same retained snapshot produces the same totals/rows; current operational changes cannot rewrite historical interpretation. Unavailable disposed inputs yield an explicit limitation.

## E13 — Audit reconstruction and tamper evidence

### T044 — Complete correlated audit coverage and case-history view

**P0 · L · Owner: BE + QA + FE · Depends: T007, T019, T029, T031, T035, T038 · Maps: AUD-01; AT-17**

- [ ] T044.1 Review coverage across workflow, assignments, evidence, deadlines, rules, alerts, escalation, proposals, source commands and sensitive exports.
- [ ] T044.2 Add case-history reconstruction with exact rule/evidence versions and server/source time distinction.
- [ ] T044.3 Add correction events and protected audit export/evidence manifest; exclude secrets and raw unnecessary evidence text.
- [ ] T044.4 Validate full seeded action-to-audit coverage and denied export paths.

**Acceptance:** auditor can reconstruct who acted, under which mandate/rule, on which evidence and with what source acknowledgement. Ordinary correction cannot overwrite original events.

### T045 — Canonical audit chain, signed checkpoint and verification

**P1 · L · Owner: SEC + BE + OPS · Depends: T044, T048 · Maps: AUD-02; AT-17**

- [ ] T045.1 Define canonical event encoding/ordering, chain scope, hashes and verification algorithm.
- [ ] T045.2 Sign/export checkpoints to separately controlled storage with key rotation and access separation.
- [ ] T045.3 Demonstrate synthetic modification/deletion detection and append correction; document fully privileged compromise limits.
- [ ] T045.4 Add checkpoint-failure alerting and verification/retention runbook.

**Acceptance:** controlled tamper cases are detected against a protected checkpoint; hashes alone are never called tamper-proof or proof of truthful input. Prototype evaluation may include an isolated proof before managed key custody is complete.

## E14 — Deployment, reliability, security and governance

### T046 — Authenticated staging deployment and reproducible release

**P0 · L · Owner: OPS + BE · Depends: T005, T007, T008, T027 · Maps: OPS-01; AT-18**

- [ ] T046.1 Build versioned containers, environment configuration and repeatable local/staging deployment; use approved hosting/account.
- [ ] T046.2 Configure HTTPS, private persistent database/evidence, least-privilege service credentials and test channel providers.
- [ ] T046.3 Add migrations, deployment smoke check, backup procedure and rollback/reconciliation instructions.
- [ ] T046.4 Enforce synthetic staging banner and disable fault controls/test clock in production configuration.

**Acceptance:** clean deployment works and survives application replacement without losing authoritative data. No publicly exposed unauthenticated reference-host mutation or real unapproved records. Public deployment/account changes still follow actual tool/owner authorisation.

### T047 — Recovery instrumentation, fault drills and basic restore

**P0 · L · Owner: OPS + QA · Depends: T046, T023, T011, T034 · Maps: OPS-01, NFR-04–05; AT-05, AT-07–09, AT-18**

- [ ] T047.1 Add telemetry for timer/outbox lag, sync age, unknown writebacks, dead letters, scanning and planner failures; set actionable test alerts.
- [ ] T047.2 Exercise worker/database restart, connector/mail/object-store outage, expired credential and partial command scenarios.
- [ ] T047.3 Restore database and evidence into an isolated environment; verify references, jobs, receipts and audit continuity before outbound effects resume.
- [ ] T047.4 Document operator actions and safe replay/reconciliation limits; measure actual recovery/lag.

**Acceptance:** a working restore and timer recovery are evidenced; no untested RPO/RTO claim. Health/readiness reflects degradation and restored timers do not duplicate business actions.

### T048 — Security threat review and privacy/records matrix

**P0 · L · Owner: SEC + product + OPS · Depends: T001, T008, T027, T046 · Maps: PRD §12; NFR-02, NFR-10; AT-04, AT-15**

- [ ] T048.1 Threat-model cross-scope access, replay/stale actions, upload/SSRF, connector compromise, callback forgery, audit tampering and export leakage.
- [ ] T048.2 Check session/CSRF/CORS/CSP/secret controls, retention classes, sensitive-log redaction and safe download capabilities.
- [ ] T048.3 Draft DPDP commencement/applicability, CERT-In incident/log applicability, lawful purpose/roles, retention/holds/disposal and approved data-path matrix.
- [ ] T048.4 Record real-data/hosting approvals still required and assign incident/support contacts.

**Acceptance:** critical prototype exposure/access findings resolved before G2. Synthetic-only prototype can proceed with clearly unapproved real-data matrix; G3 requires authorised applicability and records decisions. No inference that India hosting alone establishes compliance.

### T049 — Managed pilot resilience, retention and operational handover

**P1 · L · Owner: OPS + SEC + sponsor · Depends: T014, T047, T048; external D09–D12 · Maps: OPS-02, NFR-07–08; AT-18; G3**

- [ ] T049.1 Confirm approved region/cloud/network/data paths, procurement, access model, budget and support ownership.
- [ ] T049.2 Configure managed database backup/PITR/availability, private storage, secrets/key rotation and optional queue/DLQ where justified.
- [ ] T049.3 Implement approved retention, legal holds and authorised disposal across database, evidence, logs, reports and backups; validate irreversible locks before activation.
- [ ] T049.4 Measure restore/failover against agreed RPO/RTO; hand over runbooks, service dashboards, access review and incident reporting.

**Acceptance:** committed pilot targets have measured evidence and named operators; every data path is approved. If a recovery target fails, record actual capability and remediation before pilot commitment.

## E15 — Verification, evaluation and release evidence

### T050 — Cross-module correctness and security scenario suite

**P0 · L · Owner: QA + module owners · Depends: T019, T023, T025, T029, T031, T035, T038, T042, T044 · Maps: AT-01–17, NFR-01–02**

- [ ] T050.1 Assemble deterministic route, clock, scope, source-version, evidence, EVC and reporting fixtures from the PRD acceptance matrix.
- [ ] T050.2 Run meaningful unit/contract/integration tests plus end-to-end journeys for concurrency, replay, missing mappings and negative outcomes.
- [ ] T050.3 Validate audit completeness and logical deduplication under fault/recovery scenarios; inspect external unknown-state handling.
- [ ] T050.4 Publish requirement → test → evidence mapping and unresolved-defect list.

**Acceptance:** every P0 requirement has evidence; no unresolved critical auth defect, invalid supported route, missing timer recovery or falsely verified compliance. P1-only acceptance portions remain explicitly pending.

### T051 — Planner baselines, ablations and explanation evaluation

**P0 · L · Owner: QA/planning · Depends: T037, T038, T025 · Maps: PLN-04; AT-19**

- [ ] T051.1 Implement FIFO + reminders, earliest-deadline-first and dependency-only baselines under identical allowed actions/constraints.
- [ ] T051.2 Generate held-out synthetic workloads, fixed seeds, overload, cancellations, missing inputs and timeout cases.
- [ ] T051.3 Record late count, weighted lateness, violations, disruption, load balance, runtime and raw schedules; validate with an independent constraint checker.
- [ ] T051.4 Review representative explanations with a process reviewer; report variation, assumptions and limits.

**Acceptance:** all algorithms face the same data and constraints; hard violations are reported as defects. Report may show no improvement; it must not fabricate savings, patent novelty or AICTE-wide outcomes.

### T052 — Load, alert timeliness and accessibility validation

**P0 · L · Owner: QA + FE + OPS · Depends: T040, T041, T047 · Maps: NFR-03–06, NFR-09; AT-18, AT-20**

- [ ] T052.1 Seed proposed PRD workload; run 50-session read/dashboard test and 1,000 eligible jobs/min for ten minutes with declared hardware/payloads.
- [ ] T052.2 Measure p95 API, projection and eligibility-processing latency separately from source lag/external delivery; capture errors and recovery results.
- [ ] T052.3 Run automated accessibility checks and manual keyboard/screen-reader core journeys; verify date/status/error comprehension.
- [ ] T052.4 Fix blocking regressions and document measured limits; broaden tests only if findings justify it.

**Acceptance:** proposed targets are measured honestly; missed targets have actionable remediation or explicit scope revision. Non-colour states, accessible forms and core keyboard journeys work.

### T053 — Produce complete prototype demonstration and G2 dossier

**P0 · M · Owner: product + QA · Depends: T050, T051, T052, T047, T048 · Maps: G2; PRD §14.2**

- [ ] T053.1 Script and rehearse host event/routing, deficiency, EVC/planner, decision, undertaking, renewal race, outage/restart and report/audit journey.
- [ ] T053.2 Package seed/reset instructions, test results, sample receipts/reports, architecture, known limits and reference-host disclosure.
- [ ] T053.3 Review A–F traceability, human-oversight guardrails and G2 blockers; keep P1/P2 demonstrations labelled separately.
- [ ] T053.4 Record owner feedback and prioritised pilot fixes without claiming live AICTE integration.

**Acceptance:** evaluators can reproduce server behaviour, not just view mock screens. All P0 acceptance evidence is discoverable and incomplete external authorisations remain visible.

### T054 — Pilot authorisation, user evaluation and G3 review

**P1 · L · Owner: sponsor + process owner + product/QA · Depends: T014, T016, T020, T026, T032, T043, T045, T049, T053 · Maps: G3; AT-16–19**

- [ ] T054.1 Sign off current rule corpus, routes, committee rules, evidence/clock/escalation policy and connector authority for pilot scope.
- [ ] T054.2 Complete privacy/security/hosting/accessibility/records review, support coverage and real-data migration reconciliation.
- [ ] T054.3 Run consented task timing/usability study against current workflow; collect baseline/assisted task times and manual follow-ups with context.
- [ ] T054.4 Record pilot acceptance, residual risks, actual service levels and expansion decision.

**Acceptance:** named authorities approve the concrete pilot scope; operational and data approvals are present. Benefit claims are supported by actual pilot measurements and clearly separated from synthetic scheduler results.

## E16 — Optional measured expansion

### T055 — Assisted extraction of obligations and document dates

**P2 · L · Owner: AI/BE + SEC + compliance owner · Depends: T054, T028, T031; approved inference/data path · Maps: AI-01; AT-12–13, AT-15**

- [ ] T055.1 Add OCR/structured extraction in an approved isolated environment with source passage/page references and uncertainty fields.
- [ ] T055.2 Validate dates and evidence checklists; present a draft that an official confirms before activation.
- [ ] T055.3 Test prompt injection, ambiguous dates, low-quality scans, multiple conditions and unsupported text; minimise retained prompts.
- [ ] T055.4 Evaluate extraction accuracy/recall and review effort on an approved labelled dataset; compare manual structured entry.

**Acceptance:** no extracted rule/obligation/deadline auto-activates; uploaded instructions cannot invoke tools, publish policy or send messages. Keep the feature only if measured value justifies cost and review burden.

### T056 — Owner-approved Chromium contextual side panel

**P2 · L · Owner: FE/extension + SEC · Depends: T039, T038, T048; external D11 · Maps: UX-02; AT-04, AT-07, AT-20**

- [ ] T056.1 Validate managed-browser permissions/origins; implement MV3 side panel with minimum host permissions/user-triggered context capture.
- [ ] T056.2 Authenticate independently with approved flow; recognise only allowlisted stable fields and packaged versioned adapters.
- [ ] T056.3 Treat page ID as untrusted context; fail safely on unsupported pages/DOM changes and display source state/freshness.
- [ ] T056.4 Demonstrate timers continue while browser/extension is closed; verify no cookies/passwords/client secrets captured.

**Acceptance:** forged page context cannot access another case; extension does not claim whole-region visibility or source update without supported connector acknowledgement. No blanket compatibility claim.

### T057 — Validated duration models and process conformance analysis

**P2 · L · Owner: data/planning + process owner · Depends: T054, T051 · Maps: PLN-02–04; G4**

- [ ] T057.1 Assess representative lawful historical data, missingness, censoring, category mix and drift before modelling.
- [ ] T057.2 Compare calibrated duration estimates against explicit static assumptions on held-out data; expose uncertainty and provenance.
- [ ] T057.3 Add observed-versus-prescribed path analysis with authorised exception handling and privacy-aware reporting.

**Acceptance:** models improve an agreed measured outcome without overriding hard rules. No approval-likelihood score or causal officer-blame inference. Insufficient data keeps transparent configured durations.

### T058 — Additional sanctioned channels, integrations and deployment targets

**P2 · L · Owner: INT + OPS + product · Depends: T054, T014, T034 · Maps: INT-05, ALT-01–03, OPS-02; G4**

- [ ] T058.1 Prioritise an additional owner-authorised connector or channel using measured pilot gaps and approved recipient/data policy.
- [ ] T058.2 Add adapter contract tests, provider-specific delivery semantics, costs, credential rotation and support runbook.
- [ ] T058.3 Validate an approved alternate deployment target by replacing storage/queue/secrets/observability interfaces and repeating restore/security checks.

**Acceptance:** no integration bypasses authority/version/freshness controls; channel acceptance is not falsely called delivery. Portability is proven by a tested target, with migration work documented.

## 4. Requirement-to-ticket index

| PRD IDs | Implementation tickets |
|---|---|
| INT-01 | T001, T010, T013 |
| INT-02 | T007, T010, T012, T013 |
| INT-03–04 | T011, T012, T047 |
| INT-05 | T014, T058 |
| IAM-01–02 | T008, T009, T048 |
| POL-01–02 | T002, T015, T016 |
| WF-01–03 | T017, T018, T019 |
| WF-04–05 | T020, T021 |
| CLK-01–02 | T022, T023 |
| EVC-01–03 | T024, T025, T026 |
| CMP-01–02 | T030, T031, T032 |
| DOC-01–03 | T027, T028, T029, T032 |
| ALT-01–03 | T033, T034, T035 |
| PLN-01–04 | T036, T037, T038, T051 |
| DSH-01–02 | T041 |
| RPT-01–02 | T042, T043 |
| AUD-01–02 | T007, T044, T045 |
| UX-01–02 | T003, T039, T040, T052, T056 |
| AI-01 | T055 |
| OPS-01–02 | T004, T005, T046, T047, T048, T049, T058 |
| NFR-01–02 | T008, T017, T050 |
| NFR-03–06 | T025, T037, T041, T047, T052 |
| NFR-07–08 | T049 |
| NFR-09–10 | T039, T044, T048, T052 |

## 5. External blockers and controlled rollout checklist

| Blocking decision | Dependent production action | Prototype work that continues |
|---|---|---|
| D01–D02 host/authority | T014 real access and T054 pilot | T013 reference host; T010–T012 contracts/fault handling |
| D03–D04 current rules/branch authority | Production T015 publication and T054 | T002 synthetic fixtures; T017–T019 route mechanics |
| D05 committee policy | Real T024–T026 allocation | Labelled expert pool, constraint correctness and scheduling demos |
| D06–D08 clocks/evidence/escalation | Real deadlines, findings and external notices | Explicit synthetic calendars/conditions, test mail, renewal race |
| D09–D10 scale/budget/hosting/records | T049 commitments and real-data deployment | Local/staging synthetic load, restore, cost model and applicability draft |
| D11 managed embedding/extension | Real host embedding or T056 | Reference-host contextual UI and backend access tests |
| D12 support/signatories | T054/G3 acceptance | Runbooks, operational drills and proposed owner matrix |

Before G2, confirm all P0 parents and subtickets are complete with evidence, supported routes/guards are correct, scope isolation passes, timer/source recovery and basic restore work, and the whole PS is demonstrated. Before G3, additionally complete P1 and concrete external approvals. No backlog checkbox substitutes for a competent authority's regulatory decision.
