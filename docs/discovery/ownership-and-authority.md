# Source of truth and delegated actions

Date: 25 October 2026 | Status: prototype design contract, not a live integration entitlement

Inputs: [host inventory](./host-inventory.md), [PRD](../../files/MASTER_PRD.md) sections 3 and 10, and the [backlog](../../files/tickets.md). No actual AICTE field mapping or API entitlement has been supplied. The reference-host names below are proposed semantic fields, not observed government schema.

## Authority model

The host owns official source facts. The orchestration service owns delegated coordination records. A shared view combines them with provenance; it does not make both systems unrestricted editors. A reference host is authoritative only for its own explicitly synthetic test records. Real integration requires the host owner's field-level contract and competent-authority mandate.

| Entity / semantic fields | Authoritative owner | Service behaviour / permitted writer | Version and conflict rule |
|---|---|---|---|
| Institution/campus: external ID, legal identity, address, Region, classification | Host | Observe/map; service stores scoped source link, not an independently editable duplicate official identity | Source version; unmapped identity quarantined; transfer keeps effective history |
| Application: source ID, category, academic year, submission facts/time, requested changes | Host | Ingest and route only after mapping/validation; institution corrections use a permitted source process | Expected source version; no generic edit of submitted facts |
| Official processing stage/status and recorded outcome | Host unless explicitly delegated | Retain `observedSourceState` and source freshness; a service task cannot overwrite it by inference | Acknowledgement plus observation confirms source change; stale events cannot regress projection |
| Official decision/order: outcome, competent actor, date, letter reference | Host/competent authority | Read/import verified source record; no autonomous final decision | Source receipt/version and authority; recommendation stored separately |
| Workflow instance/task: route version, task state, iteration, prerequisites, assignment | Service within delegated scope | Guarded domain commands by authorised official/service; actor and reason retained | Optimistic domain version; no duplicated next task on replay |
| Review findings/deficiencies/recommendation | Named authorised reviewing actor; owning store agreed per connector | Service-owned draft/review record or mirrored host record, explicitly identified | Exact evidence/rule versions; host-owned final finding needs acknowledged command |
| Evidence bytes and document metadata: issue/expiry/coverage | Host if already authoritative; service owns approved new intake copies | Versioned synthetic upload or sanctioned intake, quarantine and provenance; no truth inference from upload/hash | Immutable document version and scan result; conflicts require review |
| Evidence acceptance/verified compliance | Authorised verifier; store ownership agreed per connector | Record assessment of exact version only within delegated authority | Replacing a file never replaces acceptance; original assessment retained |
| Obligation: originating condition, order passage, evidence requirement and original due | Originating authorised order/process owner | Official confirms structured record before activation; service tracks execution | Source order/rule version; ambiguity held; no model-created obligation activation |
| Obligation status/submission receipt | Owning service or host as contracted | Preserve submitted/review-pending/accepted separately and receipt provenance | Submission time uses the authoritative intake source; delayed sync flagged |
| Deadline and calendar: type, anchor, due, pauses, extension | Process owner for rule/authority; service for calculated instance | Persist derived original/current due; extension only by delegated action | Calendar/rule/deadline generation version; no implicit transfer reset |
| Committee selection/composition/eligibility | Mandated selection authority/host | Mirror selection result; scheduling may propose slots without replacing selection method | Selection/eligibility version; unknown authority blocks confirmation |
| Availability/confirmed booking/visit/report | Agreed calendar/visit owner; service only where delegated | Propose and reserve authorised slots; conduct/report/outcome separate | Recheck source/calendar/resource versions; non-overlap; confirmed changes require authority |
| Notification rule, recipient hierarchy and template | Approved administrative policy owner | Service schedules/dispatches current permitted follow-up | Rule/template/assignment and deadline generation versions |
| Notification attempt, provider receipt and escalation ledger | Service; provider supplies delivery evidence | Append technical outcome; escalate actual pending action | Stable notice key; provider accepted is not delivered/read |
| Identity, membership, delegation and privilege | Approved identity/assignment authority | Validate token and effective scopes; admin operation alone grants no regulatory mandate | Effective dates/revocation; actor derived server-side |
| Planner run/proposal/assumptions | Service | Read-only calculation; authorised user approves a proposed action | Pin source/policy/calendar/evidence versions; expire and revalidate before execution |
| Audit, sync receipts, command receipts and outbox | Service within its operation | Append events/intents; correction is another event | Stable correlation/dedup keys; restricted writes; no history overwrite |
| Report output/metric definition | Service, using approved definitions and scoped input | Versioned reference-time output; export within current mandate | Snapshot/filter/scope/definition/freshness recorded |

When the host owns a finding, booking or evidence acceptance, a service UI click produces a command intent, not an immediately authoritative status. If the owner later delegates the complete lifecycle, record that field-level change explicitly before enabling it. Never silently switch authority according to which source updated most recently.

## Action allowlist

The prototype modes below are design permissions for synthetic data. They do not report implemented features. Every runtime action remains unavailable until implemented and validated. `Live` is disabled by default for every external action; a future connector must enable individually authorised capabilities.

| Proposed action | Synthetic reference mode | Read-only import mode | Live default | Actor/guards |
|---|---|---|---|---|
| Read mapped case/status and scoped evidence | Permitted design | Permitted for imported scope | Disabled until read entitlement | Authenticated scope, provenance and freshness |
| Receive case event/import export | Permitted design | Validated batch only | Disabled until source contract | Authenticated source/entitlement, schema, replay and mapping checks |
| Create service task/timer/notice intent | Permitted design | Monitoring tasks/timers only; no official progression | Disabled until delegated monitoring scope | Approved rule, responsible scope, domain audit |
| Propose next stage/readiness/recovery plan | Permitted design | Read-only, missing inputs explicit | Disabled until read/processing scope | Rule/freshness checks; no source change |
| Request source stage update/return | Test command only | Disabled | Disabled | Assigned actor, permitted edge/reason/evidence, expected version and idempotency |
| Record review/recommendation | Synthetic assigned reviewer | Disabled for official record | Disabled | Role plus mandate, exact evidence version; completion differs from favourable result |
| Submit correction/undertaking/renewal evidence | Synthetic institution intake | Disabled for official record | Disabled | Own institution/campus, approved intake, quarantine and receipt |
| Accept evidence/close obligation | Synthetic verifier | Disabled for official record | Disabled | Explicit verifier mandate and version-specific review |
| Propose EVC slots | Permitted design | Read-only if sufficient approved data | Disabled | Authorised pool/selection, prerequisites, all hard constraints |
| Confirm/change booking | Test host command only | Disabled | Disabled | Scheduler mandate, current versions, reservation and acknowledgement |
| Publish policy | Reviewed synthetic policy only | No regulatory activation | Disabled | Author/publisher separation, sources and applicability, audit |
| Send email/SMS/external notice | Local test sink only | Local test sink only | Disabled | Approved recipients/channel, dispatch recheck; no actual recipients in demo |
| Export report/history | Synthetic scoped export | Imported permitted scope only | Disabled until export mandate | Recheck scope, safe export, retention and access audit |
| Choose actual committee using optimiser | Disabled | Disabled | Disabled | Preserve mandated selection process; optimiser is not selection authority |
| Autonomous approval/refusal/sanction | Disabled | Disabled | Disabled | Never a service decision capability |
| Read-only import writes back to source | Disabled | Disabled | Disabled | Mode must be replaced by an explicitly contracted write-capable connector |

## Command and state contract

Show five separate concepts: `observedSourceState`, `orchestrationState`, `proposedAction`, `writebackAcknowledgement` and `confirmedSourceState`. Official approval appears only when a competent-authority source decision is confirmed with provenance. Do not present internal task success as portal success.

An external command includes source/record ID, expected source version, operation, idempotency key, server-derived actor and authority, correlation ID and minimal validated payload. The source must independently enforce its contract. Record intent before sending and retain the acknowledgement. If acceptance may have occurred but the response is lost, mark `OUTCOME_UNKNOWN`, reconcile through a supported read/receipt, and block unsafe resubmission. A source that cannot enforce necessary stale/dedup checks is not automatically eligible for full writeback.

## Review and activation

The project's coordinator can select the prototype contract. Regulatory approval, host integration approval and institutional evidence verification remain distinct responsibilities. Before real activation, fill actual owner names, field mappings, endpoints, entitlement evidence, decision mandates, scope and version/idempotency semantics. Missing authority means disabled capability, not a guessed permissive default.
