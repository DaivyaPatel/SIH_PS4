# Prototype demonstration and measurement plan

Date: 25 October 2026 | Status: proposed execution contract under the PRD; runtime benchmarks and user study not run

Scope/journeys: [MVP baseline](../product/mvp-scope.md). Canonical numeric inputs and fixture references: [benchmark manifest](../../config/evaluation/benchmark-manifest.json). Team size, delivery date, hardware budget and actual participants remain unconfirmed. Use the PRD's proposed workload bounds until measured capacity and owner input justify a versioned change.

## What exists and what remains planned

Current evidence is the offline [source-register verification](../regulatory/source-register.md) and [74 synthetic specification cases](../regulatory/synthetic-policy-guide.md). These prove checks on research metadata and the reference specification only. No runtime generator, backend, database, scheduler, persistent timer, actual notification or load test is implemented by this plan. Do not report a planned workload as a generated dataset or a passing service benchmark.

Maintain three evidence classes: specification checks; implementation correctness/performance; and measured user/pilot outcomes. Runtime tests must exercise actual domain/engine/connector code. Synthetic scheduling improvement cannot establish AICTE operational savings.

## Synthetic dataset manifest

The planned walkthrough dataset uses seed 26262, two fabricated Regions, four institutions and 24 applications, eight for each synthetic route. Reference time is 25 October 2026 at 14:30 IST. Use `DEMO-` IDs, `example.invalid` contact addresses and fabricated evidence without real signatures or personal identifiers. Use a fixed versioned clock only in test configuration; production must reject test-clock/fault controls.

Seed state must include J01 mapped/unmapped routing and version conflicts; J02 partial/complete response plus two review iterations; J03 eligible/blocked EVC, shared capacity, ineligible expert, timeout and changed calendar; J04 two obligations, timely/late submissions and extension; J05 accepted original/renewal versions, insufficient horizon, near-dispatch upload, stale source and mail failure. Add scoped cross-institution/Region identities and historical transfers/reopening/withdrawals for report reconciliation.

The manifest's role/fixture references are acceptance inputs, not instantiated users/cases. Actual task, obligation, document, visit and audit totals are produced by the future generator and recorded in a generated manifest; do not invent fixed secondary totals now. Save expected report totals independently of dashboard queries so reconciliation can catch mistakes. Confirm source/profile/rule versions and file checksums before each run; deterministic reset/seed instructions are part of the future harness.

## Service workload and targets

| Run | Proposed workload | Target / evidence |
|---|---|---|
| Read/queue/dashboard | 10,000 cases, 100,000 tasks, 100,000 audit events; 50 authenticated concurrent sessions; 2 min warmup + 10 min measurement; proposed mix 60% case detail, 25% scoped queue, 15% dashboard | Case read p95 <2 s; dashboard p95 <3 s; record queue latency, errors/timeouts, hardware and payloads |
| Projection freshness | Versioned source events and committed ingestion | p95 projection lag ≤30 s after durable ingestion; source/poll/import lag separate |
| Alert eligibility | 1,000 eligible jobs/min for 10 measured minutes | p95 eligibility processing ≤60 s, excluding external delivery; count missing/duplicate logical actions and stale notices |
| Dependency recovery | Controlled worker/DB/source/mail outage with persisted due work | Recover overdue valid jobs within 5 min after dependencies restore; distinguish outage time, restored processing lag and unknown external outcome |
| Planner | Up to 50 cases, 20 experts, 30 working-day horizon, ≤3 remaining scenarios/case; 5 s solver budget per scenario | Return valid status within budget/tolerance; expose feasible/late/infeasible/timeout/missing data; hard-constraint violations target zero |

The planner budget is per scenario, not a promise that a batch of all scenarios finishes in five seconds. Measure queue time and total batch wall-clock separately; bound concurrency so planning does not starve case reads or timers. No multi-year case lifetime is simulated by leaving a browser timer open.

Store offered and completed requests, successful-latency distributions, all timeout/error counts and elapsed test windows. Do not hide errors by reporting only fast successful reads. Run at declared hardware/configuration and record the sample count; compute percentiles using a documented method such as sorted nearest rank `ceil(p*n)`. Repeat after fixes only when changes or failures justify it. Pilot availability/RPO/RTO promises remain P1 and require measured backups/restores and operational approval.

## Planner baselines and ablations

Compare FIFO + reminders, earliest-deadline-first, dependency-aware planning without shared-resource optimisation, and the full planner. Each method receives the same case workload, allowed interventions, duration assumptions, rules and calendars. Baselines must also enforce mandatory constraints; do not make a baseline invalid to manufacture an improvement. Freeze unaffected confirmed bookings unless the shared experiment expressly allows their authorised movement.

Use tuning seeds 26262–26264, held-out seeds 26270–26274 and three repetitions per seed. Save exact generated inputs, policy/objective versions, solver version/threads/random seed, planning horizon, time budget and each raw output. Single-thread deterministic settings may be used where supported; record any nondeterminism rather than promise bit-identical schedules from all solvers.

Measure late-task count and weighted lateness under fixed weights/calendar, hard-constraint violations, changed confirmed/unconfirmed bookings, workload balance, runtime and reviewer-rated explanation correctness. Report feasible late plans separately from infeasible/unknown/missing-data. A timeout is never proof of infeasibility. Use an independent constraint checker against raw output. A hard violation is a defect, not an acceptable lateness improvement.

Report variation by seed/scenario and failures, including overload/cancellation. Do not count runtime technical retries as business rework. Explain optimistic duration/outcome assumptions and branch limits. A result showing no improvement is valid evidence; no fixed gain is required or pre-filled.

## Demonstration evidence and acceptance

| Sequence | Proof to capture | PRD acceptance |
|---|---|---|
| J01 | Same labelled host case, authenticated event/receipt, route explanation, correct scoped next task, duplicate/conflict and unknown-write reconciliation | AT-01/03/04/05 |
| J02 | Findings and reasons, partial response, exact evidence versions, two review iterations and denied unauthorised action | AT-02/04/13/15 |
| J03 | Eligibility/prerequisites, preserved selection, shared-capacity baseline, allowed/disallowed alternatives, stale-proposal rejection and acknowledged command | AT-05/10/11/19 |
| J04 | Two source-linked conditions, authoritative submission time, review pending vs accepted, extension original/current due, closure independence | AT-06/08/13 |
| J05 | Original/renewal evidence versions, horizon finding, dispatch race, correct pending owner, mail outage and worker restart | AT-07/08/09/12/15 |
| Horizontal | Scoped dashboards/count drill-down; six reports with reference metadata and safe export; complete correlated audit; keyboard/screen-reader and basic restore | AT-04/14/15/17/18/20 |

For each future run record run ID, Git commit, dataset/rule/config hashes, identity/mandate scope, reference time, hardware, runtime/dependency versions, test duration, expected counts, fault timeline, actual receipts and raw outputs. Review source status, service state and audit ordering. Keep synthetic screenshots/recordings free of secrets. Store local results in ignored output directories; intentionally publish only reviewed redacted result summaries with traceable references.

No fabricated status is substituted for a failed source receipt, no rendered mock screen counts as a durable action, and no specification pass is reported as a runtime pass. Later G2 dossier links these results; this ticket only defines how they will be collected.

## User task timing protocol

Propose a formative study with five consenting participants across institution/reviewer/coordinator/verifier perspectives if accessible. Recruitment and actual participation are zero today. Participants need not be actual AICTE officials for a synthetic usability study; describe their background and domain familiarity accurately. Actual institutional pilots require separate owner/data authorisation.

Use paired equivalent tasks on the current/reference workflow and the assisted prototype: locate next action, respond to a deficiency, find a permitted EVC slot, inspect undertaking status, and renew/verify a document. Keep task inputs/difficulty comparable without requiring the same answer twice; give a short standard orientation and counterbalance order. State that a reference host is a stand-in if no actual workflow baseline is available.

Start timing when task instructions and the ready initial screen are available; stop at the required durable receipt/confirmed result, not at a click or toast. Use a predefined per-task cap of ten minutes for the formative study; record incomplete/censored tasks and assistance rather than pretending they completed at the cap. Count explicit manual follow-ups, errors, hints, status comprehension and completion separately. Do not infer effort from login/page-open time.

Use pseudonymous participant IDs and consent; let participants stop without penalty. Store no names/contact details or recordings in Git. Report actual sample count, median/range/paired differences, completion/error rates and learning/order limitations. A one-person trial may yield formative observations but no representative savings claim. Obtain domain review of explanation correctness separately from interface preference.

## Completion and remaining approvals

This establishes proposed benchmark sizes, planned synthetic data, demo evidence and the study protocol for prototype implementation. No participants, business benefit, regulatory correctness or benchmark success is claimed. Team capacity/date/budget, real host and authority, complete current rule sources, actual study recruitment and production privacy/records/hosting approval remain decision-register inputs.
