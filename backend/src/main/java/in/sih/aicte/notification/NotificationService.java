package in.sih.aicte.notification;

import in.sih.aicte.audit.AuditService;
import in.sih.aicte.calendar.CalendarDto;
import in.sih.aicte.calendar.RegulatoryCalendarService;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.CaseStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final ApplicationCaseRepository caseRepository;
    private final RegulatoryCalendarService calendarService;
    private final AuditService auditService;

    public NotificationService(
            NotificationRepository notificationRepository,
            ApplicationCaseRepository caseRepository,
            RegulatoryCalendarService calendarService,
            AuditService auditService
    ) {
        this.notificationRepository = notificationRepository;
        this.caseRepository = caseRepository;
        this.calendarService = calendarService;
        this.auditService = auditService;
    }

    @Transactional
    public NotificationDto.NotificationRecord recordNotification(NotificationDto.CreateNotificationRequest request) {
        UUID caseId = request.caseId();
        UUID institutionId = request.institutionId();

        if (caseId != null) {
            Optional<ApplicationCase> caseOpt = caseRepository.findById(caseId);
            if (caseOpt.isPresent() && institutionId == null && caseOpt.get().getInstitution() != null) {
                institutionId = caseOpt.get().getInstitution().getId();
            }
        }

        NotificationPriority priority = request.priority() != null ? request.priority() : NotificationPriority.NORMAL;
        UUID id = UUID.randomUUID();

        Notification notification = new Notification(
                id,
                caseId,
                institutionId,
                request.recipientRole(),
                request.recipientContact(),
                request.channel(),
                request.notificationType(),
                request.title(),
                request.content(),
                priority,
                NotificationStatus.SENT,
                false,
                null,
                request.metadataJson(),
                Instant.now()
        );

        Notification saved = notificationRepository.save(notification);
        LOG.info("Notification dispatched: id={}, type={}, recipient={}, priority={}",
                saved.getId(), saved.getNotificationType(), saved.getRecipientContact(), saved.getPriority());

        return toRecord(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto.NotificationRecord> getNotifications(
            UUID caseId,
            NotificationRecipientRole role,
            NotificationType type,
            Boolean isRead
    ) {
        List<Notification> list = notificationRepository.search(caseId, role, type, isRead);
        List<NotificationDto.NotificationRecord> results = new ArrayList<>();
        for (Notification n : list) {
            results.add(toRecord(n));
        }
        return results;
    }

    @Transactional(readOnly = true)
    public NotificationDto.NotificationRecord getNotificationById(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Notification not found: " + id));
        return toRecord(notification);
    }

    @Transactional
    public NotificationDto.NotificationRecord markAsRead(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Notification not found: " + id));

        notification.setRead(true);
        notification.setReadAt(Instant.now());
        notification.setStatus(NotificationStatus.READ);
        Notification updated = notificationRepository.save(notification);

        return toRecord(updated);
    }

    @Transactional
    public NotificationDto.EscalationScanResult scanAndGenerateEscalations() {
        List<ApplicationCase> activeCases = caseRepository.findAllWithInstitution();
        int evaluated = activeCases.size();
        int overdueCount = 0;
        List<NotificationDto.NotificationRecord> createdEscalations = new ArrayList<>();

        Instant now = Instant.now();

        for (ApplicationCase c : activeCases) {
            if (c.getStatus() == CaseStatus.APPROVED || c.getStatus() == CaseStatus.REJECTED) {
                continue;
            }

            CalendarDto.DeadlineAnalysis analysis = calendarService.analyzeDeadline(c.getDeadlineAt(), now);
            if (analysis.isOverdue()) {
                overdueCount++;
                boolean alreadyEscalated = notificationRepository.existsByCaseIdAndNotificationType(
                        c.getId(), NotificationType.ESCALATION);

                if (!alreadyEscalated) {
                    long overdueHours = Math.abs(analysis.remainingHours());
                    String officerContact = (c.getAssignedOfficer() != null)
                            ? c.getAssignedOfficer()
                            : "regional.officer@aicte-india.org";

                    String title = "REGULATORY ESCALATION: Case " + c.getApplicationNumber()
                            + " exceeded statutory deadline";
                    String institutionName = (c.getInstitution() != null)
                            ? c.getInstitution().getName()
                            : "Institution";
                    String content = "Application " + c.getApplicationNumber() + " (" + institutionName
                            + ") is overdue by " + overdueHours + " hours past its statutory deadline ("
                            + analysis.deadlineAtIst() + "). Current stage: " + c.getCurrentStage()
                            + ". Assigned officer: " + c.getAssignedOfficer()
                            + ". Immediate executive intervention required.";

                    String meta = "{\"overdueHours\":" + overdueHours + ",\"stage\":\""
                            + c.getCurrentStage() + "\"}";

                    Notification escalation = new Notification(
                            UUID.randomUUID(),
                            c.getId(),
                            (c.getInstitution() != null) ? c.getInstitution().getId() : null,
                            NotificationRecipientRole.REGIONAL_OFFICER,
                            officerContact,
                            NotificationChannel.PORTAL_ALERT,
                            NotificationType.ESCALATION,
                            title,
                            content,
                            NotificationPriority.CRITICAL,
                            NotificationStatus.SENT,
                            false,
                            null,
                            meta,
                            now
                    );

                    Notification saved = notificationRepository.save(escalation);
                    createdEscalations.add(toRecord(saved));

                    auditService.recordEvent(
                            c.getId(),
                            "REGULATORY_ESCALATION",
                            "SYSTEM",
                            "system.escalation-daemon",
                            c.getStatus().name(),
                            c.getStatus().name(),
                            "Statutory deadline breached by " + overdueHours + " hours. Escalation notice dispatched.",
                            UUID.randomUUID().toString()
                    );

                    LOG.warn("Generated regulatory escalation for case {}: overdue by {} hours",
                            c.getApplicationNumber(), overdueHours);
                }
            }
        }

        return new NotificationDto.EscalationScanResult(
                evaluated,
                overdueCount,
                createdEscalations.size(),
                createdEscalations,
                now
        );
    }

    @Transactional(readOnly = true)
    public NotificationDto.NotificationSummary getSummary() {
        long total = notificationRepository.count();
        long unread = notificationRepository.countByIsReadFalse();
        long escalations = notificationRepository.countByNotificationType(NotificationType.ESCALATION);
        long deficiencyNotices = notificationRepository.countByNotificationType(NotificationType.DEFICIENCY_NOTICE);
        long inspectionAppointments = notificationRepository.countByNotificationType(NotificationType.INSPECTION_APPOINTMENT);

        return new NotificationDto.NotificationSummary(
                total,
                unread,
                escalations,
                deficiencyNotices,
                inspectionAppointments
        );
    }

    private NotificationDto.NotificationRecord toRecord(Notification n) {
        String appNum = null;
        String instName = null;
        if (n.getCaseId() != null) {
            Optional<ApplicationCase> caseOpt = caseRepository.findById(n.getCaseId());
            if (caseOpt.isPresent()) {
                ApplicationCase c = caseOpt.get();
                appNum = c.getApplicationNumber();
                if (c.getInstitution() != null) {
                    instName = c.getInstitution().getName();
                }
            }
        }

        return new NotificationDto.NotificationRecord(
                n.getId(),
                n.getCaseId(),
                appNum,
                n.getInstitutionId(),
                instName,
                n.getRecipientRole(),
                n.getRecipientContact(),
                n.getChannel(),
                n.getNotificationType(),
                n.getTitle(),
                n.getContent(),
                n.getPriority(),
                n.getStatus(),
                n.isRead(),
                n.getReadAt(),
                n.getMetadataJson(),
                n.getCreatedAt()
        );
    }
}
