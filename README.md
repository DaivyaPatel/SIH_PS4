# AICTE Approval Workflow Automation

An integration-first project for coordinating approval workflows, EVC scheduling, institutional compliance, document validity, alerts and audit trails. Regulatory verification and decisions remain with the competent authorities.

## Implementation status

The repository currently contains an executable synthetic policy specification and its validation script. The application backend, database, web interface, persistent timers and external integrations have not been implemented yet.

The existing code validates:

- Three configurable route examples: scrutiny-only, scrutiny with EVC, and EVC-only.
- Conditional hearing and appeal branches, deficiency responses and re-review.
- Role, prerequisite, reason and source-confirmation guards.
- Working-day calculations and deadline boundaries.
- Submission versus verification status, document validity and renewal examples.
- Notification recipient classification for pending actions and technical failures.

All bundled records and rules are synthetic. They are test inputs, not approved AICTE regulations or live institutional records.

## Requirements

- Git
- Python 3.10 or newer

The current checker uses only the Python standard library. No package installation, API key, model, database or cloud account is required.

## Quick start

```powershell
git clone https://github.com/DaivyaPatel/SIH_PS4.git
cd SIH_PS4
python scripts/check_synthetic_policy.py
```

Expected output:

```text
PASS: three demo routes; 50 routing and 24 compliance fixtures
All synthetic markers/activation guards pass. This is specification validation, not backend/timer/integration verification.
```

The process exits with a nonzero status if a validation fails. It performs no network calls, source-system writes, timer scheduling or message delivery.

## Repository structure

```text
config/
  policies/
    synthetic/
      routes.json               # Route definitions and transition guards
      routing-cases.json        # 50 routing acceptance cases
      compliance-policy.json    # Synthetic calendar and compliance rules
      compliance-cases.json     # 24 compliance acceptance cases
scripts/
  check_synthetic_policy.py      # Offline specification validator
.editorconfig
.gitattributes
.gitignore
README.md
```

## Working with the fixtures

Route cases contain inputs and expected next-stage/role or blocked results. Compliance cases cover date calculations, submission timing, validity and notification responsibility. The checker also rejects invalid policy structure and unsafe activation flags.

Keep synthetic markers and activation restrictions intact. Changes to a rule should include reviewed expected cases. When the backend is introduced, its tests must exercise these cases through actual domain commands; passing the offline checker alone does not prove runtime authorisation, durable recovery or regulatory correctness.

Never commit credentials, private exports, institutional evidence or personal records. Use fabricated data and local test destinations for development.

## Next implementation milestone

Prove compatible Java/Spring Boot, Flowable, PostgreSQL and OR-Tools versions, including shared transaction rollback, a persisted timer and native solver execution. Runtime setup and start commands will be added as those components become executable.
