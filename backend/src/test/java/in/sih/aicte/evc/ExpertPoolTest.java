package in.sih.aicte.evc;

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
@Import(ExpertPoolTest.TestInfrastructure.class)
class ExpertPoolTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
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
    void listExpertsReturnsAllSeededExpertsWithDomainAndRegionFiltering() throws Exception {
        // List all 10 experts
        mvc.perform(get("/api/v1/evc/experts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(10))
                .andExpect(jsonPath("$[?(@.name == 'Prof. K. R. Ramanathan')].domain")
                        .value("COMPUTER_SCIENCE"))
                .andExpect(jsonPath("$[?(@.name == 'Prof. Sunita Deshmukh')].region")
                        .value("WRO"));

        // Filter by domain
        mvc.perform(get("/api/v1/evc/experts?domain=COMPUTER_SCIENCE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].domain").value("COMPUTER_SCIENCE"))
                .andExpect(jsonPath("$[1].domain").value("COMPUTER_SCIENCE"));

        // Filter by region
        mvc.perform(get("/api/v1/evc/experts?region=WRO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getExpertByIdReturnsFullProfileAndParsedAvailability() throws Exception {
        UUID ramanathanId = UUID.fromString("77777777-7777-7777-7777-777777777001");

        mvc.perform(get("/api/v1/evc/experts/" + ramanathanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ramanathanId.toString()))
                .andExpect(jsonPath("$.name").value("Prof. K. R. Ramanathan"))
                .andExpect(jsonPath("$.domain").value("COMPUTER_SCIENCE"))
                .andExpect(jsonPath("$.affiliatedInstitution")
                        .value("Indian Institute of Technology Madras"))
                .andExpect(jsonPath("$.availableDates.length()").value(4))
                .andExpect(jsonPath("$.availableDates[0]").value("2026-11-10"))
                .andExpect(jsonPath("$.maxAssignments").value(3))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void getNonExistentExpertReturns404() throws Exception {
        mvc.perform(get("/api/v1/evc/experts/" + UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void eligibleExpertsExcludesConflictedExpertsForTargetInstitution() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001"); // Apex Institute (Pune)

        var response = mvc.perform(get("/api/v1/evc/cases/" + apexId + "/eligible-experts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value(apexId.toString()))
                .andExpect(jsonPath("$.institutionName").value("Apex Institute of Technology & Management"))
                .andExpect(jsonPath("$.eligibleCount").isNumber())
                .andExpect(jsonPath("$.ineligibleCount").isNumber())
                .andReturn().getResponse().getContentAsString();

        var tree = mapper.readTree(response);
        var ineligibleList = tree.get("ineligibleExperts");
        var eligibleList = tree.get("eligibleExperts");

        // Prof. Sunita Deshmukh has declared conflict with Apex Institute
        boolean sunitaIneligible = false;
        for (var node : ineligibleList) {
            if ("Prof. Sunita Deshmukh".equals(node.get("name").asText())) {
                sunitaIneligible = true;
                assertThat(node.get("eligibilityReason").asText()).contains("Conflict of interest");
                break;
            }
        }
        assertThat(sunitaIneligible).isTrue();

        // Non-conflicted experts should be in eligible list
        boolean ramanathanEligible = false;
        for (var node : eligibleList) {
            if ("Prof. K. R. Ramanathan".equals(node.get("name").asText())) {
                ramanathanEligible = true;
                assertThat(node.get("eligible").asBoolean()).isTrue();
                break;
            }
        }
        assertThat(ramanathanEligible).isTrue();
    }

    @Test
    void eligibleExpertsFiltersByTargetDateAndRequiredDomain() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");

        // Filter by date 2026-11-10 and domain COMPUTER_SCIENCE
        var response = mvc.perform(get("/api/v1/evc/cases/" + apexId + "/eligible-experts")
                        .param("targetDate", "2026-11-10")
                        .param("requiredDomain", "COMPUTER_SCIENCE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targetDate").value("2026-11-10"))
                .andExpect(jsonPath("$.requiredDomain").value("COMPUTER_SCIENCE"))
                .andReturn().getResponse().getContentAsString();

        var tree = mapper.readTree(response);
        var eligibleList = tree.get("eligibleExperts");

        // Ramanathan is CS and available on 2026-11-10 and non-conflicted with Apex
        assertThat(eligibleList.size()).isGreaterThanOrEqualTo(1);
        assertThat(eligibleList.get(0).get("name").asText()).isEqualTo("Prof. K. R. Ramanathan");
        assertThat(eligibleList.get(0).get("eligible").asBoolean()).isTrue();
    }
}
