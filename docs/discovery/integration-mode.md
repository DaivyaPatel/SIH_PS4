# Initial integration mode decision

Date: 25 October 2026 | Decision: prototype default selected from the PRD fallback | Scope: synthetic development only

## Context and decision

The [inventory](./host-inventory.md) found a documentation-only repository and no supplied host code, sandbox or authorised government integration contract. Select a **team-owned synthetic reference host with API/events and an embedded task interface** as the initial prototype integration. Its implementation belongs to the foundation/integration work, not this discovery ticket. It is a test harness, not a replacement AICTE portal or evidence of AICTE integration.

If an existing authorised host is supplied, revisit this decision and map that host through the same domain contracts. Do not recreate its application as the reference host. The service remains the orchestration backend; host-specific status/schema translation belongs in the connector.

## Concrete prototype contract

- Source namespace: `reference-host`; all cases, users, committees, documents and decisions are synthetic and visibly labelled.
- Host owns source application identity/submitted facts, source status and synthetic official decision fixtures. The service owns coordination state within the [ownership matrix](./ownership-and-authority.md).
- Source events include ID/source, schema/type, entity/source version, occurrence time and correlation; receipt time is assigned by the service. Authenticate source calls using development-only identity configured outside Git.
- The reference host provides scoped reads, source versions, supported test events, idempotent/version-guarded test commands and receipt lookup. Fault controls simulate duplicate/out-of-order delivery, lost acknowledgement and outage.
- Permitted test write commands: request a permitted stage change, record a review recommendation, request an authorised return and reserve/change a permitted test visit slot. These remain future implementation capabilities until tested.
- Synthetic decision fixtures simulate a competent actor's source decision separately. Neither the planner nor the service can autonomously approve, refuse or sanction an institution.
- The embedded module identifies context but authenticates/authorises through the service; host-page identifiers never establish entitlement.
- Notifications use in-app records and a local test mail sink. No SMS, real external mail, production source writes, extension or attended RPA is enabled by this decision.

## Capability profiles

Machine-readable design inputs: [integration profiles](../../config/discovery/integration-profiles.json). These are discovery configuration, not a working runtime feature. Every profile is inactive until its adapter and required controls are implemented and validated.

| Profile | Planned capability | Explicit limits |
|---|---|---|
| `reference-host` | Authenticated synthetic reads/events; guarded test writeback; embedded UI; reconciliation/receipts | Synthetic only; no runtime implemented yet |
| `synthetic-import` | Preview/commit validated synthetic CSV/JSON, monitoring, reports and read-only advice | No official stage/review/decision writes or source writeback; no live freshness claim |
| `live-aicte-disabled` | None | No endpoint, credentials, entitlement or delegated write contract supplied; deny all capabilities |

Do not infer a supported live connector from the profile name. A future authorised live connector needs a new reviewed profile and actual contract evidence. Runtime must fail closed on unknown modes/capabilities; a static design flag cannot grant an actor permission.

## Freshness and reconciliation contract

Maintain source occurrence time, last successful authoritative observation, source version, service receipt time, import/export time and coverage independently. Sync freshness is based on the last successful source observation, not a browser opening the case or a provider callback. Future or untrusted source timestamps cannot make a record artificially fresh.

For the synthetic event profile, propose an initial stale-read threshold of **120 seconds** and a maximum source-observation age of **60 seconds** for a consequential test command or executable proposal. These are engineering demo defaults, not regulatory timelines. Require a refreshed/versioned source read before the command. A version conflict, source gap, unknown effective write or missing observation blocks execution regardless of its apparent age. The implementation must handle the race after the check using host-side expected-version/idempotency enforcement.

Stale reads remain visible to authorised users with timestamp/warning; they are not silently discarded or described as current. Readiness/planning may show labelled non-executable scenarios. Continue durable monitoring against known deadlines, but mark source uncertainty; do not send an accusation of missing submission from stale/gapped source state without the configured reconciliation/dispatch check. Route source-sync failure to operations.

For imports, record batch ID, export/receipt times, selected scope, row provenance, validation and completeness. Always label batch data as imported; no freshness threshold turns it into live data. Source writeback stays disabled. A newer import never assumes authority to rewrite official historical decisions. Read-only planning requires explicit data assumptions and produces no executable source proposal.

## Activation and acceptance

Reference adapter activation follows authenticated ingestion, scoped access, durable receipts/inbox/outbox/audit, version/idempotency contracts, unknown-outcome reconciliation and the source fault suite. Import activation follows schema/provenance/scope validation and preview/commit tests. Real-data or live activation additionally requires the owner's approved policy, identity, records, hosting and field/action delegation gates.

Discovery acceptance: a concrete initial mode, fallback, authority boundary, deny-by-default capability plan and freshness contract exist. Runtime integration, freshness enforcement and end-to-end tests remain future tickets; no feature is marked implemented by this decision document.
