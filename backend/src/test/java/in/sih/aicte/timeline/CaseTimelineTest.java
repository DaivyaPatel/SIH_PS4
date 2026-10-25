package in.sih.aicte.timeline;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Import(CaseTimelineTest.TestInfrastructure.class)
class CaseTimelineTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

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
    void apexInstituteTimelineContainsAuditAndMilestones() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");

        mvc.perform(get("/api/v1/cases/" + apexId + "/timeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value(apexId.toString()))
                .andExpect(jsonPath("$.applicationNumber").value("APP-2026-WRO-001"))
                .andExpect(jsonPath("$.currentStatus").value("EVC_PENDING"))
                .andExpect(jsonPath("$.totalEvents").value(org.hamcrest.Matchers.greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.milestones.length()").value(5))
                .andExpect(jsonPath("$.milestones[0].id").value("M1_INGESTION"))
                .andExpect(jsonPath("$.milestones[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$.events[0].formattedIstTime").value(org.hamcrest.Matchers.containsString("IST")))
                .andExpect(jsonPath("$.events[0].timeAgo").isNotEmpty())
                .andExpect(jsonPath("$.events[0].badgeColor").isNotEmpty());
    }

    @Test
    void saraswatiTimelineContainsDeficiencyEventsAndAscDescSorting() throws Exception {
        UUID saraswatiId = UUID.fromString("33333333-3333-3333-3333-333333333002");

        var ascResponse = mvc.perform(get("/api/v1/cases/" + saraswatiId + "/timeline?sort=asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.milestones[2].id").value("M3_DEFICIENCY"))
                .andExpect(jsonPath("$.milestones[2].status").value("WARNING"))
                .andReturn().getResponse().getContentAsString();

        var descResponse = mvc.perform(get("/api/v1/cases/" + saraswatiId + "/timeline?sort=desc"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        TimelineDto.CaseTimelineResponse ascObj =
                mapper.readValue(ascResponse, TimelineDto.CaseTimelineResponse.class);
        TimelineDto.CaseTimelineResponse descObj =
                mapper.readValue(descResponse, TimelineDto.CaseTimelineResponse.class);

        assertThat(ascObj.events()).isNotEmpty();
        assertThat(descObj.events()).isNotEmpty();
        assertThat(ascObj.events().get(0).timestamp())
                .isBeforeOrEqualTo(ascObj.events().get(ascObj.events().size() - 1).timestamp());
        assertThat(descObj.events().get(0).timestamp())
                .isAfterOrEqualTo(descObj.events().get(descObj.events().size() - 1).timestamp());
    }

    @Test
    void unknownCaseReturns404() throws Exception {
        UUID unknownId = UUID.randomUUID();
        mvc.perform(get("/api/v1/cases/" + unknownId + "/timeline"))
                .andExpect(status().isNotFound());
    }
}
