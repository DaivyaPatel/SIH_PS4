# AICTE Approval Workflow Automation

An integration-first project for approval-workflow coordination, EVC scheduling, institutional compliance, document validity, alerts and traceable actions. Regulatory verification and decisions remain with the competent authorities.

## Current implementation

The backend service and React/TypeScript shell provide public platform metadata and a local development foundation. A shared OpenAPI definition generates the UI response types. Application commands remain denied until scoped identity and authorisation are implemented.

The separate Java stack-proof module exercises Spring-managed Flowable BPMN/DMN engines on a shared PostgreSQL datasource and transaction manager. It includes a synthetic human review task, a persisted timer, case/audit/outbox writes and native OR-Tools scheduling probes. All bundled workflows, identities and dates are synthetic. Regulatory verification and decisions remain with authorised officials.

## Local service and UI

Requirements: Docker Engine/Desktop with Compose v2, Python 3.10+, Node 22.13+ (22.x), 24.x or 26+, and JDK 21 for native Java development. Container and UI dependencies are version pinned. No external API keys, AI model, paid service or cloud account is required. Run setup commands from the repository root.

```powershell
python scripts/init_dev.py
docker compose up --build -d
cd frontend
npm ci --ignore-scripts
npm run dev
```

Open http://localhost:5173. The UI proxies API requests to the backend at http://127.0.0.1:8080. Platform metadata is at `/api/v1/platform`; readiness is at `/actuator/health/readiness`. A database failure makes readiness fail. The initial Flyway migration creates platform metadata only and refuses automatic baselining or database cleaning.

The generator refuses to overwrite an existing `.env` or private storage configuration and never prints credentials. Keep both local. Do not substitute the committed example placeholders for generated credentials. On Unix, `.env` is mode 0600 and the storage configuration's parent directory is mode 0700. The storage file is readable through its read-only container mount by the unprivileged service UID; other host users cannot traverse its private directory. Windows files inherit the workspace ACL.

| Local service | Address | Purpose |
|---|---|---|
| PostgreSQL 17.11 | `127.0.0.1:5432` | Disposable development database |
| SeaweedFS 4.48 (digest pinned) | `127.0.0.1:8333` | Authenticated S3 development store; no anonymous identity |
| Keycloak 26.8.1 | `http://localhost:8081` | Test IdP; realm `aicte-synthetic`, public PKCE client `approval-ui` |
| Mailpit 1.32.0 | `http://localhost:8025`, SMTP `127.0.0.1:1025` | Local mail capture; no external delivery configured |

Only loopback ports are published. Storage management ports are internal. Keycloak uses `start-dev` with persistent local state; log into its admin console as `local-admin` using the locally generated password. No institution users are seeded. The identity, storage and mail services are development dependencies, not implemented application integrations. Do not expose this stack publicly or use institutional evidence in it.

`docker compose stop` preserves the named development volumes. `docker compose up -d` restarts them. Use `docker compose logs backend` to diagnose startup; keep logs local. Deleting volumes discards development data and is not part of routine startup.

```powershell
cd frontend
npm run api:generate
npm run build
npm run lint
npm test
```

API types are generated from [the OpenAPI contract](./api/openapi.json). Commit regenerated types with contract changes. UI build output and dependencies remain ignored. Build the backend with the Maven commands below; the proof module retains its own disposable database tests.

## API conventions and configuration

- API paths use `/api/v1`. Only public platform metadata and health are permitted; all other operations are denied by the backend. Local login and external integrations are disabled.
- `X-Correlation-ID` accepts a UUID. Missing or invalid values receive a new UUID. Responses echo the chosen value; errors include the same `correlationId`. Request logging context is cleared after processing.
- Errors use `application/problem+json` with `type`, `title`, `status`, `detail`, `instance`, `correlationId` and `errors`. Validation entries contain field names and messages, never rejected values. Unexpected errors return a generic message.
- `/api/v1/platform/modules` demonstrates zero-based `page` (0–1,000,000) and `size` (1–100, default 20), returning `items`, `page`, `size`, `totalElements` and `totalPages`. These are connection metadata, not application records.
- The shared `CommandReceipt` schema reserves identifiers, outcome and UTC timestamp for future durably accepted commands. No command endpoint exists yet; `ACCEPTED` will never mean regulatory approval.
- Runtime database settings are injected through `DATABASE_URL`, `DATABASE_USER` and `DATABASE_PASSWORD`. Database connection acquisition is bounded at three seconds so readiness can report outages promptly. `APP_ENVIRONMENT` currently supports only `development`; unsupported environments fail validation. Test database configuration lives only in test code. Health details and other management endpoints remain private.

## Continuous verification

[Application checks](./.github/workflows/application.yml) run Java lint and real PostgreSQL/API tests, Flyway repeatability/checksum tests, generated API-type drift checks, TypeScript build/lint/tests, npm dependency audit, a resolved Java CycloneDX inventory scan and a redacted Gitleaks scan of the current tracked source. Dependency scans fail for high/critical findings and do not require API keys. Scanner availability failures fail the job.

Security overrides pin Jackson 2.21.7, Tomcat 10.1.61 and PostgreSQL JDBC 42.7.12. Two Spring MVC findings are assessed as unreachable in the current JSON-only development endpoints using [a version-specific VEX configuration](./config/security/development-vex.json); CI displays the assessed findings and tests their routing assumptions. The affected Spring library itself is not patched. [The XSLT advisory](https://spring.io/security/cve-2026-47884/) and [the SSE advisory](https://spring.io/security/cve-2026-47890/) describe the required features. Reassess the configuration when routes change and migrate to a supported framework before production.

The Linux Compose job starts the actual pinned development services, checks API readiness and request conventions, performs an authenticated S3 object round-trip and rejects anonymous reads, reads OIDC discovery, captures a synthetic SMTP message, restarts the backend against the same database and verifies readiness fails during a database outage. CI creates temporary secrets and removes its disposable volumes. It does not deploy or publish images. These checks establish development behaviour, not production identity or evidence-security approval.

To repeat the infrastructure smoke check with Compose running:

```powershell
python -m pip install -r scripts/ci-requirements.txt
python scripts/smoke_dev.py
```

## Stack

| Component | Pinned version | Licence |
|---|---|---|
| Java / OpenJDK-compatible runtime | 21 | Distribution-specific; OpenJDK GPLv2 with Classpath Exception |
| Maven wrapper distribution | 3.9.11 | Apache 2.0 |
| Spring Boot | 3.5.16 | Apache 2.0 |
| Flowable OSS BPMN/DMN engines | 7.2.0 | Apache 2.0 |
| PostgreSQL test server | 17.11 | PostgreSQL Licence |
| Embedded PostgreSQL test launcher | 2.2.2 | Apache 2.0 |
| Google OR-Tools Java/JNI | 9.15.6755 | Apache 2.0; retain bundled dependency notices |

Runtime libraries retain their own licence/notice metadata. Flowable commercial products and design tools are not dependencies. PostgreSQL JDBC is managed by the pinned Spring Boot dependency BOM; its licence is BSD 2-Clause. The test launcher runs an actual disposable PostgreSQL process, not H2.

## Requirements and build

- JDK 21 on PATH, or `JAVA_HOME` pointing to a JDK 21 installation.
- Network access on the first build to download Maven and dependencies/native test binaries.
- Windows amd64 or Linux amd64 for the current proof target. Linux database tests must run as a non-root user.
- Python 3.10+ only for the separate synthetic specification check.

No API key, model, paid service, Docker daemon or existing database is required for the local Java tests. The Maven wrapper distribution is checksum pinned; build tools and dependency caches should remain outside Git.

```powershell
git clone https://github.com/DaivyaPatel/SIH_PS4.git
cd SIH_PS4
.\mvnw.cmd --batch-mode --no-transfer-progress verify
```

On Linux:

```sh
./mvnw --batch-mode --no-transfer-progress verify
```

Surefire reports are written under each module's `target/surefire-reports/`. Generated build output and database state must not be committed. A missing native runtime prerequisite is a failed setup/test, not a skipped passing test.

## What the Java tests check

- A committed start persists one human task plus the case, audit event and outbox intent.
- Failure after all start writes rolls back engine and application state together.
- Failure after task completion restores the task, removes its uncommitted timer and rolls back the application intents.
- Terminating the uncommitted PostgreSQL session leaves no committed orphan.
- The DMN table maps three synthetic categories; unknown values do not receive a guessed route.
- A timer remains in PostgreSQL after the engine closes; the restarted async worker creates one follow-up task.
- The native solver respects precedence/non-overlap and distinguishes an impossible horizon from a feasible schedule.

Audit/outbox tables here store transactional proof intents only. This does not implement a production audit security model, delivery worker, regulatory authorisation or full EVC optimisation.

The suites cover eight proof checks and twelve backend checks, with missing prerequisites treated as failures. The build workflows separately check Windows and Linux containers; local Windows success alone does not establish container compatibility.

## Run the packaged native probe

After a successful build:

```powershell
java -jar stack-proof/target/stack-proof-0.1.0-SNAPSHOT.jar --probe-native
```

The probe loads the JNI libraries from the OR-Tools platform jars and solves one feasible and one infeasible model without a database. The default non-web Spring application instead requires `PROOF_DATABASE_URL`, `PROOF_DATABASE_USER` and `PROOF_DATABASE_PASSWORD`. It creates proof tables and Flowable schemas automatically: use only a new disposable test database, never an existing institution or production database. No HTTP listener is exposed.

## Linux container verification

With Docker available:

```sh
docker build --platform linux/amd64 --tag aicte-stack-proof .
docker run --rm --network none aicte-stack-proof
```

The build runs the Java suite, including real PostgreSQL, as a non-root user. The final JRE-only image runs the packaged native solver as a non-root user without network access. No image is published. Base images use version tags for this proof; pin approved digests before an actual pilot deployment.

[GitHub Actions](./.github/workflows/stack-proof.yml) executes the Windows Java suite and the Linux container build/probe when relevant source or build files change. It uses read-only repository permissions and requires no deployment credentials.

## Synthetic policy specification

```powershell
python scripts/check_synthetic_policy.py
```

This separate offline checker validates three route examples and 74 expected routing/compliance cases. The Java stack proof does not yet implement the full fixture-backed regulatory domain. The future backend must pass those cases through its own guarded commands.

## Repository structure

```text
.mvn/wrapper/                 # Checksum-pinned Maven bootstrap configuration
api/                         # Shared API contract
backend/                     # Modular Spring Boot service and Flyway migrations
frontend/                    # React/TypeScript shell and generated API types
compose.yaml                 # Loopback-only local development services
config/policies/synthetic/    # Synthetic rule definitions and expected cases
scripts/                     # Offline specification checker
stack-proof/
  src/main/java/             # Engine configuration, transaction and native probes
  src/main/resources/        # Synthetic BPMN/DMN, proof SQL, component metadata
  src/test/java/             # PostgreSQL persistence and native solver checks
pom.xml                      # Parent build and pinned component versions
mvnw / mvnw.cmd              # Maven wrapper entry points
```

Keep credentials, private exports, institutional evidence and generated state out of Git. Use fabricated data and isolated test destinations during development.
