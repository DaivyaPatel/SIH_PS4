package in.sih.aicte.notification;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto.NotificationRecord> getNotifications(
            @RequestParam(required = false) UUID caseId,
            @RequestParam(required = false) NotificationRecipientRole recipientRole,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) Boolean isRead
    ) {
        // Run escalation check on demand to guarantee fresh status
        notificationService.scanAndGenerateEscalations();
        return notificationService.getNotifications(caseId, recipientRole, type, isRead);
    }

    @PostMapping("/escalate-check")
    public NotificationDto.EscalationScanResult checkEscalations() {
        return notificationService.scanAndGenerateEscalations();
    }

    @PatchMapping("/{id}/read")
    public NotificationDto.NotificationRecord markAsRead(@PathVariable UUID id) {
        return notificationService.markAsRead(id);
    }

    @PostMapping
    public NotificationDto.NotificationRecord createNotification(
            @Valid @RequestBody NotificationDto.CreateNotificationRequest request
    ) {
        return notificationService.recordNotification(request);
    }

    @GetMapping("/summary")
    public NotificationDto.NotificationSummary getSummary() {
        return notificationService.getSummary();
    }
}
