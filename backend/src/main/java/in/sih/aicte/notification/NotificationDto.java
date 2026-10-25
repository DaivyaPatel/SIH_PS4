package in.sih.aicte.notification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class NotificationDto {

    private NotificationDto() {
    }

    public record NotificationRecord(
            UUID id,
            UUID caseId,
            String applicationNumber,
            UUID institutionId,
            String institutionName,
            NotificationRecipientRole recipientRole,
            String recipientContact,
            NotificationChannel channel,
            NotificationType notificationType,
            String title,
            String content,
            NotificationPriority priority,
            NotificationStatus status,
            boolean isRead,
            Instant readAt,
            String metadataJson,
            Instant createdAt
    ) {
    }

    public record CreateNotificationRequest(
            UUID caseId,
            UUID institutionId,
            @NotNull NotificationRecipientRole recipientRole,
            @NotBlank String recipientContact,
            @NotNull NotificationChannel channel,
            @NotNull NotificationType notificationType,
            @NotBlank String title,
            @NotBlank String content,
            NotificationPriority priority,
            String metadataJson
    ) {
    }

    public record EscalationScanResult(
            int totalCasesEvaluated,
            int overdueCasesFound,
            int escalationsCreated,
            List<NotificationRecord> newEscalations,
            Instant evaluatedAt
    ) {
    }

    public record NotificationSummary(
            long total,
            long unread,
            long escalations,
            long deficiencyNotices,
            long inspectionAppointments
    ) {
    }
}
