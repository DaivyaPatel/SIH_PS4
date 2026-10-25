package in.sih.aicte.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.CaseStatus;
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
@Import(WorkflowTransitionTest.TestInfrastructure.class)
class WorkflowTransitionTest {

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
    void guardedTransitionRejectsApprovalWhenOpenDeficienciesRemain() throws Exception {
        UUID greenfieldId = UUID.fromString("33333333-3333-3333-3333-333333333003");
        WorkflowDto.TransitionRequest request = new WorkflowDto.TransitionRequest(
                WorkflowDto.TransitionAction.SCRUTINY_PASS,
                "SCRUTINY_OFFICER",
                "officer@aicte.gov.in",
                "Attempted premature scrutiny clearance."
        );

        mvc.perform(post("/api/v1/cases/" + greenfieldId + "/transition")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid transition"))
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("unresolved deficiencies")));

        // Verify status remains DEFICIENCY_RESUBMITTED
        var appCase = caseRepository.findById(greenfieldId).orElseThrow();
        assertThat(appCase.getStatus()).isEqualTo(CaseStatus.DEFICIENCY_RESUBMITTED);
    }

    @Test
    void validTransitionAdvancesStateAndLogsAuditEvent() throws Exception {
        UUID nationalPolyId = UUID.fromString("33333333-3333-3333-3333-333333333004"); // EVC_SCHEDULED
        WorkflowDto.TransitionRequest request = new WorkflowDto.TransitionRequest(
                WorkflowDto.TransitionAction.COMPLETE_EVC,
                "EVC_CHAIRMAN",
                "prof.sharma@iitm.ac.in",
                "Physical inspection concluded with satisfactory verification of campus infrastructure."
        );

        mvc.perform(post("/api/v1/cases/" + nationalPolyId + "/transition")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.previousStatus").value("EVC_SCHEDULED"))
                .andExpect(jsonPath("$.newStatus").value("EVC_COMPLETED"))
                .andExpect(jsonPath("$.currentStage").value("REGIONAL_COMMITTEE_REVIEW"))
                .andExpect(jsonPath("$.readinessScore").value(96))
                .andExpect(jsonPath("$.auditEventId").isString());

        // Verify DB update
        var appCase = caseRepository.findById(nationalPolyId).orElseThrow();
        assertThat(appCase.getStatus()).isEqualTo(CaseStatus.EVC_COMPLETED);
        assertThat(appCase.getReadinessScore()).isEqualTo(96);

        // Verify Audit Trail reflects transition
        mvc.perform(get("/api/v1/cases/" + nationalPolyId + "/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[-1:].action").value("COMPLETE_EVC"))
                .andExpect(jsonPath("$[-1:].newState").value("EVC_COMPLETED"));
    }

    @Test
    void transitionRejectsInvalidActionForCurrentStatus() throws Exception {
        UUID nationalPolyId = UUID.fromString("33333333-3333-3333-3333-333333333004");
        // ASSIGN_SCRUTINY is invalid when status is not SUBMITTED
        WorkflowDto.TransitionRequest request = new WorkflowDto.TransitionRequest(
                WorkflowDto.TransitionAction.ASSIGN_SCRUTINY,
                "SCRUTINY_OFFICER",
                "officer@aicte.gov.in",
                "Invalid assignment."
        );

        mvc.perform(post("/api/v1/cases/" + nationalPolyId + "/transition")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid transition"));
    }

    @Test
    void rejectTransitionMovesCaseToRejected() throws Exception {
        UUID saraswatiId = UUID.fromString("33333333-3333-3333-3333-333333333002");
        WorkflowDto.TransitionRequest request = new WorkflowDto.TransitionRequest(
                WorkflowDto.TransitionAction.REJECT,
                "REGIONAL_OFFICER",
                "director.nro@aicte-india.org",
                "Application rejected due to statutory document non-compliance."
        );

        mvc.perform(post("/api/v1/cases/" + saraswatiId + "/transition")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newStatus").value("REJECTED"))
                .andExpect(jsonPath("$.currentStage").value("REJECTED"));

        var appCase = caseRepository.findById(saraswatiId).orElseThrow();
        assertThat(appCase.getStatus()).isEqualTo(CaseStatus.REJECTED);
    }

    @Test
    void recommendApprovalAdvancesCaseWithoutDeficienciesToApproved() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001"); // EVC_PENDING, 0 deficiencies
        WorkflowDto.TransitionRequest request = new WorkflowDto.TransitionRequest(
                WorkflowDto.TransitionAction.RECOMMEND_APPROVAL,
                "REGIONAL_COMMITTEE",
                "chairman.rc@aicte.gov.in",
                "All statutory norms met. Unanimously recommended for Extension of Approval."
        );

        mvc.perform(post("/api/v1/cases/" + apexId + "/transition")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.previousStatus").value("EVC_PENDING"))
                .andExpect(jsonPath("$.newStatus").value("APPROVED"))
                .andExpect(jsonPath("$.currentStage").value("COMPLETED"))
                .andExpect(jsonPath("$.readinessScore").value(100));

        var appCase = caseRepository.findById(apexId).orElseThrow();
        assertThat(appCase.getStatus()).isEqualTo(CaseStatus.APPROVED);
        assertThat(appCase.getReadinessScore()).isEqualTo(100);
    }
}
