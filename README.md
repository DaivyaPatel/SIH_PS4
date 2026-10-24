# AICTE Approval Workflow Automation

An integration-first project for approval-workflow coordination, EVC scheduling, institutional compliance, document validity, alerts and traceable actions. Regulatory verification and decisions remain with the competent authorities.

## Current implementation

The backend service and React/TypeScript shell provide public platform metadata and a local development foundation. A shared OpenAPI definition generates the UI response types. Application commands remain denied until scoped identity and authorisation are implemented.

The separate Java stack-proof module exercises Spring-managed Flowable BPMN/DMN engines on a shared PostgreSQL datasource and transaction manager. It includes a synthetic human review task, a persisted timer, case/audit/outbox writes and native OR-Tools scheduling probes. All bundled workflows, identities and dates are synthetic. Regulatory verification and decisions remain with authorised officials.

## Local service and UI

Requirements: Docker Engine/Desktop with Compose v2, Python 3.10+, Node 22.13+ (22.x) or 24+, and JDK 21 for native Java development. Container and UI dependencies are version pinned. No external API keys, AI model, paid service or cloud account is required.

```powershell
python scripts/init_dev.py
docker compose up --build -d
cd frontend
npm ci --ignore-scripts
npm run dev
```

Open http://localhost:5173. The UI proxies API requests to the backend at http://127.0.0.1:8080. Platform metadata is at `/api/v1/platform`; readiness is at `/actuator/health/readiness`. A database failure makes readiness fail. The initial Flyway migration creates platform metadata only and refuses automatic baselining or database cleaning.

The generator refuses to overwrite an existing `.env` or private storage configuration and never prints credentials. Keep both local. Do not substitute the committed example placeholders for generated credentials. Unix permissions restrict the generated files; on Windows they inherit the workspace ACL.

| Local service | Address | Purpose |
|---|---|---|
| PostgreSQL 17.11 | `127.0.0.1:5432` | Disposable development database |
| SeaweedFS 4.49 | `127.0.0.1:8333` | Authenticated S3 development store; no anonymous identity |
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

Surefire reports are written under `stack-proof/target/surefire-reports/`. Generated build output and database state must not be committed. A missing native runtime prerequisite is a failed setup/test, not a skipped passing test.

## What the Java tests check

- A committed start persists one human task plus the case, audit event and outbox intent.
- Failure after all start writes rolls back engine and application state together.
- Failure after task completion restores the task, removes its uncommitted timer and rolls back the application intents.
- Terminating the uncommitted PostgreSQL session leaves no committed orphan.
- The DMN table maps three synthetic categories; unknown values do not receive a guessed route.
- A timer remains in PostgreSQL after the engine closes; the restarted async worker creates one follow-up task.
- The native solver respects precedence/non-overlap and distinguishes an impossible horizon from a feasible schedule.

Audit/outbox tables here store transactional proof intents only. This does not implement a production audit security model, delivery worker, regulatory authorisation or full EVC optimisation.

Verified locally on Windows amd64 with JDK 21: all eight Java tests pass with no skips. The build workflow separately checks Windows and the Linux amd64 container; local Windows success alone does not establish container compatibility.

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
