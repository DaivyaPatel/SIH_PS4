package in.sih.aicte.cases;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
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
@Import(DeficiencyLifecycleTest.TestInfrastructure.class)
class DeficiencyLifecycleTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ApplicationCaseRepository caseRepository;
    @Autowired DeficiencyRepository deficiencyRepository;

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
    void flagDeficiencyTransitionsCaseToDeficiencyFlaggedAndLogsAudit() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");
        DeficiencyDto.FlagDeficiencyRequest request = new DeficiencyDto.FlagDeficiencyRequest(
                "FACULTY_CADRE_RATIO",
                "Cadre ratio deficit: Missing Professor in Computer Science department.",
                10,
                "SCRUTINY_OFFICER",
                "officer.wro@aicte.gov.in"
        );

        mvc.perform(post("/api/v1/cases/" + apexId + "/deficiencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("FACULTY_CADRE_RATIO"))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.deadlineDays").value(10))
                .andExpect(jsonPath("$.caseStatus").value("DEFICIENCY_FLAGGED"))
                .andExpect(jsonPath("$.caseCurrentStage").value("DEFICIENCY_REVIEW"))
                .andExpect(jsonPath("$.auditEventId").isString());

        var appCase = caseRepository.findById(apexId).orElseThrow();
        assertThat(appCase.getStatus()).isEqualTo(CaseStatus.DEFICIENCY_FLAGGED);
        assertThat(appCase.getCurrentStage()).isEqualTo("DEFICIENCY_REVIEW");

        // Verify audit trail recorded
        mvc.perform(get("/api/v1/cases/" + apexId + "/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[-1:].action").value("FLAG_DEFICIENCY"))
                .andExpect(jsonPath("$[-1:].newState").value("DEFICIENCY_FLAGGED"));
    }

    @Test
    void respondToDeficiencyAdvancesToResubmittedWhenAllOpenAnswered() throws Exception {
        UUID saraswatiId = UUID.fromString("33333333-3333-3333-3333-333333333002");
        UUID defId1 = UUID.fromString("44444444-4444-4444-4444-444444444001");
        UUID defId2 = UUID.fromString("44444444-4444-4444-4444-444444444002");

        // Respond to first deficiency
        DeficiencyDto.RespondDeficiencyRequest request1 = new DeficiencyDto.RespondDeficiencyRequest(
                "Lease deed renewed for 5 years registered with sub-registrar.",
                "Registered_Lease_Deed_2031.pdf",
                "/documents/proofs/lease-deed-2031.pdf",
                "COLLEGE_PRINCIPAL",
                "director@saraswatieng.edu"
        );

        mvc.perform(post("/api/v1/cases/" + saraswatiId + "/deficiencies/" + defId1 + "/respond")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESUBMITTED"))
                // Second deficiency is still OPEN, so caseStatus stays DEFICIENCY_FLAGGED
                .andExpect(jsonPath("$.caseStatus").value("DEFICIENCY_FLAGGED"));

        // Respond to second deficiency
        DeficiencyDto.RespondDeficiencyRequest request2 = new DeficiencyDto.RespondDeficiencyRequest(
                "Municipal Fire NOC renewed valid until 2028.",
                "Fire_NOC_Renewed_2028.pdf",
                "/documents/proofs/fire-noc-2028.pdf",
                "COLLEGE_PRINCIPAL",
                "director@saraswatieng.edu"
        );

        mvc.perform(post("/api/v1/cases/" + saraswatiId + "/deficiencies/" + defId2 + "/respond")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESUBMITTED"))
                // All deficiencies now answered -> case transitions to DEFICIENCY_RESUBMITTED
                .andExpect(jsonPath("$.caseStatus").value("DEFICIENCY_RESUBMITTED"))
                .andExpect(jsonPath("$.caseCurrentStage").value("SCRUTINY_RE_REVIEW"));

        var appCase = caseRepository.findById(saraswatiId).orElseThrow();
        assertThat(appCase.getStatus()).isEqualTo(CaseStatus.DEFICIENCY_RESUBMITTED);
        assertThat(appCase.getCurrentStage()).isEqualTo("SCRUTINY_RE_REVIEW");
    }

    @Test
    void resolveDeficiencyAdvancesCaseToEvcPendingWhenAllDeficienciesCleared() throws Exception {
        UUID greenfieldId = UUID.fromString("33333333-3333-3333-3333-333333333003");
        UUID defId = UUID.fromString("44444444-4444-4444-4444-444444444003");

        DeficiencyDto.ResolveDeficiencyRequest request = new DeficiencyDto.ResolveDeficiencyRequest(
                "Joining letter and endorsement verified against university faculty database.",
                "SCRUTINY_OFFICER",
                "officer.nro@aicte.gov.in"
        );

        mvc.perform(post("/api/v1/cases/" + greenfieldId + "/deficiencies/" + defId + "/resolve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"))
                .andExpect(jsonPath("$.caseStatus").value("EVC_PENDING"))
                .andExpect(jsonPath("$.caseCurrentStage").value("EVC_SCHEDULING"))
                .andExpect(jsonPath("$.caseReadinessScore").value(92));

        var appCase = caseRepository.findById(greenfieldId).orElseThrow();
        assertThat(appCase.getStatus()).isEqualTo(CaseStatus.EVC_PENDING);
        assertThat(appCase.getCurrentStage()).isEqualTo("EVC_SCHEDULING");
        assertThat(appCase.getReadinessScore()).isEqualTo(92);
    }

    @Test
    void flagDeficiencyRejectsCompletedOrRejectedCase() throws Exception {
        UUID bharatId = UUID.fromString("33333333-3333-3333-3333-333333333005"); // APPROVED
        DeficiencyDto.FlagDeficiencyRequest request = new DeficiencyDto.FlagDeficiencyRequest(
                "INFRASTRUCTURE",
                "Cannot flag on approved case",
                7,
                "SCRUTINY_OFFICER",
                "officer@aicte.gov.in"
        );

        mvc.perform(post("/api/v1/cases/" + bharatId + "/deficiencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid transition"));
    }

    @Test
    void resolveDeficiencyRejectsAlreadyResolvedDeficiency() throws Exception {
        UUID nationalPolyId = UUID.fromString("33333333-3333-3333-3333-333333333004");
        DeficiencyDto.FlagDeficiencyRequest flagReq = new DeficiencyDto.FlagDeficiencyRequest(
                "LIBRARY_BOOKS",
                "Minimum title count shortfall in central library.",
                7,
                "SCRUTINY_OFFICER",
                "officer@aicte.gov.in"
        );
        String flagRes = mvc.perform(post("/api/v1/cases/" + nationalPolyId + "/deficiencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(flagReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        UUID newDefId = UUID.fromString(mapper.readTree(flagRes).get("deficiencyId").asText());

        // First resolve
        DeficiencyDto.ResolveDeficiencyRequest resolveReq = new DeficiencyDto.ResolveDeficiencyRequest(
                "Library accession register inspected and accepted.",
                "SCRUTINY_OFFICER",
                "officer@aicte.gov.in"
        );
        mvc.perform(post("/api/v1/cases/" + nationalPolyId + "/deficiencies/" + newDefId + "/resolve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(resolveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));

        // Second resolve attempt should fail
        mvc.perform(post("/api/v1/cases/" + nationalPolyId + "/deficiencies/" + newDefId + "/resolve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(resolveReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid transition"));
    }
}
