# AICTE approval workflow automation — research and master context for a PRD

Research date: 24 October 2026 (India). Target problem: SIH26262, Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System.

## 1. Product decision and how to use this document

Build an integration-first approval orchestration and compliance service that works around an existing authorised institutional/regulatory application. Preserve its existing user interface, records and statutory decision process wherever appropriate. Provide an embeddable task interface, optional Chromium browser side panel, API/connectors and a small administration/reporting console. The new service runs routing, durable deadlines, notifications, scheduling and compliance coordination continuously on the server.

This is a research brief and PRD input, not a claim that AICTE has approved the architecture or exposed an integration API. “Existing software” is not identified in the conversation. It could mean an institutional ERP, a team-owned application, or AICTE's existing portal; those have different permissions and capabilities. The PRD must support capability-based integration and name the actual first host system before implementation.

The user selected PS 4. Cover the complete eight-part PS, rather than drifting into PS 5's general forgery-detection platform. The user wants technical depth, defensible distinctiveness, a deployable end-to-end service, and demonstrable use with existing software rather than a replacement portal. Treat “ESPs” as a request for major distinguishing selling points/USPs, not as a defined technical acronym.

Evidence labels used here: VERIFIED = supported by the cited primary source; PROPOSED = product/engineering recommendation; UNKNOWN = requires owner confirmation. All targets, sample dates, scheduling durations and escalation policies are PROPOSED until authorised. No empirical improvement or selection probability is claimed.

## 2. Verified baseline and outstanding regulatory research

The APH 2024–2027 gives different routes by application type in Table 2.3. It distinguishes scrutiny, deficiency-focused re-scrutiny, EVC and conditional SAC/SHC involvement. SHC and SAC have different functions; appeals must not become a mandatory stage for every application. The base handbook includes a lease provision relating remaining validity to course duration, so expiry-only monitoring is insufficient. [S1]

AICTE publishes approval-process materials and an addendum/corrigendum for 2026–27. The full updated addendum was not successfully retrieved in this research. Do not present the base handbook as an exhaustive current rulebook. [S2]

No public, supported AICTE integration contract, service-account entitlement, production event feed or write API was established by the reviewed public materials. This is an evidence gap, not proof that private integrations do not exist. Do not reverse-engineer portal endpoints and call them supported APIs.

Before activating regulatory rules, an authorised process owner must confirm: applicable handbook and amendments; academic year/calendar; category-specific routing; permitted deficiency correction and appeal behaviour; committee formation and scheduling authority; composition, exclusions and visit modes; deadline clock/pause rules; undertaking evidence requirements; lease/document applicability; escalation recipients; and consequences requiring competent-authority action.

Produce an approved rule register with source document, clause/page, effective date, applicability, supersession relationship and owner. A model may assist extraction, but an official confirms the executable rule. Where sources conflict or applicability is unknown, route to policy clarification. Never let an LLM resolve regulatory conflicts autonomously.

## 3. How to integrate with existing working software

### 3.1 Recommended integration hierarchy

| Mode | Host capability | What the service can do | Boundary |
|---|---|---|---|
| API + events + embedded UI | Owner supports APIs, webhooks and SSO | Full routing coordination, authorised commands, evidence links, fresh dashboards | Best route; requires host changes and an agreed contract |
| Server-side connector + incremental polling | Supported read APIs/exports; limited events | Synchronise records, monitor deadlines and reconcile changes | Freshness bounded by polling; writeback only if supported |
| Embedded widget/SDK | Owner permits component integration | Put tasks and explanations inside existing application | Not automatically portable to an unmodified third-party portal |
| Browser side-panel extension | Owner permits extension use, no code access | Contextual deadlines, blockers, task links, assisted capture | Browser-visible context only; cannot see all regional cases or operate when closed |
| Signed/validated CSV or JSON import | Only authorised exports available | Start monitoring imported cases and produce reports | Batch freshness and provenance must remain visible |
| Attended browser automation/RPA | Explicit owner permission and stable supported UI | Limited repetitive interactions with confirmation | Fragile; cannot guarantee atomic writes; last resort |

A connector translates host-specific fields/statuses into a stable domain model. This resembles an anti-corruption layer: keep legacy semantics from leaking throughout the new service. [S3] The goal is coexistence and added orchestration, not obligatory replacement of the host.

### 3.2 Authority and system-of-record ownership

Define ownership per entity/field, rather than allowing two systems to edit everything:

- Host: institutional identity, submitted application facts, official decisions and source evidence where already authoritative.
- Automation service: workflow tasks, timers, notification ledger, planning runs, policy versions and integration receipts, to the extent delegated.
- Shared views: host status plus service status with explicit provenance. If the service owns a delegated workflow, the host must agree how its status is reflected.

Separate `observed source state`, `orchestration state`, `proposed action`, `writeback acknowledgement`, and `confirmed source state`. A recommendation is not an official portal update. Do not expose “approved” merely because an internal task ended.

Commands require host record ID, expected source version, idempotency key, actor/authority and correlation ID. Host-side validation remains mandatory. When the host cannot deduplicate or atomically reject stale updates, a timed-out write may have unknown outcome: reconcile before retrying. Never blindly repeat a potentially effective action.

### 3.3 Browser extension: valuable interface, limited authority

Chrome supports side-panel UI alongside a webpage. User-triggered `activeTab` access is temporary and narrower than unrestricted all-site access. Manifest V3 service workers can terminate when idle; server-side timers must remain authoritative. [S4–S6]

Recommended extension behaviour:

1. Enable only on approved origins and supported page types.
2. User opens side panel; adapter identifies a candidate case ID from a stable visible field.
3. Authenticate separately to the automation service through approved SSO.
4. Backend authorises access to that case; a page ID is context, not proof of entitlement.
5. Show source freshness, pending tasks, deadlines, rule explanations and source deep links.
6. Use normal backend commands only where an authorised connector exists.
7. Without supported writeback, provide proposals/assistance and clearly show that the official source has not changed.

Never copy session cookies/passwords or ask users to paste tokens. DOM observations are user-controllable and non-authoritative. Avoid whole-page scraping and transmitting unrelated personal data. Use allowlisted fields and redaction. Packaged adapters must be versioned, tested, and stop safely if the page structure changes. An extension cannot defeat CSP, cross-origin restrictions, CAPTCHA or server permissions by design. Assess frames, managed-browser policies and supported browser versions during discovery.

Prefer an embedded widget when the owner permits application changes; the extension is optional for legacy UX. No blanket claim that the extension works with any website.

## 4. End-to-end functional coverage of all eight PS points

### 4.1 Configurable approval workflow

Use versioned BPMN workflows and decision tables, or an equivalently explicit state model. Input application category, academic year, policy version, institution class, requested changes, prior outcomes and authorised exceptions. Output the route, next responsible role, prerequisites and explanation. Completion and favourable recommendation are distinct. Preserve deficiency IDs and repeated review cycles. Compound applications may require linked subcases, not a single flattened route.

Transitions must enforce authorisation, required evidence and valid prior state. Return/revert requires reasons and permitted scope. A final regulatory decision is a separately recorded competent-authority action. Model negative outcomes, hearings, appeals, withdrawals, transfers, holds and closure. Correctability after submission must come from applicable process rules, not a generic edit button.

Policy publication uses draft → reviewed → approved → effective → retired states. Separate rule author and publisher where required. Existing cases retain their evaluated rule version until an explicit migration decision; a lawful urgent change may require migration, so do not assume permanent pinning. Record impact preview and migration audit.

### 4.2 Real-time pendency and ageing dashboards

Count applications, tasks, visits and obligations separately. Show total calendar age, current-stage age, queue duration, institution-response duration and permitted policy-clock age. Pauses apply only where an approved rule permits them; always retain calendar time. No inference of actual working hours from page-open time.

Provide officer queues, regional stage/backlog views, management capacity views, committee assignments and institution next actions. Enforce role plus jurisdiction/assignment in backend access. Measure median and p90 durations and explain blockers using recorded reasons. Source freshness is a visible attribute; polling/imported records are not described as live.

### 4.3 EVC coordination and scheduling

Track eligibility, committee selection/authorisation, proposed/confirmed slots, cancellation, conducted visit, report pending and recorded outcome. Record authorised expert pool and applicable qualifications, availability, composition, exclusions, visit mode and time/travel constraints. Distinguish scheduling from committee selection: preserve any mandated selection/randomisation method. Do not replace it with optimiser preferences.

Use a constraint solver for permitted slot allocation. Hard constraints cannot be silently relaxed. Soft objectives can minimise weighted lateness, imbalance and rescheduling disruption. Return feasible schedules or a useful explanation of infeasibility, with timeout/unknown distinguished from proof of infeasibility. Actual visit duration and human outcomes are uncertain. [S12]

### 4.4 Undertaking compliance

Create one obligation per condition, linked to the originating approval/order and source passage. Record due-date derivation, required evidence, owner, reviewer, evidence versions and outcome. Separate status from timeliness: timely submitted evidence awaiting review is not missing evidence. OCR/LLM extraction can draft obligations but requires confirmation. Extensions preserve original dates, authority and reasons. Deadlines trigger follow-up, not automatic punitive action.

### 4.5 Lease/document validity

Track dates, scope, source, accepted version and applicable validity rule. Evaluate expiry, remaining validity and any relevant approval/event horizon where authorised. Support missing/ambiguous dates and documents without expiry. Renewal upload does not overwrite verified status; review is required. Propagate a document change only to the dependent checks/tasks after re-evaluation.

### 4.6 Notifications/escalations

Version trigger, offsets, recipients, templates, channels, repeats and resolution conditions. Recheck state immediately before send. Store schedule and delivery outcomes; provider acceptance is not delivered/read. A failed channel is a technical incident, not proof the institution ignored a notice. Identify whether the pending action belongs to institution, officer, committee or integration support. Cancel obsolete reminders on a changed deadline or resolution. Protect notification content; send links rather than confidential attachments by default.

### 4.7 Consolidated reports

Generate pendency, EVC, undertaking, validity, overdue and regional-performance reports from defined snapshots. Record filters, reference time, policy/metric definitions and access scope. Define transfer, reopening, withdrawal and cohort behaviour. Separate completion from approval. Provide drill-down only within permissions and safe exports that resist spreadsheet-formula injection. Preserve historical ownership/region context. Avoid performance rankings based on unadjusted case counts.

### 4.8 Audit

Capture actor/service, role, entity, action, server time, source-observed time, outcome, previous/new version, reason, authority, correlation ID and evidence/rule references. Correct by adding events. Log privileged access/exports and configuration changes without passwords, tokens or unnecessary sensitive text. Restricted append-only storage, independent checkpoints and integrity verification provide tamper evidence; hashes alone cannot prove truth or resist a fully privileged attacker. OWASP supports restricted access, sensitive-data exclusion and tamper detection. [S17]

## 5. Flagship differentiator: policy-constrained readiness and recovery planning

Working feature name: Case Readiness and Recovery Planner. Describe it plainly in the pitch: “For each case, explain what blocks the next permitted step, when its remaining tasks could be completed under stated assumptions, and which authorised intervention could help meet the deadline.”

### 5.1 Why this is stronger than reminders

Ordinary reminder logic reacts to a date. This planner connects task prerequisites, confirmed evidence, policy versions, permitted routes, human calendars and shared EVC capacity. It helps distinguish a genuinely late case from a blocked case and separates fixable delays from capacity infeasibility. It supports an action proposal with explicit assumptions and evidence, then requires authorisation.

Do not claim world-first research. BPMN/DMN engines, process conformance checking and constrained scheduling already exist. Process-mining conformance compares observed execution with a prescribed model. [S13] The proposed distinction is domain-specific integration: evidence-linked readiness, resource-aware what-if scheduling, freshness-aware advice and controlled execution inside the host workflow. Superiority remains a hypothesis until evaluated.

### 5.2 Inputs and internal model

- Versioned applicable workflow/rules; official hard deadlines and authorised internal targets kept separate.
- Case event history, current source version and freshness.
- Required evidence and accepted/submitted/review-pending states.
- Task precedence graph, conditional branches and known blockers.
- Authorised resource calendars and scheduling policy.
- Duration assumptions or later validated historical estimates.

Represent each concrete workflow iteration as task-instance nodes with dependencies. Loops such as re-scrutiny create new iterations; do not incorrectly turn the complete cyclic process into a DAG. Plan only the instantiated/assumed remaining route and list unresolved outcome branches. A “no further deficiencies” scenario is an assumption, not a promised approval.

### 5.3 Computation

1. Validate authority, source freshness and completeness; suppress executable advice when prerequisites are unknown.
2. Evaluate permitted next transitions and their missing prerequisites.
3. Build the remaining task-instance dependencies for each supported scenario.
4. Propagate calendar-aware earliest starts/finishes from confirmed readiness and assumed durations.
5. Add shared-resource availability and authorised EVC composition/selection constraints.
6. Compare feasible planned completion against configured deadlines; compute slack with the stated calendar.
7. Generate a small set of permitted alternatives, such as an earlier allowed slot or authorised reassignment.
8. Score using transparent objectives: weighted lateness, disruption and workload, never approval likelihood or institutional favouritism.
9. Show baseline versus proposed schedule, assumptions, affected cases, blockers and source/rule versions.
10. An authorised user approves a proposal. Revalidate source version, permissions and constraints immediately before execution. Recompute if anything changed.

Use precedence calculations as an optimistic lower-bound screen; a simple critical path ignores resource contention. Use OR-Tools/constraint optimisation for resource-aware plans. Estimated task durations are not official SLAs. Do not assign a calibrated risk probability without suitable data.

### 5.4 Example output — synthetic, non-regulatory

Case C-104 has a configured target in ten working days. Evidence has been submitted, but review remains pending; the next permitted EVC slot under the baseline resource calendar is too late. Scenario A proposes a policy-permitted slot after review, improves target slack and disrupts one unconfirmed booking. Scenario B keeps bookings unchanged and remains late. An earlier slot violating expert eligibility is rejected. Final approval is not predicted or automated.

If no schedule is found, distinguish “proven infeasible under this model,” “solver timeout/unknown,” and “missing data.” Report an interpretable blocking subset if supported; do not claim a mathematically minimal explanation without computing one.

### 5.5 Evaluation and ablation

Compare the same workload, calendars, rules and duration assumptions under: FIFO + reminders; earliest-deadline-first; dependency-aware planning without shared-resource constraints; and the full planner. Evaluate late-task count, weighted lateness, hard-constraint violations, rescheduling disruption, runtime and explanation correctness. Repeat on held-out synthetic workloads and report variation. Manually validate representative schedules with a domain reviewer. Synthetic improvements establish prototype behaviour, not demonstrated AICTE-wide savings.

## 6. Supporting USPs and honest pitch claims

| Proposed USP | Demonstrable proof | What not to claim |
|---|---|---|
| Existing-system integration | Same host case displayed with embedded/extension tasks and acknowledged connector updates | Universal plug-and-play with AICTE |
| Explainable recovery planning | Baseline/alternative plans with constraint checks | Guaranteed completion or approval |
| Versioned policy impact preview | Simulate a rule update on selected cases before publication | Automatic legal interpretation |
| Evidence-dependent readiness | Renewal acceptance updates only relevant tasks/findings | Document upload equals compliance |
| Accurate responsibility for delay | Separate institution response, official review, committee and integration waits | Causal blame based on missing timestamps |
| Resilient automation | Browser closed, worker restarted, timer recovered, no duplicate business action | Exactly-once effects across arbitrary external APIs |
| Audit-ready decisions | Rule/evidence/action history and signed checkpoint verification | Tamper-proof records or proof of truthful input |
| Portable deployment | Same core container/config on local and cloud infrastructure | Government production approval because a demo runs on AWS |

A policy Q&A assistant, chatbot, blockchain, anomaly score or attractive dashboard is not the flagship innovation. Add only what improves a measured workflow outcome.

## 7. Recommended implementation and engine choice

Recommended default: Java/Spring Boot modular backend with Flowable open-source BPMN/DMN engines; PostgreSQL; S3-compatible evidence storage; a background integration/notification worker; TypeScript embeddable UI and optional Chromium extension; a constrained scheduling component using OR-Tools. Use Python only if it simplifies the planner/OCR; otherwise avoid an extra service and use a supported Java solver interface. Do not require a Python microservice simply for architectural appearance.

Flowable's open-source engines support BPMN/CMMN/DMN and Apache 2.0 licensing. Its timer and asynchronous jobs can be persisted. Open-source engine availability does not imply every commercial design/admin interface is free. Build a constrained rule configuration interface rather than assume the enterprise modeler is included. [S7]

| Option | Fit | Main trade-off |
|---|---|---|
| Flowable OSS + domain service | Recommended for human tasks and visual/configurable policy workflows | Java/process modelling expertise and runtime operations |
| Temporal | Good for code-defined durable integration workflows | Policy editing and human-task UX still need product work |
| AWS Step Functions Standard | AWS-centric durable orchestration/human callbacks | Vendor coupling and workflow duration/feature constraints |
| Camunda 8 | Strong modelling/orchestration option | Current production licensing must be budgeted |
| n8n | Useful optional connector/notification automation | Review Sustainable Use/embedding licence and avoid a second authoritative workflow engine |
| Custom database state machine | Valid for a deliberately narrow scope | Team must implement persistence, guards, timers, versioning and recovery correctly |

Temporal documents durable long-running timers. AWS distinguishes Standard workflows, which can run up to one year, from Express; Express lacks callback integration patterns. A multi-year undertaking cannot be one indefinitely sleeping Standard execution. Current Camunda 8 self-managed production licensing is not equivalent to unrestricted free production use. n8n's Community edition uses a Sustainable Use License. [S8–S11]

Choose one authoritative domain workflow engine. Do not stack Flowable + Temporal + Step Functions + n8n to route the same application. External queues deliver integration work; they do not independently decide legal case state.

## 8. Data model and integration contracts

Core entities: Institution, Campus, Application, ApplicationRequest, SourceLink, WorkflowDefinitionVersion, RuleVersion, WorkflowInstance, TaskInstance, Deficiency, Committee, ExpertEligibility, Availability, Visit, Obligation, Document, DocumentVersion, Deadline, CalendarVersion, NotificationRule, NotificationAttempt, Escalation, AuditEvent, IntegrationEvent, CommandReceipt, SyncCursor, PlanningRun, ProposedAction, ReportSnapshot and UserAssignment.

Every relevant record retains source identifier/version, provenance, jurisdiction, timestamps and rule/evidence references. Distinguish transaction time (when recorded) from effective/observed time (when it applied/occurred). Do not retroactively overwrite historical assignments when staff move Regions.

Suggested event envelope: event ID, source, type, schema version, entity ID, source entity version, occurred-at, received-at, correlation ID and minimal payload. CloudEvents is a useful interoperability reference; source + ID identify an event for deduplication. [S14]

Example proposed API surface (not an AICTE API):

- `POST /v1/integrations/{connector}/events` — validated authenticated event ingestion.
- `GET /v1/cases/{id}/readiness` — blockers, data freshness and permitted next actions.
- `POST /v1/cases/{id}/transitions` — guarded authorised action, expected version and idempotency key.
- `POST /v1/planning-runs` — produce read-only what-if results.
- `POST /v1/proposals/{id}/execute` — authorised execution after fresh-state validation.
- `POST /v1/policy-versions/{id}/simulate` — rule impact preview.
- `POST /v1/documents/upload-intents` — scope-bound short-lived upload capability.
- `POST /v1/reports` — asynchronous report creation with reference time.

Publish OpenAPI/JSON schemas and connector fixtures. Authenticate webhooks, reject replays and schema-invalid payloads, quarantine unknown entity mappings, and use per-source sequence/version rules. Delayed/duplicate events are normal. Gaps trigger resynchronisation; do not order all business events solely by arrival time. Periodic source reconciliation is required even with webhooks.

For independent workflow and domain database transactions, use an explicit reliable coordination mechanism or same transactional boundary where supported; do not assume atomicity across services. Persist command intent and acknowledgements and reconcile partial failures. External effects such as emails cannot simply be rolled back with a database transaction.

## 9. Deployment: AWS prototype and production path

### 9.1 Small deployed pilot

Package a reproducible Docker Compose environment for development and a containerised cloud deployment for staging. Small pilot: one backend/worker deployment with PostgreSQL and object storage plus test mail provider; publicly reachable authenticated HTTPS endpoint. Do not put the authoritative database on an ephemeral application filesystem. Single-node availability limitations must be explicit.

### 9.2 Reference AWS production architecture — proposal

- HTTPS ingress via an application load balancer; WAF where justified by exposure.
- ECS/Fargate backend and worker tasks, normally in private subnets with deliberate outbound connectivity/endpoints. [S19]
- RDS PostgreSQL with backups/PITR, and Multi-AZ when the agreed availability target requires it.
- S3 private buckets for quarantined uploads and accepted evidence, versioning, encryption and scoped access.
- SQS + dead-letter queue if decoupled connector/notification throughput warrants it; consumers remain idempotent. AWS documents at-least-once delivery and visibility-timeout retries. [S15]
- KMS and Secrets Manager for managed keys and secrets; task IAM roles rather than static cloud credentials.
- CloudWatch/OpenTelemetry-compatible monitoring; separately protected audit exports/checkpoints.
- SSO federation with the owner's identity provider; do not force duplicate accounts when federation exists.
- Infrastructure as code, immutable image versions, environment-specific configuration and tested migrations.

Do not run timers in a browser or a single process-memory scheduler. If Flowable timers are authoritative, a recovery sweeper reconciles overdue/missed work; avoid competing independently authoritative schedules. Keep queue messages minimal and evidence behind authorised references.

S3 Object Lock can protect object versions using governance or compliance modes. Select retention only after a records policy is approved; irreversible compliance retention can conflict with test cleanup and approved disposal. An Object Lock setting is not a universal audit or privacy certification. [S16]

Use an India-region pilot as a design preference for this context, verifying actual service availability and every data path, including logs, email, model inference and backup replication. India hosting alone does not establish compliance. Government production may require NIC/MeghRaj or an eligible empanelled offering and procurement/security review. MeitY's AMBUD and NIC describe relevant cloud arrangements; specific AICTE requirements remain unknown. [S20]

Azure, NIC infrastructure or an approved private deployment can host the containerised core; document replacements for storage, queue, secrets and observability. Do not promise zero-effort cloud migration.

### 9.3 Reliability and operations

Define restart recovery, missed-timer reconciliation, backpressure, DLQ handling, audit availability, backup restoration, dependency outages and connector credential rotation. Instrument overdue timer lag, source sync age, failed actions, unknown writebacks, DLQ depth, notification failure and planner timeouts. Health checks must distinguish temporary dependency degradation from a healthy ready service.

Draft pilot targets for PRD discussion, not commitments: 99.5% monthly service availability; p95 normal case reads under 2 seconds at an explicitly tested workload; notification eligibility processing within 60 seconds at p95 excluding external delivery; RPO 15 minutes and RTO 4 hours only after the configured backup/restore path demonstrates them. A cheap single-VM pilot will not necessarily meet these. Set scale with actual institution/case/document counts and model request rates before sizing.

Cost model: compute + database/backup + storage/requests/egress + load balancer + NAT/endpoints + queue + mail/SMS + observability + OCR/inference + support/licences. Budget alarms and log limits are required. No fixed price is asserted without current regional sizing and pricing. Kubernetes, Kafka, a graph database and a dedicated vector database are not prerequisites.

## 10. Security, privacy and governance

### 10.1 Identity and authorisation

Use SSO with role plus attributes: institution/campus, Region, case assignment, committee membership, action scope and policy authority. Enforce in the backend and storage capabilities. Separate policy author/publisher and business reviewer where required. Administrative maintenance does not automatically grant regulatory decision authority. Use MFA for privileged roles, session expiry, access review and audited emergency access. Model transfers/delegations as time-bound assignments.

Use appropriate OAuth authorisation-code/PKCE flows for public clients and exact redirect matching; follow OAuth security BCP. Never store a client secret in an extension or front-end bundle. [S18] Host-page context cannot elevate backend permissions.

### 10.2 Documents, AI and integration threats

Quarantine uploads, allowlist types, inspect actual content, constrain size/pages/decompression, scan before distribution, isolate parsers and reject dangerous active content where appropriate. Use short-lived scope-bound download/upload URLs. Do not fetch arbitrary document URLs without SSRF protections, approved destinations and network restrictions. OWASP addresses these file-upload and SSRF risks. [S21]

Treat document text and host-page data as untrusted input. AI extraction receives no authority to submit, approve, publish policy, send external messages or fetch arbitrary URLs. Prevent instructions embedded in an uploaded document from becoming tool instructions. Validate structured output and require human confirmation of obligations/rules. Use minimal retained prompts and an approved inference environment; do not upload real regulatory evidence to an unapproved consumer AI service.

Threat scenarios to include: cross-institution IDOR, forged case context, replayed webhook, stale-version action, malicious upload, document-URL SSRF, fake callback/approval link, altered clock/date, privileged audit tampering, compromised connector and bulk export leakage. Include secure CSV output and content-security controls for embedded/extension UI.

### 10.3 India-specific applicability review

MeitY's DPDP commencement notification uses staggered commencement; do not claim every provision is fully operative on this research date. Require an applicability/commencement matrix for the intended deployment, record the responsible Data Fiduciary/processor roles, lawful purpose, minimisation, retention, access/grievance handling and breach process. Do not assume consent is the sole basis for every regulatory record. [S22]

CERT-In's directions include incident-reporting and log-retention requirements for covered entities, including specified incidents within six hours and rolling 180-day ICT logs in India. Determine applicability with the owner; that period is not a blanket retention limit for approval records. [S23]

Maintain separate retention classes for official records, evidence, security logs, operational logs, exports and AI processing artefacts. Support legal holds, authorised disposal and backup lifecycle. Accessibility and localisation are product requirements: keyboard/screen-reader support, non-colour status indicators, accessible tables, Indian date clarity, Asia/Kolkata display with stored UTC timestamps and configurable business calendars. WCAG 2.2 is a useful design benchmark; confirm the government's applicable GIGW/STQC requirements separately. [S24]

## 11. Pilot scope, demonstration and phased delivery

P0 vertical slice: one real owner-authorised host application, three reviewed route templates, deficiency loop, role/jurisdiction controls, durable timers, one EVC queue, obligations, document renewals, state-aware notifications, traceable case history, simple reports and the readiness/recovery planner on a bounded workload. If the existing codebase is provided, first inspect its architecture/auth/data model and add the adapter; do not regenerate it as a new site.

P1: compound requests, policy impact/migration preview, richer committee/calendar rules, stronger reconciliation, signed audit checkpoints, managed cloud resilience and reporting snapshots. P2: validated historical duration models, deeper process mining, optional obligation extraction and additional sanctioned integrations. ML predictions are optional, not a dependency of P0.

Without AICTE access, use a clearly labelled reference host and synthetic records solely as an integration test harness. Show two differently shaped host adapters using the same workflow backend to support portability. This is not proof of production AICTE integration. An institutional pilot provides operational evidence only within the institution's authorised scope, not AICTE-wide routing authority.

Demonstration narrative:

1. Open an existing host case and its embedded/extension context.
2. Ingest the authorised case event and show route explanation/rule version.
3. Raise a deficiency; institution responds; official reviews the submitted evidence.
4. Show an EVC bottleneck and recovery alternatives with constraints.
5. Authorised user selects a feasible plan; backend revalidates and host acknowledges the update.
6. Close the browser and restart a worker; demonstrate deadline continuity.
7. Simulate a renewal submission near a reminder; avoid an obsolete missing-evidence alert.
8. Simulate mail outage and unknown host writeback; show recovery/reconciliation without duplicate business actions.
9. Publish a sample policy update in staging after impact preview and approval.
10. Export a reproducible management report and verify the supporting audit checkpoint.

No unauthorised changes to a live government portal are needed for this demonstration.

## 12. Evaluation plan and release gates

| Dimension | Evidence required |
|---|---|
| Regulatory routing | Domain-reviewed fixtures for each route and conditional branch |
| Authority | Cross-role/jurisdiction tests reject unauthorised access and actions |
| Integration | Duplicate/out-of-order events, missing mappings, stale versions and ambiguous write outcomes |
| Clocks | Working/calendar days, leap dates, due-date boundary, extensions and allowed pauses |
| Scheduling | Hard-constraint checks, infeasibility vs timeout, cancellation and confirmed-booking preservation |
| Planner value | Controlled baselines, ablation, held-out synthetic workloads and reviewer explanation checks |
| Durability | Worker/database/connector restart, persisted timers, reconciliation and outbox recovery |
| Evidence | Version-specific review, rejected/ambiguous scans and safe file handling |
| Reporting | Known totals, historical transfers, cohort definitions and snapshot reproducibility |
| Audit | Coverage, correction events, protected checkpoints and tamper-detection demonstration |
| Operations | Restore drill, load test with declared workload, monitoring and rollback runbooks |
| Adoption | Timed assisted vs current workflow tasks with consented pilot users |

No claim such as “90% reduction” before measurement. Separate correctness (must satisfy policy) from performance (measured under load) and business outcomes (require a pilot). Release requires no unresolved critical authorisation flaw, correct supported routes, verified timer recovery, backups restored in a drill, source reconciliation, approved policy register and documented integration authority.

## 13. Questions the PRD agent must preserve as explicit unknowns

What is the actual host application and who owns it? Is source code available? Which role is piloting? Are API/event/export/SSO contracts supported? Which actions may be delegated? What rule corpus and year are approved? Who validates routes? What are committee selection rules? How are holidays/pauses defined? What volumes and budgets apply? Who owns operational support and incident response? Which cloud offering is allowed? Which privacy/records/security assessments are required? Is an extension permitted on managed devices? Which actions need maker-checker approval?

Proceed with explicit provisional choices for reversible design work, but do not invent answers or pretend unavailable production integrations are implemented.

## 14. Instructions to the PRD-writing agent

Create a comprehensive PRD for this integration-first product, preserving all eight PS requirements and the above authority boundaries. Use requirement IDs, priorities, personas, journeys, state/transition tables, permission matrix, entity definitions, integration contracts, rule governance, deadline semantics, planner algorithms/assumptions, nonfunctional targets, deployment/operations, rollout, observability, risks, dependencies and testable acceptance criteria. Map each PS requirement to product capabilities and acceptance evidence. Distinguish verified policy from sample configuration and unresolved decisions. Include one recommended stack and justify alternatives without deploying all of them.

Preserve existing software. Start implementation planning with discovery of the host rather than designing a replacement portal. Describe an API-first connector, embedded task UI, optional extension and import fallback. Keep an official source of truth and explicit write acknowledgements. No scraped private API assumed to be authorised. No LLM final decisions. No invented AICTE deadlines, automatic sanctions, production readiness, novelty guarantees or cost savings.

The flagship feature is explainable policy-constrained case readiness and recovery planning. MVP must demonstrate dependency blockers, a resource-aware what-if plan, authorised action with stale-state protection and end-to-end audit. Avoid turning it into a generic chatbot or document-forgery application. Write detailed acceptance criteria for negative and failure paths, not only happy-path screens. Label reference-host demonstration versus real production integration.

## 15. Primary-source research register

URLs below support the stated source facts; proposed architecture, USPs, algorithms and acceptance targets are the author's design synthesis. Research does not establish a patent-level novelty claim or AICTE authorisation. Sources were checked during this task; several AICTE pages/PDF endpoints were indexed but not retrievable in full.

- S1 — AICTE APH 2024–2027, government-hosted copy; Table 2.3, scrutiny/EVC/appeal provisions and lease context: https://cdnbbsr.s3waas.gov.in/s35938b4d054136e5d59ada6ec9c295d7a/uploads/2025/03/2025031399.pdf
- S2 — AICTE approval materials and addendum listings: https://aicte.gov.in/approal-process-2026-2027 ; https://www.aicte.gov.in/node/3309 ; updated addendum listing https://aicte.gov.in/downloads/aph/Final%20Addendum%202026-27_Updated.pdf (full updated text not retrieved).
- S3 — AWS anti-corruption layer pattern: https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/acl.html
- S4 — Chrome side panel: https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- S5 — Chrome activeTab: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
- S6 — Chrome service-worker lifecycle: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle
- S7 — Flowable OSS licence/engines: https://www.flowable.com/open-source/docs/oss-introduction ; persisted timer jobs: https://www.flowable.com/open-source/docs/bpmn/ch18-Advanced/ ; constructs: https://www.flowable.com/open-source/docs/bpmn/ch07b-BPMN-Constructs/
- S8 — Temporal durable timers: https://temporal.io/product
- S9 — AWS workflow type limits: https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html
- S10 — Camunda licensing: https://docs.camunda.io/docs/reference/licenses/
- S11 — n8n licensing: https://support.n8n.io/article/can-i-use-your-license-for-my-use-case ; https://github.com/n8n-io/n8n-docs/blob/main/docs/n8n-community-license/README.md
- S12 — OR-Tools job-shop precedence/resource constraints: https://developers.google.com/optimization/scheduling/job_shop ; employee scheduling: https://developers.google.com/optimization/scheduling/employee_scheduling
- S13 — Process-mining conformance foundations: https://www.processmining.org/conformance.html ; PM4Py API: https://github.com/process-intelligence-solutions/pm4py/blob/release/docs/source/api.rst
- S14 — CloudEvents official SDK event identity: https://cloudevents.github.io/sdk-javascript/interfaces/CloudEventV1.html
- S15 — AWS transactional outbox: https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html ; SQS delivery: https://docs.aws.amazon.com/en_gb/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html
- S16 — S3 Object Lock: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
- S17 — OWASP logging: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- S18 — OAuth security BCP, RFC 9700: https://www.rfc-editor.org/rfc/rfc9700.html
- S19 — ECS/Fargate networking: https://docs.aws.amazon.com/us_en/AmazonECS/latest/developerguide/fargate-task-networking.html
- S20 — MeitY empanelment platform: https://www.ambud.meity.gov.in/ ; NIC MeghRaj: https://cloud.gov.in/user/about.php ; AWS MeitY information: https://aws.amazon.com/compliance/MeitY/ (provider statement, not a specific-project procurement approval).
- S21 — OWASP uploads and SSRF: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html ; https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- S22 — MeitY DPDP commencement notification: https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf ; rules: https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf
- S23 — CERT-In Directions: https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf
- S24 — W3C WCAG 2.2: https://www.w3.org/TR/wcag/
