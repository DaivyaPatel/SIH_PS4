package in.sih.aicte.calendar;

import in.sih.aicte.cases.CaseStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class CalendarDto {

    private CalendarDto() {
    }

    public record DeadlineAnalysis(
            Instant deadlineAt,
            String deadlineAtIst,
            boolean isOverdue,
            long remainingHours,
            int remainingBusinessDays,
            String deadlineStatus
    ) {
    }

    public record DeadlineDetailResponse(
            UUID caseId,
            String applicationNumber,
            CaseStatus status,
            String currentStage,
            Instant deadlineAt,
            String deadlineAtIst,
            boolean isOverdue,
            long remainingHours,
            int remainingBusinessDays,
            String deadlineStatus,
            int standardOffsetDays,
            String regulatoryPolicyNote,
            UUID auditEventId
    ) {
    }

    public record ExtendDeadlineRequest(
            @Min(value = 1, message = "Extension must be at least 1 business day")
            int extensionDays,
            @NotBlank String authorityRole,
            @NotBlank String authorityId,
            @NotBlank String reason
    ) {
    }
}
