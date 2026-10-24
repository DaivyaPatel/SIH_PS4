# AICTE Approval Workflow Automation

An integration-first project for approval-workflow coordination, EVC scheduling, institutional compliance, document validity, alerts and traceable actions. Regulatory verification and decisions remain with the competent authorities.

## Current implementation

The Java stack-proof module exercises Spring-managed Flowable BPMN/DMN engines on a shared PostgreSQL datasource and transaction manager. It includes a synthetic human review task, a persisted timer, case/audit/outbox writes and native OR-Tools scheduling probes.

This is a compatibility proof, not an approval portal or production workflow backend. There are no public application endpoints, real institution records, external notifications or autonomous statutory decisions. All bundled workflows, users and dates are synthetic.

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

Verified locally on Windows amd64 with JDK 21: all eight Java tests pass with no skips. Linux container verification is a separate check; local Windows success does not establish container compatibility.

## Run the packaged native probe

After a successful build:

```powershell
java -jar stack-proof/target/stack-proof-0.1.0-SNAPSHOT.jar --probe-native
```

The probe loads the JNI libraries from the OR-Tools platform jars and solves one feasible and one infeasible model without a database. The default non-web Spring application instead requires `PROOF_DATABASE_URL`, `PROOF_DATABASE_USER` and `PROOF_DATABASE_PASSWORD`. It creates proof tables and Flowable schemas automatically: use only a new disposable test database, never an existing institution or production database. No HTTP listener is exposed.

## Synthetic policy specification

```powershell
python scripts/check_synthetic_policy.py
```

This separate offline checker validates three route examples and 74 expected routing/compliance cases. The Java stack proof does not yet implement the full fixture-backed regulatory domain. The future backend must pass those cases through its own guarded commands.

## Repository structure

```text
.mvn/wrapper/                 # Checksum-pinned Maven bootstrap configuration
config/policies/synthetic/    # Synthetic rule definitions and expected cases
scripts/                     # Offline specification checker
stack-proof/
  src/main/java/             # Engine configuration, transaction and native probes
  src/main/resources/        # Synthetic BPMN/DMN, proof SQL, component metadata
  src/test/java/             # PostgreSQL persistence and native solver checks
pom.xml                      # Parent build and pinned component versions
mvnw / mvnw.cmd              # Maven wrapper entry points
```

Keep credentials, private exports, institutional evidence and generated state out of Git. Use fabricated data and isolated test destinations during development. Application APIs, identity integration, document storage and UI modules follow this foundation proof.
