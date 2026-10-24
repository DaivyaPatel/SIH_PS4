package in.sih.aicte.proof;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.awaitility.Awaitility.await;

import com.zaxxer.hikari.HikariDataSource;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import javax.sql.DataSource;
import org.flowable.dmn.api.DmnDecisionService;
import org.flowable.engine.ProcessEngine;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.spring.SpringProcessEngineConfiguration;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Import(WorkflowPersistenceTest.PostgreSQLLifecycle.class)
class WorkflowPersistenceTest {
    // Real PostgreSQL binaries, random loopback port and disposable data; no H2 substitution.
    private static final EmbeddedPostgres POSTGRES = startPostgres();

    @Autowired ProofCaseService cases;
    @Autowired JdbcTemplate jdbc;
    @Autowired RuntimeService runtime;
    @Autowired TaskService tasks;
    @Autowired ProcessEngine engine;
    @Autowired DmnDecisionService decisions;
    @Autowired DataSource dataSource;
    @Autowired PlatformTransactionManager transactions;

    private static EmbeddedPostgres startPostgres() {
        try {
            return EmbeddedPostgres.builder().setPort(0)
                    .setServerConfig("listen_addresses", "127.0.0.1").start();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to start disposable PostgreSQL", exception);
        }
    }

    @DynamicPropertySource
    static void datasource(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> POSTGRES.getJdbcUrl("postgres", "postgres"));
        properties.add("spring.datasource.username", () -> "postgres");
        properties.add("spring.datasource.password", () -> "");
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class PostgreSQLLifecycle {
        @Bean(destroyMethod = "close")
        EmbeddedPostgres postgresForTests() {
            return POSTGRES;
        }

        @Bean(destroyMethod = "close")
        HikariDataSource testDataSource(EmbeddedPostgres postgres) {
            var datasource = new HikariDataSource();
            datasource.setJdbcUrl(postgres.getJdbcUrl("postgres", "postgres"));
            datasource.setUsername("postgres");
            datasource.setPassword("");
            datasource.setMaximumPoolSize(4);
            return datasource;
        }
    }

    @Test
    @Order(1)
    void committedStartContainsTaskCaseAuditAndOutbox() {
        assertThat(jdbc.queryForObject("show server_version", String.class)).startsWith("17.11");
        String id = "DEMO-" + UUID.randomUUID();
        String processId = cases.start(id, false);
        assertThat(runtime.createProcessInstanceQuery().processInstanceId(processId).count()).isEqualTo(1);
        var task = tasks.createTaskQuery().processInstanceId(processId).singleResult();
        assertThat(task.getTaskDefinitionKey()).isEqualTo("review");
        assertThat(task.getAssignee()).isEqualTo("demo-reviewer");
        assertThat(count("proof_case", id)).isEqualTo(1);
        assertThat(count("proof_audit", id)).isEqualTo(1);
        assertThat(count("proof_outbox", id)).isEqualTo(1);
    }

    @Test
    @Order(2)
    void failureAfterAllStartWritesRollsBackAllFourParticipants() {
        String id = "DEMO-" + UUID.randomUUID();
        assertThatThrownBy(() -> cases.start(id, true)).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Injected failure after engine, case, audit and outbox writes");
        assertThat(runtime.createProcessInstanceQuery().processInstanceBusinessKey(id).count()).isZero();
        assertThat(tasks.createTaskQuery().processInstanceBusinessKey(id).count()).isZero();
        assertThat(count("proof_case", id)).isZero();
        assertThat(count("proof_audit", id)).isZero();
        assertThat(count("proof_outbox", id)).isZero();
    }

    @Test
    @Order(3)
    void completingTaskAndCreatingTimerRollBackWithDomainIntents() {
        String id = "DEMO-" + UUID.randomUUID();
        String processId = cases.start(id, false);
        String taskId = tasks.createTaskQuery().processInstanceId(processId).singleResult().getId();
        assertThatThrownBy(() -> cases.completeReview(id, true)).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Injected failure after task completion and timer creation");
        assertThat(tasks.createTaskQuery().taskId(taskId).count()).isEqualTo(1);
        assertThat(engine.getManagementService().createTimerJobQuery().processInstanceId(processId).count()).isZero();
        assertThat(jdbc.queryForObject("select state from proof_case where id = ?", String.class, id)).isEqualTo("REVIEW_PENDING");
        assertThat(count("proof_audit", id)).isEqualTo(1);
        assertThat(count("proof_outbox", id)).isEqualTo(1);
    }

    @Test
    @Order(4)
    void postgresConnectionLossLeavesNoCommittedOrphan() {
        String id = "DEMO-" + UUID.randomUUID();
        var transaction = new TransactionTemplate(transactions);
        var connectionKilled = new AtomicBoolean(false);
        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> {
            cases.start(id, false); // Joins this outer transaction, including engine, audit and outbox.
            Integer backendPid = jdbc.queryForObject("select pg_backend_pid()", Integer.class);
            // A separate PostgreSQL connection kills the uncommitted session, simulating abrupt loss.
            var control = new JdbcTemplate(POSTGRES.getPostgresDatabase());
            assertThat(control.queryForObject("select pg_terminate_backend(?)", Boolean.class, backendPid)).isTrue();
            connectionKilled.set(true);
            jdbc.queryForObject("select 1", Integer.class);
        })).isInstanceOf(RuntimeException.class);
        assertThat(connectionKilled.get()).isTrue();
        assertThat(runtime.createProcessInstanceQuery().processInstanceBusinessKey(id).count()).isZero();
        assertThat(count("proof_case", id)).isZero();
        assertThat(count("proof_audit", id)).isZero();
        assertThat(count("proof_outbox", id)).isZero();
    }

    @Test
    @Order(5)
    void decisionTableMapsSyntheticCategoriesAndDoesNotGuessUnknowns() {
        for (var entry : java.util.Map.of("DEMO-CATEGORY-A", "DEMO-SCRUTINY",
                "DEMO-CATEGORY-B", "DEMO-SCRUTINY-EVC", "DEMO-CATEGORY-C", "DEMO-EVC").entrySet()) {
            var result = decisions.createExecuteDecisionBuilder().decisionKey("syntheticRoute")
                    .variable("category", entry.getKey()).executeWithSingleResult();
            assertThat(result).containsEntry("route", entry.getValue());
        }
        var unmatched = decisions.createExecuteDecisionBuilder().decisionKey("syntheticRoute")
                .variable("category", "UNMAPPED").executeWithSingleResult();
        assertThat(unmatched).isNullOrEmpty();
    }

    @Test
    @Order(6)
    void timerSurvivesEngineRestartAndAsyncWorkerCreatesOneFollowUp() {
        String id = "DEMO-" + UUID.randomUUID();
        String processId = cases.start(id, false);
        cases.completeReview(id, false);
        var timer = engine.getManagementService().createTimerJobQuery().processInstanceId(processId).singleResult();
        assertThat(timer).isNotNull();
        String timerId = timer.getId();
        engine.close();

        var restoredConfiguration = new SpringProcessEngineConfiguration();
        restoredConfiguration.setDataSource(dataSource);
        restoredConfiguration.setTransactionManager(transactions);
        restoredConfiguration.setDatabaseSchemaUpdate("false");
        restoredConfiguration.setAsyncExecutorActivate(false);
        ProcessEngine restored = restoredConfiguration.buildProcessEngine();
        try {
            assertThat(restored.getManagementService().createTimerJobQuery().jobId(timerId).count()).isEqualTo(1);
            restored.getProcessEngineConfiguration().getAsyncExecutor().start();
            await().atMost(Duration.ofSeconds(45)).pollInterval(Duration.ofMillis(100)).untilAsserted(() -> {
                var followUp = restored.getTaskService().createTaskQuery().processInstanceId(processId).singleResult();
                assertThat(followUp).isNotNull();
                assertThat(followUp.getTaskDefinitionKey()).isEqualTo("followUp");
                assertThat(restored.getManagementService().createTimerJobQuery().processInstanceId(processId).count()).isZero();
                assertThat(restored.getManagementService().createDeadLetterJobQuery().processInstanceId(processId).count()).isZero();
            });
            assertThat(restored.getTaskService().createTaskQuery().processInstanceId(processId).count()).isEqualTo(1);
            assertThat(count("proof_audit", id)).isEqualTo(2);
            assertThat(count("proof_outbox", id)).isEqualTo(2);
        } finally {
            restored.close();
        }
    }

    private long count(String table, String id) {
        // Identifiers are private constants from these tests, never input from a user.
        String key = table.equals("proof_case") ? "id" : "case_id";
        return jdbc.queryForObject("select count(*) from " + table + " where " + key + " = ?", Long.class, id);
    }
}
