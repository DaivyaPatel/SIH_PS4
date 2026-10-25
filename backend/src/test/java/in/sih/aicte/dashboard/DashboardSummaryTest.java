package in.sih.aicte.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
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
@Import(DashboardSummaryTest.TestInfrastructure.class)
class DashboardSummaryTest {

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
    void summaryReturnsAccurateExecutiveKpiCardsAndBreakdowns() throws Exception {
        var response = mvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.academicYear").value("2026-27"))
                .andExpect(jsonPath("$.kpiCards.totalColleges").value(org.hamcrest.Matchers.greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.kpiCards.averageReadinessScore").value(org.hamcrest.Matchers.greaterThan(0.0)))
                .andExpect(jsonPath("$.compliance.overallComplianceRate").value(org.hamcrest.Matchers.greaterThan(0.0)))
                .andExpect(jsonPath("$.evc.totalActiveExperts").value(org.hamcrest.Matchers.greaterThanOrEqualTo(10)))
                .andExpect(jsonPath("$.statusDistribution.EVC_PENDING").exists())
                .andExpect(jsonPath("$.regionalDistribution.WRO").exists())
                .andReturn().getResponse().getContentAsString();

        DashboardDto.DashboardSummary summary = mapper.readValue(response, DashboardDto.DashboardSummary.class);
        assertThat(summary.kpiCards().totalColleges()).isGreaterThanOrEqualTo(5);
        assertThat(summary.compliance().totalCases()).isEqualTo(summary.kpiCards().totalColleges());
    }

    @Test
    void regionalFilteringRestrictsScope() throws Exception {
        mvc.perform(get("/api/v1/dashboard/summary?region=WRO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.filteredRegion").value("WRO"))
                .andExpect(jsonPath("$.kpiCards.totalColleges").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.regionalDistribution.WRO").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.regionalDistribution.SRO").doesNotExist());
    }

    @Test
    void invalidRegionReturns400Problem() throws Exception {
        mvc.perform(get("/api/v1/dashboard/summary?region=NON_EXISTENT_REGION"))
                .andExpect(status().isBadRequest());
    }
}
