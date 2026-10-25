package in.sih.aicte.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.Region;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Import(IntegrationControllerTest.TestInfrastructure.class)
class IntegrationControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ApplicationCaseRepository caseRepository;
    @Autowired IntegrationReceiptRepository receiptRepository;

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
    void syncPortalWithEmptyBodyIngestsDefaultPortalApplication() throws Exception {
        var responseBody = mvc.perform(post("/api/v1/integration/sync-portal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.outcome").value("INGESTED"))
                .andExpect(jsonPath("$.applicationNumber").value("APP-2026-ERO-006"))
                .andExpect(jsonPath("$.receiptId").isString())
                .andExpect(jsonPath("$.caseId").isString())
                .andReturn().getResponse().getContentAsString();

        var receipt = mapper.readTree(responseBody);
        UUID caseId = UUID.fromString(receipt.get("caseId").asText());

        var appCase = caseRepository.findById(caseId);
        assertThat(appCase).isPresent();
        assertThat(appCase.get().getStatus().name()).isEqualTo("SUBMITTED");
        assertThat(appCase.get().getInstitution().getName()).contains("Kolkata Institute");

        // Verify audit log has the ingestion event
        mvc.perform(get("/api/v1/cases/" + caseId + "/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].action").value("APPLICATION_INGESTED_FROM_PORTAL"));
    }

    @Test
    void resyncingSameApplicationIsIdempotentAndSkipsDuplicate() throws Exception {
        // Initial sync of a unique application
        IntegrationDto.PortalSyncRequest req = new IntegrationDto.PortalSyncRequest(
                "APP-2026-SRO-IDEMPOTENT-01",
                "1-99887766",
                "Bangalore Tech Institute",
                "ENGINEERING_COLLEGE",
                Region.SRO,
                "2026-27",
                "EXTENSION_OF_APPROVAL",
                "Whitefield, Bangalore, Karnataka",
                "info@bangaloretech.edu",
                2019,
                "Whitefield Campus",
                new BigDecimal("12.00"),
                new BigDecimal("18000.00")
        );

        var firstCall = mvc.perform(post("/api/v1/integration/sync-portal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.outcome").value("INGESTED"))
                .andReturn().getResponse().getContentAsString();

        UUID firstCaseId = UUID.fromString(mapper.readTree(firstCall).get("caseId").asText());
        long caseCountBefore = caseRepository.count();

        // Second call with the same application payload
        mvc.perform(post("/api/v1/integration/sync-portal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.outcome").value("DUPLICATE_SKIPPED"))
                .andExpect(jsonPath("$.caseId").value(firstCaseId.toString()))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Duplicate")));

        long caseCountAfter = caseRepository.count();
        assertThat(caseCountAfter).isEqualTo(caseCountBefore);
    }

    @Test
    void integrationStatusReturnsActiveConnectorMetrics() throws Exception {
        mvc.perform(get("/api/v1/integration/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(true))
                .andExpect(jsonPath("$.sourcePortal").value("AICTE National Approval Portal Connector v26.1"))
                .andExpect(jsonPath("$.totalSyncCount").isNumber());
    }
}
