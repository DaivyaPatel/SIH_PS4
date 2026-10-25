package in.sih.aicte.timeline;

import in.sih.aicte.audit.AuditEvent;
import in.sih.aicte.audit.AuditEventRepository;
import in.sih.aicte.calendar.RegulatoryCalendarService;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.CaseStatus;
import in.sih.aicte.cases.Deficiency;
import in.sih.aicte.cases.DeficiencyRepository;
import in.sih.aicte.notification.Notification;
import in.sih.aicte.notification.NotificationRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CaseTimelineService {

    private static final Logger LOG = LoggerFactory.getLogger(CaseTimelineService.class);
    private static final DateTimeFormatter IST_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'IST'")
                    .withZone(RegulatoryCalendarService.IST_ZONE);

    private final ApplicationCaseRepository caseRepository;
    private final AuditEventRepository auditRepository;
    private final DeficiencyRepository deficiencyRepository;
    private final NotificationRepository notificationRepository;

    public CaseTimelineService(
            ApplicationCaseRepository caseRepository,
            AuditEventRepository auditRepository,
            DeficiencyRepository deficiencyRepository,
            NotificationRepository notificationRepository
    ) {
        this.caseRepository = caseRepository;
        this.auditRepository = auditRepository;
        this.deficiencyRepository = deficiencyRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public TimelineDto.CaseTimelineResponse getCaseTimeline(UUID caseId, String sortDirection) {
        ApplicationCase applicationCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));

        List<AuditEvent> auditEvents = auditRepository.findByCaseIdOrderByCreatedAtAsc(caseId);
        List<Notification> notifications = notificationRepository.findByCaseIdOrderByCreatedAtDesc(caseId);
        List<Deficiency> deficiencies = deficiencyRepository.findByApplicationCaseId(caseId);

        Instant now = Instant.now();
        List<TimelineDto.TimelineEvent> events = new ArrayList<>();

        // 1. Map Audit Events
        for (AuditEvent audit : auditEvents) {
            events.add(mapAuditEventToTimeline(audit, now));
        }

        // 2. Map Key Communication Notifications (e.g. external emails, SMS, escalation alerts)
        for (Notification notif : notifications) {
            events.add(mapNotificationToTimeline(notif, now));
        }

        // 3. Sort events
        boolean isAscending = sortDirection == null || !"desc".equalsIgnoreCase(sortDirection);
        if (isAscending) {
            events.sort(Comparator.comparing(TimelineDto.TimelineEvent::timestamp));
        } else {
            events.sort(Comparator.comparing(TimelineDto.TimelineEvent::timestamp).reversed());
        }

        // 4. Compute High-Level Stage Milestones
        List<TimelineDto.TimelineMilestone> milestones = computeMilestones(applicationCase, deficiencies);

        String institutionName = (applicationCase.getInstitution() != null)
                ? applicationCase.getInstitution().getName()
                : "Institution";

        LOG.info("Built timeline for case {}: {} events, {} milestones",
                applicationCase.getApplicationNumber(), events.size(), milestones.size());

        return new TimelineDto.CaseTimelineResponse(
                caseId,
                applicationCase.getApplicationNumber(),
                institutionName,
                applicationCase.getStatus().name(),
                applicationCase.getCurrentStage(),
                events.size(),
                milestones,
                events,
                now
        );
    }

    private TimelineDto.TimelineEvent mapAuditEventToTimeline(AuditEvent audit, Instant now) {
        String action = audit.getAction();
        String eventType;
        String category;
        String badgeColor;
        String icon;
        String title;

        switch (action) {
            case "APPLICATION_SUBMITTED" -> {
                eventType = "STAGE_TRANSITION";
                category = "WORKFLOW";
                badgeColor = "primary";
                icon = "file-text";
                title = "Application Submitted & Ingested";
            }
            case "SCRUTINY_ASSIGNED" -> {
                eventType = "STAGE_TRANSITION";
                category = "WORKFLOW";
                badgeColor = "info";
                icon = "user-check";
                title = "Scrutiny Officer Assigned";
            }
            case "SCRUTINY_CLEARED" -> {
                eventType = "STAGE_TRANSITION";
                category = "WORKFLOW";
                badgeColor = "success";
                icon = "check-circle";
                title = "Scrutiny Verification Cleared";
            }
            case "DEFICIENCY_ISSUED", "DEFICIENCY_FLAGGED" -> {
                eventType = "DEFICIENCY_EVENT";
                category = "COMPLIANCE";
                badgeColor = "warning";
                icon = "alert-triangle";
                title = "Statutory Deficiencies Flagged";
            }
            case "DEFICIENCY_RESUBMITTED" -> {
                eventType = "DEFICIENCY_EVENT";
                category = "COMPLIANCE";
                badgeColor = "info";
                icon = "upload";
                title = "Deficiency Compliance Resubmitted";
            }
            case "DEFICIENCY_RESOLVED" -> {
                eventType = "DEFICIENCY_EVENT";
                category = "COMPLIANCE";
                badgeColor = "success";
                icon = "check-circle";
                title = "Deficiency Resolved & Accepted";
            }
            case "EVC_SCHEDULED" -> {
                eventType = "EVC_SCHEDULE";
                category = "COMMITTEE";
                badgeColor = "success";
                icon = "calendar";
                title = "Expert Visit Committee Scheduled";
            }
            case "DEADLINE_EXTENDED" -> {
                eventType = "DEADLINE_UPDATE";
                category = "REGULATORY_CLOCK";
                badgeColor = "info";
                icon = "clock";
                title = "Statutory Deadline Extended";
            }
            case "REGULATORY_ESCALATION" -> {
                eventType = "ESCALATION";
                category = "ALERT";
                badgeColor = "danger";
                icon = "shield-alert";
                title = "Regulatory Deadline Escalation";
            }
            case "RECOMMEND_APPROVAL" -> {
                eventType = "STAGE_TRANSITION";
                category = "WORKFLOW";
                badgeColor = "success";
                icon = "award";
                title = "Recommended for AICTE Approval";
            }
            case "REJECT" -> {
                eventType = "STAGE_TRANSITION";
                category = "WORKFLOW";
                badgeColor = "danger";
                icon = "x-circle";
                title = "Application Rejected";
            }
            default -> {
                eventType = "AUDIT_EVENT";
                category = "WORKFLOW";
                badgeColor = "neutral";
                icon = "activity";
                title = action.replace('_', ' ');
            }
        }

        String formattedTime = IST_FORMATTER.format(audit.getCreatedAt());
        String timeAgo = formatTimeAgo(audit.getCreatedAt(), now);

        return new TimelineDto.TimelineEvent(
                audit.getId(),
                eventType,
                category,
                title,
                audit.getDetails(),
                audit.getActorRole(),
                audit.getActorId(),
                audit.getPreviousState(),
                audit.getNewState(),
                badgeColor,
                icon,
                audit.getCorrelationId(),
                audit.getCreatedAt(),
                formattedTime,
                timeAgo
        );
    }

    private TimelineDto.TimelineEvent mapNotificationToTimeline(Notification notif, Instant now) {
        String eventType = "COMMUNICATION";
        String category = "ALERT";
        String badgeColor = "info";
        String icon = "send";

        if (notif.getNotificationType() != null) {
            switch (notif.getNotificationType()) {
                case ESCALATION -> {
                    eventType = "ESCALATION";
                    badgeColor = "danger";
                    icon = "shield-alert";
                }
                case DEFICIENCY_NOTICE -> {
                    badgeColor = "warning";
                    icon = "mail";
                }
                case INSPECTION_APPOINTMENT -> {
                    badgeColor = "success";
                    icon = "calendar";
                }
                case DEADLINE_REMINDER -> {
                    badgeColor = "warning";
                    icon = "clock";
                }
                default -> {
                    badgeColor = "info";
                    icon = "send";
                }
            }
        }

        String formattedTime = IST_FORMATTER.format(notif.getCreatedAt());
        String timeAgo = formatTimeAgo(notif.getCreatedAt(), now);

        String summary = notif.getContent();
        if (summary != null && summary.length() > 180) {
            summary = summary.substring(0, 177) + "...";
        }

        return new TimelineDto.TimelineEvent(
                notif.getId(),
                eventType,
                category,
                notif.getTitle(),
                summary,
                notif.getRecipientRole().name(),
                notif.getRecipientContact(),
                null,
                notif.getStatus().name(),
                badgeColor,
                icon,
                "notif-" + notif.getId().toString().substring(0, 8),
                notif.getCreatedAt(),
                formattedTime,
                timeAgo
        );
    }

    private List<TimelineDto.TimelineMilestone> computeMilestones(
            ApplicationCase c,
            List<Deficiency> deficiencies
    ) {
        List<TimelineDto.TimelineMilestone> list = new ArrayList<>();
        CaseStatus status = c.getStatus();

        // Milestone 1: Ingestion
        list.add(new TimelineDto.TimelineMilestone(
                "M1_INGESTION",
                "Application Submission & Intake Details",
                "COMPLETED",
                "Application submitted with 18 mandatory documentation registers.",
                c.getSubmittedAt()
        ));

        // Milestone 2: Scrutiny
        String scrutinyStatus;
        String scrutinyDesc;
        if (status == CaseStatus.DRAFT || status == CaseStatus.SUBMITTED) {
            scrutinyStatus = "PENDING";
            scrutinyDesc = "Awaiting scrutiny panel assignment.";
        } else if (status == CaseStatus.UNDER_SCRUTINY) {
            scrutinyStatus = "IN_PROGRESS";
            scrutinyDesc = "Land, building, and faculty cadre scrutiny review underway.";
        } else {
            scrutinyStatus = "COMPLETED";
            scrutinyDesc = "Initial document verification completed by Regional Scrutiny Officer.";
        }
        list.add(new TimelineDto.TimelineMilestone(
                "M2_SCRUTINY",
                "Scrutiny Committee Document Verification",
                scrutinyStatus,
                scrutinyDesc,
                null
        ));

        // Milestone 3: Deficiencies
        String defStatus;
        String defDesc;
        if (deficiencies.isEmpty()) {
            defStatus = "COMPLETED";
            defDesc = "Zero deficiencies flagged; clean regulatory track.";
        } else {
            boolean hasOpen = deficiencies.stream().anyMatch(d -> "OPEN".equalsIgnoreCase(d.getStatus()));
            boolean hasResubmitted = deficiencies.stream().anyMatch(d -> "RESUBMITTED".equalsIgnoreCase(d.getStatus()));
            if (hasOpen) {
                defStatus = "WARNING";
                defDesc = "Active deficiencies flagged requiring institutional compliance.";
            } else if (hasResubmitted) {
                defStatus = "IN_PROGRESS";
                defDesc = "Deficiency responses submitted; awaiting officer re-verification.";
            } else {
                defStatus = "COMPLETED";
                defDesc = "All flagged deficiencies cleared and accepted.";
            }
        }
        list.add(new TimelineDto.TimelineMilestone(
                "M3_DEFICIENCY",
                "Deficiency Identification & Cure Loop",
                defStatus,
                defDesc,
                null
        ));

        // Milestone 4: EVC
        String evcStatus;
        String evcDesc;
        if (status == CaseStatus.EVC_PENDING) {
            evcStatus = "IN_PROGRESS";
            evcDesc = "Application queued for Google OR-Tools CP-SAT committee scheduling.";
        } else if (status == CaseStatus.EVC_SCHEDULED) {
            evcStatus = "IN_PROGRESS";
            evcDesc = "Expert Visit Committee constituted; campus inspection date assigned.";
        } else if (status == CaseStatus.EVC_COMPLETED || status == CaseStatus.APPROVED) {
            evcStatus = "COMPLETED";
            evcDesc = "Campus physical inspection conducted and report uploaded.";
        } else {
            evcStatus = "PENDING";
            evcDesc = "Expert Visit Committee stage not yet initiated.";
        }
        list.add(new TimelineDto.TimelineMilestone(
                "M4_EVC",
                "Expert Visit Committee (EVC) Inspection",
                evcStatus,
                evcDesc,
                null
        ));

        // Milestone 5: Final Decision
        String finalStatus;
        String finalDesc;
        if (status == CaseStatus.APPROVED) {
            finalStatus = "COMPLETED";
            finalDesc = "AICTE Executive Council approval granted.";
        } else if (status == CaseStatus.REJECTED) {
            finalStatus = "FAILED";
            finalDesc = "Application rejected by Regional Committee.";
        } else {
            finalStatus = "PENDING";
            finalDesc = "Pending completion of preceding scrutiny and inspection stages.";
        }
        list.add(new TimelineDto.TimelineMilestone(
                "M5_DECISION",
                "Executive Recommendation & Approval",
                finalStatus,
                finalDesc,
                null
        ));

        return list;
    }

    private String formatTimeAgo(Instant eventInstant, Instant now) {
        if (eventInstant == null) {
            return "";
        }
        Duration duration = Duration.between(eventInstant, now);
        long seconds = Math.abs(duration.getSeconds());
        if (seconds < 60) {
            return "Just now";
        }
        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
        }
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        }
        long days = hours / 24;
        return days + " day" + (days > 1 ? "s" : "") + " ago";
    }
}
