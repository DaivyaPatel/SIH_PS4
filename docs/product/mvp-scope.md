# MVP scope and five core journeys

Date: 25 October 2026 | Status: working prototype delivery baseline under the master PRD

Authority: [master PRD](../../files/MASTER_PRD.md); implementation dependencies: [backlog](../../files/tickets.md). This fixes prototype scope and acceptance boundaries. It is not an AICTE process approval, an implementation claim or a commitment to a calendar delivery date.

## Delivery assumptions

Use the selected synthetic reference host and a contextual interface backed by the service. Preserve the host/source-of-truth separation in the [integration decision](../discovery/integration-mode.md). Dataset identities, orders, rules, calendars, documents, committee members and decisions are fabricated and visibly labelled. No actual portal, institutional evidence or external recipient is needed.

The project coordinator is provisionally Daivya Patel. Team size, named implementation owners, demo deadline and budget remain unspecified. Sequence work by dependencies; assign dates and parallel work only after capacity is supplied. The absence of a schedule does not prevent the technology proof and synthetic implementation.

## Release boundary

| Release | Deliverable scope | Acceptance boundary |
|---|---|---|
| P0 | Three synthetic routes, deficiency/re-review and conditional SHC/SAC branches; backend scopes; durable clocks; bounded EVC scheduling; undertakings; document validity/renewal; state-aware in-app/test-mail alerts; scoped dashboards/reports; correlated audit; readiness/recovery planner; reference connector and import fallback; authenticated staging and basic restore | Complete PS A–F demonstration with working backend/connector/timers, not screens alone; all P0 guards and recovery evidence required |
| P1 | Sanctioned real connector, second adapter, compound requests, rule-impact/migration tooling, richer EVC calendars, retained analytical snapshots, independently protected audit checkpoints, managed operational and records controls | Named authorities, current policy corpus, approved data/hosting, reconciliation and measured pilot recovery/service levels |
| P2 | Additional integrations/channels, optional approved extension, assisted OCR/extraction, validated duration models and deeper process conformance | Measured benefit, suitable lawful data, approved inference/external services and support capacity |

Basic policy review/publication, immutable versions, safe uploads, scopes, replay protection and audit are P0. P1 adds depth; it does not postpone integrity. An isolated signed-checkpoint experiment may be shown early, but managed key custody is P1. Full historical regeneration is P1; immutable generated report output is P0.

Do not add a replacement approval/fee portal, autonomous regulatory decision/sanction, generic chatbot, fraud certification, blockchain, universal scraping or production ML risk probabilities to P0. A database, message sink and solver will be selected/installed in later work after compatibility checks; no new provider/key is required for this discovery baseline.

## Representative personas

| Persona | Daily objective | Scope and authority limit |
|---|---|---|
| Institution representative | Understand next action and submit requested evidence | Own authorised institution/campus; cannot verify its own compliance |
| Assigned scrutiny/re-review official | Review exact versions, record findings/outcome and next task | Assigned case and permitted action; recommendation does not grant approval |
| Regional officer/coordinator | Find ageing work, assign permitted tasks and coordinate EVC | Delegated Region/mandate; technical access does not confer final authority |
| EVC coordinator/reporter | Allocate permitted slots, conduct visit and submit report | Authorised committee/calendar; schedule, visit, report and outcome are distinct |
| Compliance verifier | Review conditions/renewals and record acceptance/rejection | Assigned condition/document/version; upload is not verification |
| Competent/hearing/appeal actor | Perform its particular decision/recommendation mandate | Separate effective assignments for each function; no universal committee role |
| Bureau oversight/auditor | Inspect scoped pendency, reports and action history | Explicit cross-region or audit mandate; no aggregate/export scope bypass |
| Integration/operations support | Recover sync, unknown writes and failed technical jobs | Technical metadata and safe reconciliation; no statutory decision authority |

These are scenario roles, not names of appointed officials. Actual permissions follow the [authority matrix](../discovery/ownership-and-authority.md).

## J01 — Route an application and explain the permitted next step

**Actor:** assigned official; source is the synthetic host. **Trigger:** authenticated submission event for a mapped synthetic category/year. **Preconditions:** source entitlement, scoped identity, approved-for-demo policy and versioned source record.

Open the same case in the reference host and contextual workspace. Ingest and receipt the event; show source status, orchestration status and freshness separately. Explain the selected route, rule version, evidence prerequisites and next role. Record an authorised review outcome and show the permitted next task. A negative recommendation goes to competent decision work, not automatic refusal.

**Branches:** unknown category/year becomes policy clarification; duplicate event does not create another task; stale/concurrent action conflicts; a host-accepted action with lost acknowledgement stays outcome unknown until reconciliation. No internal task completion displays official approval.

**Done evidence:** source event/command receipts, exact next task, denied-role and duplicate checks, correlated audit. **Maps:** PS A/B/F; INT-02–04, POL-01, WF-01/WF-03, IAM-01, AUD-01; AT-01/03/04/05.

## J02 — Resolve a deficiency through a versioned re-review

**Actors:** assigned reviewer and institution representative. **Trigger:** reasoned permitted deficiency. **Preconditions:** identified finding, correction scope, evidence checklist and approved due basis.

Record deficiency IDs/reasons and a scoped response task. The institution submits partial or complete evidence with a durable receipt. Partial response remains pending; a complete permitted response queues a new review iteration. The reviewer checks the exact versions and records clarification, negative recommendation or permitted progression. Keep earlier findings, files and assessments.

**Branches:** reason missing, wrong institution/role, unsafe upload, incomplete response and further deficiency all retain an accurate pending action. Conditional SHC/SAC actions appear only under applicable mandates and confirmed triggers. No generic post-submission source editing is offered.

**Done evidence:** at least two review iterations, partial/complete receipts, rejected unauthorised transition and historical evidence lineage. **Maps:** PS A/B/D/F; WF-02, DOC-03, CMP-02, CLK-01, ALT-03, AUD-01; AT-02/04/13/15.

## J03 — Coordinate EVC and review a recovery proposal

**Actors:** coordinator, assigned committee/reporting actor and proposal approver. **Trigger:** EVC eligibility or a capacity/deadline blocker. **Preconditions:** confirmed prerequisite status and authoritative selection/eligibility/calendar data, all synthetic in P0.

Show eligible queue and why a case is not yet eligible. Preserve the authorised selection result. Generate a baseline and permitted alternatives using shared resources; display assumptions, target slack, affected cases and disruption. Reject ineligible or overlapping assignments. Review a proposal, revalidate current source/calendar/policy/evidence and reserve/command through the normal guarded path. Distinguish confirmation, conducted visit, report pending and recorded outcome.

**Branches:** missing data, infeasible model/horizon, feasible late schedule and timeout are distinct. A review-contingent slot is a proposal, not a premature confirmed booking. Changed source/calendar versions invalidate execution. Confirmed unrelated bookings remain fixed unless an explicit authorised change includes them.

**Done evidence:** shared-capacity bottleneck, feasible alternative, disallowed expert, stale proposal rejection and source acknowledgement. **Maps:** PS C/B/F plus planner; EVC-01–02, PLN-01–04, CLK-02, INT-03, AUD-01; AT-05/10/11/19.

## J04 — Monitor an undertaking without confusing submission and compliance

**Actors:** institution and verifier. **Trigger:** a synthetic competent source order with two separate confirmed conditions. **Preconditions:** source passage, required evidence, confirmed due derivation and assigned reviewer for each condition.

Activate separate obligations with distinct dates/checklists. Submit evidence; mark it submitted/awaiting review and preserve authoritative receipt time. The verifier reviews the specific version, requests clarification, rejects or accepts. A permitted extension keeps original/current due and authority; accepted evidence closes only the related requirement. Approval-processing closure does not close these obligations.

**Branches:** ambiguous dates require confirmation; timely evidence can await review; a rejected/replaced file does not inherit acceptance; unsupported closure is denied. Later sync cannot silently change the authoritative submission's timeliness.

**Done evidence:** two conditions, review-pending classification, version-specific outcome, original/current due and correct pending owner. **Maps:** PS D/B/F; CMP-01–02, DOC-01, CLK-01–02, ALT-03, AUD-01; AT-06/08/13.

## J05 — Renew a document and escalate the actual pending action

**Actors:** institution, verifier, designated escalation authority and operations. **Trigger:** expiry/remaining-horizon finding or approaching due action. **Preconditions:** accepted document version, applicable validity rule and observed source freshness.

Show expiry and remaining-validity findings separately. Institution uploads renewal near a scheduled reminder; retain the old accepted version, quarantine/receipt the new evidence and queue review. Recheck state before dispatch; cancel obsolete unsent missing-submission notices. If the old accepted document expires during review, retain that finding while directing the next verification action to the verifier. Acceptance re-evaluates only dependent findings. Test-channel outage is an operational failure, not proof of institutional non-compliance.

**Branches:** unknown/no-expiry dates, valid-but-insufficient lease, stale source, source write outcome unknown and provider receipt unknown are explicit. No automatic sanction follows a missed deadline. Notice already dispatched before the change cannot be recalled by changing history.

**Done evidence:** pending versus accepted renewal, race-safe notice classification, recipient change, outage recovery and linked alert/submission/review/audit history. **Maps:** PS E/D/F/B; DOC-01–03, ALT-01–03, INT-04, AUD-01; AT-07/08/09/12/15.

## Cross-cutting surfaces and complete PS coverage

| PS area | Journey proof | Horizontal evidence |
|---|---|---|
| A: workflow | J01/J02; applicable recommendation/decision path in J03 | Versioned rule explanations, mandatory reasons and source acknowledgement |
| B: dashboards/pendency/audit | J01–J05 create distinct waits | Institution/officer/Region/Bureau/committee views, known-count drill-down and complete correlated history |
| C: EVC | J03 | Eligible/scheduled/conducted/report-pending counts and correct due alerts |
| D: undertakings | J04 | Obligation counts distinct from application count; review responsibility visible |
| E: document validity | J05 | Expiry/horizon/renewal states, accepted-version evidence and verification |
| F: alerts/escalation/reporting | J04/J05 plus J01 unknown-write recovery | Six report templates, safe scoped export, source freshness and reproducible retained output metadata |

All five journeys must be demonstrable against working APIs and durable workers before G2. Dashboards and reports are not dropped simply because five narrative journeys carry most actions. Follow [UX flows](./ux-flows.md) for surfaces/states and the [measurement plan](../evaluation/measurement-plan.md) for proof.

## Implementation sequence and scope changes

Next prove stack compatibility and shared transactions. Then establish scoped auth, persistence/audit/inbox/outbox and synthetic connector; build routing/clock/evidence slices; add EVC/compliance/alerts; connect contextual UI/reports/planner; finish fault/load/accessibility/restore evidence. Modules may be developed in parallel only after their direct prerequisites.

Scope changes need a documented PRD/backlog delta and impact on acceptance, workload and dependencies. A short demo deadline may reduce dataset richness, optional channels or polish, but it cannot remove required authority boundaries, durable timers, complete PS coverage or falsely label unfinished backend behaviour complete. Any narrower release is explicitly a partial demonstration, not G2 completion.
