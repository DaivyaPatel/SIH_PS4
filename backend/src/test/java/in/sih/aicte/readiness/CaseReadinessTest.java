package in.sih.aicte.readiness;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Import(CaseReadinessTest.TestInfrastructure.class)
class CaseReadinessTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ApplicationCaseRepository caseRepository;

    @TestConfiguration(proxyBeanMethods = false)
    static class TestInfrastructure {
        @Bean(destroyMethod = "close")
        EmbeddedPostgres postgres() throws IOException {
            return EmbeddedPostgres.builder().setPort(0).setServerConfig("listen_addresses", "127.0.0.1").start();
        }

        @Bean(destroyMethod = "close")
        HikariDataSource datasource(EmbeddedPostgres postgres) {
            var pool = new HikariDataSource();
            pool.setJdbcUrl(postgres.getJdbcUrl("postgres", "postgres"));
            pool.setUsername("postgres");
            pool.setPassword("");
            return pool;
        }
    }

    @Test
    void apexInstituteReadinessScrutinyCleared() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");

        mvc.perform(get("/api/v1/cases/" + apexId + "/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value(apexId.toString()))
                .andExpect(jsonPath("$.applicationNumber").value("APP-2026-WRO-001"))
                .andExpect(jsonPath("$.status").value("EVC_PENDING"))
                .andExpect(jsonPath("$.readinessScore").value(org.hamcrest.Matchers.greaterThanOrEqualTo(85)))
                .andExpect(jsonPath("$.criteria.length()").value(4))
                .andExpect(jsonPath("$.recommendedNextActions[0].actionType").value("SCHEDULE_EVC_VISIT"))
                .andExpect(jsonPath("$.recommendedNextActions[0].targetEndpoint").value("/api/v1/evc/optimize-schedule"));
    }

    @Test
    void saraswatiDeficiencyFlaggedReadinessIdentifiesBlockingPrerequisites() throws Exception {
        UUID saraswatiId = UUID.fromString("33333333-3333-3333-3333-333333333002");

        mvc.perform(get("/api/v1/cases/" + saraswatiId + "/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value(saraswatiId.toString()))
                .andExpect(jsonPath("$.status").value("DEFICIENCY_FLAGGED"))
                .andExpect(jsonPath("$.readyForNextStage").value(false))
                .andExpect(jsonPath("$.blockingPrerequisites.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.recommendedNextActions").isNotEmpty());
    }

    @Test
    void greenfieldPharmacyResubmittedReadinessShowsScrutinyPending() throws Exception {
        UUID greenfieldId = UUID.fromString("33333333-3333-3333-3333-333333333003");

        mvc.perform(get("/api/v1/cases/" + greenfieldId + "/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value(greenfieldId.toString()))
                .andExpect(jsonPath("$.status").value("DEFICIENCY_RESUBMITTED"))
                .andExpect(jsonPath("$.nextTargetStage").value("EVC_PENDING"))
                .andExpect(jsonPath("$.recommendedNextActions[0].targetRole").value("SCRUTINY_OFFICER"));
    }

    @Test
    void overdueDeadlineReducesReadinessAndAddsDeadlineBreach() throws Exception {
        UUID polyId = UUID.fromString("33333333-3333-3333-3333-333333333004");
        ApplicationCase polyCase = caseRepository.findById(polyId).orElseThrow();
        polyCase.setDeadlineAt(Instant.now().minus(3, ChronoUnit.DAYS));
        caseRepository.save(polyCase);

        mvc.perform(get("/api/v1/cases/" + polyId + "/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.blockingPrerequisites[?(@.id == 'STATUTORY_DEADLINE_BREACH')]").exists())
                .andExpect(jsonPath("$.recommendedNextActions[?(@.actionType == 'REQUEST_DEADLINE_EXTENSION')]").exists());
    }

    @Test
    void unknownCaseThrows404() throws Exception {
        UUID unknownId = UUID.randomUUID();
        mvc.perform(get("/api/v1/cases/" + unknownId + "/readiness"))
                .andExpect(status().isNotFound());
    }
}
