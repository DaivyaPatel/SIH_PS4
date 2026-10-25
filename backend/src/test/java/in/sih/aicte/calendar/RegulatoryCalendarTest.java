package in.sih.aicte.calendar;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariDataSource;
import in.sih.aicte.cases.ApplicationCaseRepository;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZonedDateTime;
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
@Import(RegulatoryCalendarTest.TestInfrastructure.class)
class RegulatoryCalendarTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ApplicationCaseRepository caseRepository;
    @Autowired RegulatoryCalendarService calendarService;

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
    void calendarCorrectlyIdentifiesWeekendsAndIndianGazettedHolidays() {
        // Saturday and Sunday
        assertThat(calendarService.isBusinessDay(LocalDate.of(2026, 1, 24))).isFalse(); // Saturday
        assertThat(calendarService.isBusinessDay(LocalDate.of(2026, 1, 25))).isFalse(); // Sunday

        // Republic Day (Monday Jan 26, 2026)
        assertThat(calendarService.isBusinessDay(LocalDate.of(2026, 1, 26))).isFalse();

        // Independence Day (Saturday Aug 15, 2026)
        assertThat(calendarService.isBusinessDay(LocalDate.of(2026, 8, 15))).isFalse();

        // Gandhi Jayanti (Friday Oct 2, 2026)
        assertThat(calendarService.isBusinessDay(LocalDate.of(2026, 10, 2))).isFalse();

        // Standard Working Wednesday
        assertThat(calendarService.isBusinessDay(LocalDate.of(2026, 1, 28))).isTrue();
    }

    @Test
    void addBusinessDaysSkipsWeekendsAndHolidays() {
        // Start: Thursday 2026-01-22
        // +1 -> Friday 2026-01-23 (business day 1)
        // Saturday 2026-01-24 (skip weekend)
        // Sunday 2026-01-25 (skip weekend)
        // Monday 2026-01-26 (skip Republic Day gazetted holiday)
        // +2 -> Tuesday 2026-01-27 (business day 2)
        // +3 -> Wednesday 2026-01-28 (business day 3)
        LocalDate start = LocalDate.of(2026, 1, 22);
        LocalDate result = calendarService.addBusinessDays(start, 3);
        assertThat(result).isEqualTo(LocalDate.of(2026, 1, 28));
    }

    @Test
    void calculateDeadlineSetsOfficialEndOfDayFilingCutoff() {
        LocalDate start = LocalDate.of(2026, 6, 1); // Monday
        Instant startInstant = start.atStartOfDay(RegulatoryCalendarService.IST_ZONE).toInstant();

        Instant deadline = calendarService.calculateDeadline(startInstant, 5); // +5 business days -> next Monday
        ZonedDateTime zdt = deadline.atZone(RegulatoryCalendarService.IST_ZONE);

        assertThat(zdt.toLocalDate()).isEqualTo(LocalDate.of(2026, 6, 8));
        assertThat(zdt.getHour()).isEqualTo(18);
        assertThat(zdt.getMinute()).isEqualTo(0);
        assertThat(zdt.getSecond()).isEqualTo(0);
    }

    @Test
    void getDeadlineEndpointReturnsEnrichedCalendarDetails() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");

        mvc.perform(get("/api/v1/cases/" + apexId + "/deadline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caseId").value(apexId.toString()))
                .andExpect(jsonPath("$.applicationNumber").value("APP-2026-WRO-001"))
                .andExpect(jsonPath("$.status").value("EVC_PENDING"))
                .andExpect(jsonPath("$.isOverdue").value(false))
                .andExpect(jsonPath("$.remainingHours").isNumber())
                .andExpect(jsonPath("$.remainingBusinessDays").isNumber())
                .andExpect(jsonPath("$.deadlineStatus").value("ON_TRACK"))
                .andExpect(jsonPath("$.deadlineAtIst").value(org.hamcrest.Matchers.containsString("IST")))
                .andExpect(jsonPath("$.standardOffsetDays").value(10));
    }

    @Test
    void extendDeadlineUpdatesDeadlineAndRecordsAudit() throws Exception {
        UUID nationalPolyId = UUID.fromString("33333333-3333-3333-3333-333333333004");
        CalendarDto.ExtendDeadlineRequest request = new CalendarDto.ExtendDeadlineRequest(
                5,
                "REGIONAL_OFFICER",
                "director.sro@aicte-india.org",
                "Administrative extension granted due to state election code of conduct."
        );

        mvc.perform(post("/api/v1/cases/" + nationalPolyId + "/deadline/extend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isOverdue").value(false))
                .andExpect(jsonPath("$.deadlineStatus").value("ON_TRACK"))
                .andExpect(jsonPath("$.auditEventId").isString());

        // Verify audit log recorded extension
        mvc.perform(get("/api/v1/cases/" + nationalPolyId + "/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[-1:].action").value("EXTEND_DEADLINE"));
    }

    @Test
    void extendDeadlineRejectsApprovedTerminalCase() throws Exception {
        UUID bharatId = UUID.fromString("33333333-3333-3333-3333-333333333005"); // APPROVED
        CalendarDto.ExtendDeadlineRequest request = new CalendarDto.ExtendDeadlineRequest(
                5,
                "REGIONAL_OFFICER",
                "director@aicte.gov.in",
                "Attempt to extend finished case."
        );

        mvc.perform(post("/api/v1/cases/" + bharatId + "/deadline/extend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid transition"));
    }

    @Test
    void caseListAndCaseDetailContainEnrichedDeadlineFields() throws Exception {
        UUID apexId = UUID.fromString("33333333-3333-3333-3333-333333333001");

        // Case detail contains deadline fields
        mvc.perform(get("/api/v1/cases/" + apexId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isOverdue").value(false))
                .andExpect(jsonPath("$.remainingHours").isNumber())
                .andExpect(jsonPath("$.deadlineStatus").value("ON_TRACK"))
                .andExpect(jsonPath("$.deadlineAtIst").value(org.hamcrest.Matchers.containsString("IST")));

        // Case list items contain deadline fields
        mvc.perform(get("/api/v1/cases"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isOverdue").isBoolean())
                .andExpect(jsonPath("$[0].remainingHours").isNumber())
                .andExpect(jsonPath("$[0].deadlineStatus").isString());
    }
}
