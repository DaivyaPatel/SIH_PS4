package in.sih.aicte.calendar;

import in.sih.aicte.cases.CaseStatus;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RegulatoryCalendarService {

    public static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter IST_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'IST'");

    // Indian Gazetted Central Government Holidays for 2026/2027
    private static final Set<LocalDate> GAZETTED_HOLIDAYS = Set.of(
            LocalDate.of(2026, 1, 26),  // Republic Day
            LocalDate.of(2026, 3, 3),   // Holi
            LocalDate.of(2026, 3, 21),  // Id-ul-Fitr
            LocalDate.of(2026, 4, 3),   // Good Friday
            LocalDate.of(2026, 4, 14),  // Dr. B.R. Ambedkar Jayanti
            LocalDate.of(2026, 5, 1),   // Maharashtra / Labour Day
            LocalDate.of(2026, 5, 27),  // Id-ul-Zuha (Bakrid)
            LocalDate.of(2026, 8, 15),  // Independence Day
            LocalDate.of(2026, 10, 2),  // Mahatma Gandhi's Birthday
            LocalDate.of(2026, 10, 20), // Dussehra
            LocalDate.of(2026, 11, 8),  // Diwali
            LocalDate.of(2026, 12, 25), // Christmas Day
            LocalDate.of(2027, 1, 26)   // Republic Day 2027
    );

    public boolean isBusinessDay(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return false;
        }
        return !GAZETTED_HOLIDAYS.contains(date);
    }

    public LocalDate addBusinessDays(LocalDate startDate, int businessDays) {
        if (businessDays <= 0) {
            return startDate;
        }
        LocalDate current = startDate;
        int added = 0;
        while (added < businessDays) {
            current = current.plusDays(1);
            if (isBusinessDay(current)) {
                added++;
            }
        }
        return current;
    }

    public Instant calculateDeadline(Instant startInstant, int businessDays) {
        if (startInstant == null) {
            return null;
        }
        ZonedDateTime zdt = startInstant.atZone(IST_ZONE);
        LocalDate targetDate = addBusinessDays(zdt.toLocalDate(), businessDays);
        // Cutoff at 18:00:00 IST (official government end of day filing time)
        return targetDate.atTime(18, 0, 0).atZone(IST_ZONE).toInstant();
    }

    public CalendarDto.DeadlineAnalysis analyzeDeadline(Instant deadlineAt, Instant asOf) {
        Instant anchor = (asOf != null) ? asOf : Instant.now();
        if (deadlineAt == null) {
            return new CalendarDto.DeadlineAnalysis(
                    null,
                    null,
                    false,
                    0L,
                    0,
                    "NOT_APPLICABLE"
            );
        }

        boolean isOverdue = anchor.isAfter(deadlineAt);
        long remainingHours = Duration.between(anchor, deadlineAt).toHours();
        int remainingBusinessDays = countRemainingBusinessDays(anchor, deadlineAt);

        String status;
        if (isOverdue) {
            status = "OVERDUE";
        } else if (remainingHours <= 48) {
            status = "APPROACHING_DEADLINE";
        } else {
            status = "ON_TRACK";
        }

        String formatted = IST_FORMATTER.format(deadlineAt.atZone(IST_ZONE));
        return new CalendarDto.DeadlineAnalysis(
                deadlineAt,
                formatted,
                isOverdue,
                remainingHours,
                remainingBusinessDays,
                status
        );
    }

    public int countRemainingBusinessDays(Instant from, Instant to) {
        if (from == null || to == null || from.isAfter(to)) {
            return 0;
        }
        LocalDate start = from.atZone(IST_ZONE).toLocalDate();
        LocalDate end = to.atZone(IST_ZONE).toLocalDate();
        int count = 0;
        LocalDate current = start.plusDays(1);
        while (!current.isAfter(end)) {
            if (isBusinessDay(current)) {
                count++;
            }
            current = current.plusDays(1);
        }
        return count;
    }

    public int getRegulatoryOffsetDays(CaseStatus status) {
        if (status == null) {
            return 7;
        }
        return switch (status) {
            case DEFICIENCY_FLAGGED -> 7;
            case DEFICIENCY_RESUBMITTED -> 5;
            case UNDER_SCRUTINY -> 10;
            case EVC_PENDING -> 10;
            case EVC_COMPLETED -> 5;
            default -> 7;
        };
    }

    public String getRegulatoryPolicyNote(CaseStatus status) {
        if (status == null) {
            return "Standard AICTE approval lifecycle timeline.";
        }
        return switch (status) {
            case DEFICIENCY_FLAGGED -> "APH Section 6.4: 7 working days for institutional compliance submission.";
            case DEFICIENCY_RESUBMITTED -> "APH Section 6.5: 5 working days for Scrutiny Committee re-verification.";
            case UNDER_SCRUTINY -> "APH Section 4.2: 10 working days for initial document scrutiny.";
            case EVC_PENDING -> "APH Section 7.1: 10 working days for Expert Visit Committee constitution and dispatch.";
            case EVC_COMPLETED -> "APH Section 7.8: 5 working days for Regional Committee recommendation report.";
            case APPROVED, REJECTED -> "Terminal stage; no active statutory deadline.";
            default -> "AICTE statutory compliance schedule active.";
        };
    }
}
