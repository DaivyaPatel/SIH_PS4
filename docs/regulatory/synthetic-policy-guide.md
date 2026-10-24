# Synthetic policy and acceptance fixtures

Status: executable specification for prototype development; not an activated policy or implemented backend

## Bundle and safety boundary

[Synthetic policy directory](../../config/policies/synthetic/) contains four JSON documents:

| Document | Purpose |
|---|---|
| [routes.json](../../config/policies/synthetic/routes.json) | Three bounded route definitions, synthetic category/year mappings, transition roles, prerequisites and reasons |
| [routing-cases.json](../../config/policies/synthetic/routing-cases.json) | 50 input/expected-output cases for routes and conditional/negative branches |
| [compliance-policy.json](../../config/policies/synthetic/compliance-policy.json) | Demo calendar, conditions, evidence, validity, notification offsets, recipient roles and extension example |
| [compliance-cases.json](../../config/policies/synthetic/compliance-cases.json) | 24 expected calendar, boundary, submission, validity and notification-classification cases |

Every bundle, rule/edge, route and fixture is marked `SYNTHETIC_NOT_REGULATORY`. Categories and academic year use `DEMO-` values; there are no live category bindings. Owner approval, runtime activation and production activation remain false. [Research sources](./source-register.md) inform design questions but do not confer legal status on these fabricated conditions or deadlines.

The offline checker uses actor names and authority booleans as **test facts**. A real API must derive identity, jurisdiction, mandate and source confirmation on the server. Client-supplied flags cannot grant authority. No runtime ever gains rights from a fixture or JSON flag.

## Routing tables

| Route / synthetic category | Initial stage and role | Normal positive review path |
|---|---|---|
| DEMO-SCRUTINY / DEMO-CATEGORY-A | Scrutiny / scrutiny reviewer | Scrutiny → competent-authority decision pending |
| DEMO-SCRUTINY-EVC / DEMO-CATEGORY-B | Scrutiny / scrutiny reviewer | Scrutiny → EVC coordination/report → competent-authority decision pending |
| DEMO-EVC / DEMO-CATEGORY-C | EVC / EVC coordinator | Eligible EVC coordination/report → competent-authority decision pending |

Conditional SHC and SAC edges are distinct. Hearing needs its applicability/authority and recorded reason; appeal needs a confirmed source decision, applicable unused right, confirmed window and reason. No appeal duration is assumed as universal policy. Hearing/appeal recommendations return to decision pending. Only a separately confirmed competent source decision yields a decision record, and it does not infer a favourable outcome.

Scrutiny/re-scrutiny can raise identified deficiencies, preserve partial responses and create another review iteration after a complete scoped response. Repeated deficiencies remain possible. The synthetic authorised-return edge requires a reason and exists only on the combined route; it cannot invent scrutiny in the EVC-only route. Negative recommendations go to competent decision work rather than automatic refusal. Processing closure preserves obligations. Runtime persistence of iteration/evidence/audit is a later backend acceptance requirement, not proven by this offline table.

Expected results include next stage/role or specific blocked code. Unknown category/year, unavailable edge, wrong role, missing prerequisites and missing reason are explicit cases. Fixtures also distinguish visit scheduled/conducted/report accepted and prevent a missing source decision from being inferred from task completion.

## Calendars, compliance and notices

The invented calendar uses Asia/Kolkata (UTC+05:30), Monday–Friday working days and **26 October 2026 as a fabricated non-working day**. This is not a statement about an actual Indian holiday. Working-day offsets exclude the anchor date; zero offset retains it. Due dates are inclusive through local midnight, becoming overdue at the next local date. Examples cover weekend/holiday skipping, leap day, year rollover, missing due date and the exact UTC/IST boundary. No unofficial pause resets a clock.

Two fabricated order conditions create separate obligations with distinct due dates/evidence checklists. The extension example preserves original/current due, authority and reason, and invalidates unsent old-generation notices. Structured date confirmation and version-specific verifier acceptance remain required. Timely source submission remains timely when the service ingests it later, but unobserved source changes cannot retrospectively prevent a notice already dispatched; runtime needs the reconciliation/dispatch checks.

Validity examples distinguish current expiry from an explicitly supplied future demo horizon, unknown/ambiguous expiry, explicit no-expiry applicability, renewal pending review and accepted replacement. The demo horizon uses an inclusive comparison strictly for a test scenario. It is not a legal interpretation of lease equality/threshold clauses. Upload does not change the accepted version.

Reminder offsets of seven, three and one calendar days before due, and escalation examples after one/three overdue days, are fabricated. A repeat cap is configured; only test sinks are permitted. Current pending action resolves to institution, verifier, EVC coordinator/reporter, integration support or operations. Evidence awaiting verification is not missing evidence; stale source suppresses accusatory missing-submission classification and directs a technical issue to integration support. Actual hierarchy/templates/timing require authorised rules.

## Running and using the fixtures

From the repository root run `python scripts/check_synthetic_policy.py`. It uses the Python standard library, validates labels/activation guards/route structure, and compares calculated outcomes with the stored expected results. No API keys, model, database, cloud, mail account or third-party package is required. The checker does not implement scheduling, persisted timers, notification delivery, true authorisation, integration reconciliation or approvals.

Future backend tests must consume these fixtures through real guarded domain commands, rather than calling this reference checker to claim engine correctness. Extend the shared expected cases when applicable policy is reviewed. Any change to category applicability, semantics, expected values or constraints requires reviewed versioned evidence; do not alter expected values merely to make a failing backend pass.

Owner approval uses the separate [validation checklist](./process-owner-validation.md). Until completed, these files remain synthetic development inputs.
