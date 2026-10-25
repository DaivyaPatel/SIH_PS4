package in.sih.aicte;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import in.sih.aicte.api.CommandReceipt;
import in.sih.aicte.api.ApiPage;
import in.sih.aicte.platform.PlatformController;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.ApplicationContext;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.servlet.view.xslt.XsltView;
import org.springframework.web.servlet.view.xslt.XsltViewResolver;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Import({FoundationTest.TestInfrastructure.class, FoundationTest.ProbeController.class})
class FoundationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired Flyway flyway;
    @Autowired HikariDataSource datasource;
    @Autowired ApplicationContext context;
    @Autowired RequestMappingHandlerMapping requestMappingHandlerMapping;

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

        // Test fixtures only; no probe routes are shipped in the application.
        @Bean
        @Order(0)
        SecurityFilterChain probes(HttpSecurity http) throws Exception {
            return http.securityMatcher("/test/**").authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                    .csrf(csrf -> csrf.disable()).build();
        }
    }

    @RestController
    static class ProbeController {
        record Input(@NotBlank String reason) {}

        @PostMapping("/test/validate")
        String validate(@Valid @RequestBody Input input) { return input.reason(); }

        @GetMapping("/test/failure")
        String fail() { throw new IllegalStateException("private-database-detail"); }
    }

    @Test
    void statusMatchesSharedContractAndCapabilitiesRemainOff() throws Exception {
        var body = mvc.perform(get("/api/v1/platform")).andExpect(status().isOk())
                .andExpect(jsonPath("$.synthetic").value(true))
                .andExpect(jsonPath("$.identityIntegrated").value(false))
                .andExpect(jsonPath("$.hostConnected").value(false))
                .andExpect(jsonPath("$.notificationsEnabled").value(false)).andReturn().getResponse().getContentAsString();
        var contract = mapper.readTree(Files.readString(Path.of("../api/openapi.json")))
                .at("/components/schemas/PlatformStatus/required");
        var fields = new java.util.ArrayList<String>();
        contract.forEach(field -> fields.add(field.asText()));
        var actual = new java.util.ArrayList<String>();
        mapper.readTree(body).fieldNames().forEachRemaining(actual::add);
        assertThat(actual).containsExactlyInAnyOrderElementsOf(fields);
    }

    @Test
    void correlationIsPropagatedAndThreadContextIsCleared() throws Exception {
        var id = UUID.randomUUID().toString();
        mvc.perform(get("/api/v1/platform").header("X-Correlation-ID", id))
                .andExpect(header().string("X-Correlation-ID", id));
        assertThat(MDC.get("correlationId")).isNull();
        var invalid = mvc.perform(get("/api/v1/platform").header("X-Correlation-ID", "not-a-uuid"))
                .andReturn().getResponse().getHeader("X-Correlation-ID");
        assertThat(UUID.fromString(invalid).toString()).isEqualTo(invalid);
    }

    @Test
    void paginationHasStableCountsAndNoDuplicatedItems() throws Exception {
        mvc.perform(get("/api/v1/platform/modules?page=1&size=2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].name").value("notifications"))
                .andExpect(jsonPath("$.totalElements").value(3)).andExpect(jsonPath("$.totalPages").value(2));
        mvc.perform(get("/api/v1/platform/modules?page=2&size=2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void invalidPaginationReturnsCorrelatedProblemWithoutRejectedValues() throws Exception {
        var id = UUID.randomUUID().toString();
        for (var query : new String[]{"size=101", "size=0", "page=-1", "page=1000001", "size=oops"}) {
            var result = mvc.perform(get("/api/v1/platform/modules?" + query).header("X-Correlation-ID", id))
                    .andExpect(status().isBadRequest()).andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                    .andExpect(jsonPath("$.correlationId").value(id)).andExpect(jsonPath("$.errors[0].field").exists())
                    .andExpect(jsonPath("$.errors[0].rejectedValue").doesNotExist()).andReturn();
            assertThat(result.getResponse().getContentAsString()).doesNotContain("oops");
        }
    }

    @Test
    void validationAndMalformedJsonUseSameErrorShape() throws Exception {
        mvc.perform(post("/test/validate").contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("reason"));
        for (var body : new String[]{"{", "{\"reason\":\"ok\",\"unknown\":true}"}) {
            mvc.perform(post("/test/validate").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.detail").value("Request body is malformed or unsupported."));
        }
    }

    @Test
    void unexpectedFailureHidesInternalDetails() throws Exception {
        var response = mvc.perform(get("/test/failure")).andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.correlationId").isString()).andReturn().getResponse().getContentAsString();
        assertThat(response).doesNotContain("private-database-detail", "stackTrace", "IllegalStateException");
    }

    @Test
    void directRequestsCannotInvokeCommandsOrInspectConfiguration() throws Exception {
        mvc.perform(get("/api/v1/applications"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.correlationId").isString());
        mvc.perform(post("/api/v1/platform").content("{}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.status").value(403));
        mvc.perform(get("/actuator/env")).andExpect(status().isForbidden());
    }

    @Test
    void readinessUsesActualPostgresAndMigrationsAreRepeatable() throws Exception {
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());
        assertThat(jdbc.queryForObject("show server_version", String.class)).startsWith("17.11");
        assertThat(jdbc.queryForObject("select count(*) from platform_metadata", Integer.class)).isEqualTo(1);
        flyway.validate();
        assertThat(flyway.migrate().migrationsExecuted).isZero();
    }

    @Test
    void changedMigrationChecksumIsRejected() {
        var isolated = Flyway.configure().dataSource(datasource).schemas("checksum_probe")
                .locations("classpath:db/migration").load();
        isolated.migrate();
        jdbc.update("update checksum_probe.flyway_schema_history set checksum = 0 where version = '1'");
        assertThatThrownBy(isolated::validate).hasMessageContaining("checksum mismatch");
    }

    @Test
    void futureCommandReceiptPreservesIdentifiersAndUtcTimestamp() throws Exception {
        var receipt = new CommandReceipt(UUID.randomUUID(), UUID.randomUUID(), CommandReceipt.Outcome.ACCEPTED, Instant.now());
        assertThat(mapper.readValue(mapper.writeValueAsString(receipt), CommandReceipt.class)).isEqualTo(receipt);
    }

    @Test
    void jsonOnlyRoutesKeepDevelopmentVexAssumptionsTrue() {
        assertThat(context.getBeansOfType(XsltView.class)).isEmpty();
        assertThat(context.getBeansOfType(XsltViewResolver.class)).isEmpty();
        var handlers = requestMappingHandlerMapping.getHandlerMethods().entrySet().stream()
                .filter(entry -> entry.getValue().getBeanType().getPackageName().startsWith("in.sih.aicte"))
                .filter(entry -> entry.getValue().getBeanType() != ProbeController.class).toList();
        assertThat(handlers).hasSize(12);
        for (var handler : handlers) {
            assertThat(handler.getValue().getBeanType()).hasAnnotation(RestController.class);
            assertThat(handler.getValue().getReturnType().getParameterType())
                    .isIn(PlatformController.Status.class, ApiPage.class, java.util.List.class,
                            in.sih.aicte.cases.CaseDto.CaseDetail.class,
                            in.sih.aicte.cases.DeficiencyDto.DeficiencyOperationResponse.class,
                            in.sih.aicte.workflow.WorkflowDto.TransitionResponse.class,
                            in.sih.aicte.integration.IntegrationDto.PortalSyncReceipt.class,
                            in.sih.aicte.integration.IntegrationDto.IntegrationStatus.class);
            assertThat(handler.getKey().getPatternValues()).allMatch(path -> !path.contains("*"));
            assertThat(handler.getKey().getProducesCondition().getProducibleMediaTypes())
                    .doesNotContain(MediaType.TEXT_EVENT_STREAM);
        }
    }
}
