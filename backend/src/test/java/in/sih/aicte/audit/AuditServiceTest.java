package in.sih.aicte.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.zaxxer.hikari.HikariDataSource;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.util.NoSuchElementException;
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
@Import(AuditServiceTest.TestInfrastructure.class)
class AuditServiceTest {

    @Autowired MockMvc mvc;
    @Autowired AuditService auditService;
    @Autowired AuditEventRepository auditRepository;

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
    void getAuditTrailViaApiReturnsChronologicalEvents() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");
        mvc.perform(get("/api/v1/cases/" + apexId + "/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].action").value("APPLICATION_SUBMITTED"))
                .andExpect(jsonPath("$[0].actorRole").value("INSTITUTION_ADMIN"))
                .andExpect(jsonPath("$[1].action").value("SCRUTINY_ASSIGNED"))
                .andExpect(jsonPath("$[2].action").value("SCRUTINY_CLEARED"))
                .andExpect(jsonPath("$[2].previousState").value("UNDER_SCRUTINY"))
                .andExpect(jsonPath("$[2].newState").value("EVC_PENDING"));
    }

    @Test
    void getAuditTrailForDeficiencyCaseReflectsFlaggedAction() throws Exception {
        UUID saraswatiId = UUID.fromString("33333333-3333-3333-3333-333333333002");
        mvc.perform(get("/api/v1/cases/" + saraswatiId + "/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].action").value("DEFICIENCY_ISSUED"))
                .andExpect(jsonPath("$[1].newState").value("DEFICIENCY_FLAGGED"))
                .andExpect(jsonPath("$[1].details").value(org.hamcrest.Matchers.containsString("Fire NOC expired")));
    }

    @Test
    void getAuditTrailForNonExistentCaseReturns404() throws Exception {
        UUID nonExistent = UUID.randomUUID();
        mvc.perform(get("/api/v1/cases/" + nonExistent + "/audit"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Not found"));
    }

    @Test
    void recordEventPersistsImmutableEventSuccessfully() {
        UUID caseId = UUID.fromString("33333333-3333-3333-3333-333333333001");
        int countBefore = auditRepository.findByCaseIdOrderByCreatedAtAsc(caseId).size();

        AuditDto.AuditEventRecord recorded = auditService.recordEvent(
                caseId,
                "MANUAL_NOTE_ADDED",
                "SCRUTINY_OFFICER",
                "officer@aicte.gov.in",
                "EVC_PENDING",
                "EVC_PENDING",
                "Verified building blueprint against municipal master plan.",
                "corr-test-123"
        );

        assertThat(recorded.id()).isNotNull();
        assertThat(recorded.action()).isEqualTo("MANUAL_NOTE_ADDED");
        assertThat(recorded.correlationId()).isEqualTo("corr-test-123");

        int countAfter = auditRepository.findByCaseIdOrderByCreatedAtAsc(caseId).size();
        assertThat(countAfter).isEqualTo(countBefore + 1);
    }

    @Test
    void recordEventForNonExistentCaseFailsFast() {
        UUID fakeCaseId = UUID.randomUUID();
        assertThatThrownBy(() -> auditService.recordEvent(
                fakeCaseId,
                "ANY_ACTION",
                "ROLE",
                "user",
                null,
                null,
                "detail",
                "corr"
        )).isInstanceOf(NoSuchElementException.class);
    }
}
