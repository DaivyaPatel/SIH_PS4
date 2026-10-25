package in.sih.aicte.cases;

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
@Import(CaseControllerTest.TestInfrastructure.class)
class CaseControllerTest {

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
    void listCasesReturnsSeededDemoColleges() throws Exception {
        mvc.perform(get("/api/v1/cases"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[?(@.applicationNumber == 'APP-2026-WRO-001')].institutionName")
                        .value("Apex Institute of Technology & Management"))
                .andExpect(jsonPath("$[?(@.applicationNumber == 'APP-2026-WRO-001')].status")
                        .value("EVC_PENDING"))
                .andExpect(jsonPath("$[?(@.applicationNumber == 'APP-2026-WRO-002')].status")
                        .value("DEFICIENCY_FLAGGED"))
                .andExpect(jsonPath("$[?(@.applicationNumber == 'APP-2026-CRO-005')].status")
                        .value("APPROVED"));
    }

    @Test
    void filterByStatusReturnsMatchingCase() throws Exception {
        mvc.perform(get("/api/v1/cases?status=DEFICIENCY_FLAGGED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].applicationNumber").value("APP-2026-WRO-002"))
                .andExpect(jsonPath("$[0].institutionName").value("Saraswati Engineering College"));
    }

    @Test
    void filterByRegionReturnsMatchingCases() throws Exception {
        mvc.perform(get("/api/v1/cases?region=WRO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void filterByStatusAndRegionReturnsMatchingCases() throws Exception {
        mvc.perform(get("/api/v1/cases?status=EVC_PENDING&region=WRO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].applicationNumber").value("APP-2026-WRO-001"));

        mvc.perform(get("/api/v1/cases?status=EVC_PENDING&region=CRO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getCaseByIdReturnsCompleteHierarchy() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");
        mvc.perform(get("/api/v1/cases/" + apexId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(apexId.toString()))
                .andExpect(jsonPath("$.applicationNumber").value("APP-2026-WRO-001"))
                .andExpect(jsonPath("$.institution.name").value("Apex Institute of Technology & Management"))
                .andExpect(jsonPath("$.institution.campuses.length()").value(1))
                .andExpect(jsonPath("$.institution.campuses[0].campusName").value("Pune Main Campus"))
                .andExpect(jsonPath("$.documents.length()").value(2))
                .andExpect(jsonPath("$.readinessScore").value(92));
    }

    @Test
    void getCaseWithDeficienciesIncludesAllDetails() throws Exception {
        UUID saraswatiId = UUID.fromString("33333333-3333-3333-3333-333333333002");
        mvc.perform(get("/api/v1/cases/" + saraswatiId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deficiencies.length()").value(2))
                .andExpect(jsonPath("$.deficiencies[0].category").value("LAND_AND_BUILDING"))
                .andExpect(jsonPath("$.deficiencies[0].status").value("OPEN"))
                .andExpect(jsonPath("$.deficiencies[1].category").value("FIRE_SAFETY"));
    }

    @Test
    void getCaseByApplicationNumberReturnsDetail() throws Exception {
        mvc.perform(get("/api/v1/cases/by-number/APP-2026-CRO-005"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationNumber").value("APP-2026-CRO-005"))
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.readinessScore").value(100));
    }

    @Test
    void getNonExistentCaseReturns404Problem() throws Exception {
        UUID randomId = UUID.randomUUID();
        mvc.perform(get("/api/v1/cases/" + randomId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Not found"))
                .andExpect(jsonPath("$.correlationId").isString());
    }

    @Test
    void invalidStatusOrRegionReturns400Problem() throws Exception {
        mvc.perform(get("/api/v1/cases?status=NOT_A_STATUS"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Invalid parameter"));

        mvc.perform(get("/api/v1/cases?region=NOT_A_REGION"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Invalid parameter"));
    }
}
