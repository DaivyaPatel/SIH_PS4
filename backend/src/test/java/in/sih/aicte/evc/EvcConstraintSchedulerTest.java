package in.sih.aicte.evc;

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
import java.time.LocalDate;
import java.util.List;
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
@Import(EvcConstraintSchedulerTest.TestInfrastructure.class)
class EvcConstraintSchedulerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ApplicationCaseRepository caseRepository;
    @Autowired ExpertRepository expertRepository;

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
    void optimizeScheduleSuccessfullyAssignsCommitteeWithHardConflictExclusion() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001"); // Apex Institute (EVC_PENDING)

        EvcDto.ScheduleOptimizationRequest request = new EvcDto.ScheduleOptimizationRequest(
                List.of(apexId),
                LocalDate.of(2026, 11, 10),
                LocalDate.of(2026, 11, 20),
                2,
                2
        );

        var result = mvc.perform(post("/api/v1/evc/optimize-schedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solverStatus").value(org.hamcrest.Matchers.isOneOf("OPTIMAL", "FEASIBLE")))
                .andExpect(jsonPath("$.totalCasesScheduled").value(1))
                .andExpect(jsonPath("$.scheduledVisits.length()").value(1))
                .andExpect(jsonPath("$.scheduledVisits[0].caseId").value(apexId.toString()))
                .andExpect(jsonPath("$.scheduledVisits[0].committeeMembers.length()").value(2))
                .andExpect(jsonPath("$.scheduledVisits[0].committeeMembers[0].role").value("CHAIRMAN"))
                .andExpect(jsonPath("$.scheduledVisits[0].committeeMembers[1].role").value("MEMBER"))
                .andReturn().getResponse().getContentAsString();

        var tree = mapper.readTree(result);
        var visit = tree.get("scheduledVisits").get(0);
        String scheduledDateStr = visit.get("scheduledInspectionDate").asText();
        LocalDate scheduledDate = LocalDate.parse(scheduledDateStr);

        // Verify that Prof. Sunita Deshmukh (conflicted with Apex Institute) is NOT assigned
        var members = visit.get("committeeMembers");
        for (var member : members) {
            assertThat(member.get("name").asText())
                    .isNotEqualTo("Prof. Sunita Deshmukh");
            // Verify assigned expert is actually available on the scheduled date
            UUID expertId = UUID.fromString(member.get("expertId").asText());
            Expert expert = expertRepository.findById(expertId).orElseThrow();
            assertThat(expert.isAvailableOn(scheduledDate)).isTrue();
        }

        // Verify DB update: case transitioned to EVC_SCHEDULED
        var appCase = caseRepository.findById(apexId).orElseThrow();
        assertThat(appCase.getStatus()).isEqualTo(CaseStatus.EVC_SCHEDULED);
        assertThat(appCase.getCurrentStage()).isEqualTo("EVC_INSPECTION");
        assertThat(appCase.getReadinessScore()).isEqualTo(88);
        assertThat(appCase.getDeadlineAt()).isNotNull();

        // Verify audit log has SCHEDULE_EVC
        mvc.perform(get("/api/v1/cases/" + apexId + "/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[-1:].action").value("SCHEDULE_EVC"))
                .andExpect(jsonPath("$[-1:].newState").value("EVC_SCHEDULED"));
    }

    @Test
    void optimizeScheduleEnforcesNonOverlappingVisitsForExperts() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");
        UUID nationalPolyId = UUID.fromString("33333333-3333-3333-3333-333333333004");

        EvcDto.ScheduleOptimizationRequest request = new EvcDto.ScheduleOptimizationRequest(
                List.of(apexId, nationalPolyId),
                LocalDate.of(2026, 11, 10),
                LocalDate.of(2026, 11, 20),
                2,
                2
        );

        var result = mvc.perform(post("/api/v1/evc/optimize-schedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solverStatus").value(org.hamcrest.Matchers.isOneOf("OPTIMAL", "FEASIBLE")))
                .andExpect(jsonPath("$.totalCasesScheduled").value(2))
                .andReturn().getResponse().getContentAsString();

        var tree = mapper.readTree(result);
        var visits = tree.get("scheduledVisits");

        // Verify no expert is assigned to multiple colleges on the same day
        java.util.Set<String> expertDayPairs = new java.util.HashSet<>();
        for (var visit : visits) {
            String date = visit.get("scheduledInspectionDate").asText();
            for (var member : visit.get("committeeMembers")) {
                String expertId = member.get("expertId").asText();
                String pair = expertId + "@" + date;
                assertThat(expertDayPairs).doesNotContain(pair);
                expertDayPairs.add(pair);
            }
        }
    }

    @Test
    void optimizeScheduleWithEmptyCasesReturnsCleanNoCasesResponse() throws Exception {
        EvcDto.ScheduleOptimizationRequest request = new EvcDto.ScheduleOptimizationRequest(
                List.of(UUID.randomUUID()), // Non-existent case ID
                LocalDate.of(2026, 11, 10),
                LocalDate.of(2026, 11, 20),
                2,
                2
        );

        mvc.perform(post("/api/v1/evc/optimize-schedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solverStatus").value("NO_CASES"))
                .andExpect(jsonPath("$.totalCasesScheduled").value(0));
    }
}
