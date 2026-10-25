package in.sih.aicte.dashboard;

import in.sih.aicte.calendar.CalendarDto;
import in.sih.aicte.calendar.RegulatoryCalendarService;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.CaseStatus;
import in.sih.aicte.cases.Deficiency;
import in.sih.aicte.cases.DeficiencyRepository;
import in.sih.aicte.cases.Region;
import in.sih.aicte.evc.ExpertRepository;
import in.sih.aicte.notification.NotificationRepository;
import in.sih.aicte.notification.NotificationType;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardService.class);

    private final ApplicationCaseRepository caseRepository;
    private final DeficiencyRepository deficiencyRepository;
    private final ExpertRepository expertRepository;
    private final NotificationRepository notificationRepository;
    private final RegulatoryCalendarService calendarService;

    public DashboardService(
            ApplicationCaseRepository caseRepository,
            DeficiencyRepository deficiencyRepository,
            ExpertRepository expertRepository,
            NotificationRepository notificationRepository,
            RegulatoryCalendarService calendarService
    ) {
        this.caseRepository = caseRepository;
        this.deficiencyRepository = deficiencyRepository;
        this.expertRepository = expertRepository;
        this.notificationRepository = notificationRepository;
        this.calendarService = calendarService;
    }

    @Transactional(readOnly = true)
    public DashboardDto.DashboardSummary getSummary(Region region) {
        Instant now = Instant.now();

        List<ApplicationCase> cases;
        if (region != null) {
            cases = caseRepository.findByRegionWithInstitution(region);
        } else {
            cases = caseRepository.findAllWithInstitution();
        }

        long totalColleges = cases.size();
        Map<String, Long> statusDistribution = new HashMap<>();
        Map<String, Long> regionalDistribution = new HashMap<>();

        long pendingScrutiny = 0;
        long scheduledInspections = 0;
        long approvedCount = 0;
        long rejectedCount = 0;
        long cleanCases = 0;
        long deficiencyFlaggedCases = 0;
        long deficiencyResubmittedCases = 0;
        long evcPendingVisits = 0;
        long evcCompletedVisits = 0;

        long onTrack = 0;
        long approachingDeadline = 0;
        long overdueBreached = 0;
        long totalReadinessScore = 0;

        for (ApplicationCase c : cases) {
            String statusName = c.getStatus().name();
            statusDistribution.put(statusName, statusDistribution.getOrDefault(statusName, 0L) + 1);

            if (c.getInstitution() != null && c.getInstitution().getRegion() != null) {
                String regName = c.getInstitution().getRegion().name();
                regionalDistribution.put(regName, regionalDistribution.getOrDefault(regName, 0L) + 1);
            }

            totalReadinessScore += c.getReadinessScore();

            switch (c.getStatus()) {
                case SUBMITTED, UNDER_SCRUTINY -> pendingScrutiny++;
                case DEFICIENCY_FLAGGED -> deficiencyFlaggedCases++;
                case DEFICIENCY_RESUBMITTED -> deficiencyResubmittedCases++;
                case EVC_PENDING -> {
                    evcPendingVisits++;
                    cleanCases++;
                }
                case EVC_SCHEDULED -> {
                    scheduledInspections++;
                    cleanCases++;
                }
                case EVC_COMPLETED -> {
                    evcCompletedVisits++;
                    cleanCases++;
                }
                case APPROVED -> {
                    approvedCount++;
                    cleanCases++;
                }
                case REJECTED -> rejectedCount++;
                default -> cleanCases++;
            }

            if (c.getStatus() != CaseStatus.APPROVED && c.getStatus() != CaseStatus.REJECTED) {
                CalendarDto.DeadlineAnalysis analysis = calendarService.analyzeDeadline(c.getDeadlineAt(), now);
                if (analysis.isOverdue()) {
                    overdueBreached++;
                } else if ("APPROACHING_DEADLINE".equalsIgnoreCase(analysis.deadlineStatus())) {
                    approachingDeadline++;
                } else {
                    onTrack++;
                }
            } else {
                onTrack++;
            }
        }

        // Deficiencies calculation
        Set<UUID> caseIds = cases.stream().map(ApplicationCase::getId).collect(Collectors.toSet());
        List<Deficiency> allDeficiencies = deficiencyRepository.findAll();
        long openDeficiencies = 0;
        long resolvedDeficiencies = 0;

        for (Deficiency d : allDeficiencies) {
            if (d.getApplicationCase() != null && caseIds.contains(d.getApplicationCase().getId())) {
                if ("OPEN".equalsIgnoreCase(d.getStatus())) {
                    openDeficiencies++;
                } else if ("RESOLVED".equalsIgnoreCase(d.getStatus())) {
                    resolvedDeficiencies++;
                }
            }
        }

        double complianceRate = totalColleges > 0
                ? Math.round(((double) cleanCases / totalColleges) * 1000.0) / 10.0
                : 100.0;

        double avgReadiness = totalColleges > 0
                ? Math.round(((double) totalReadinessScore / totalColleges) * 10.0) / 10.0
                : 0.0;

        long totalExperts = expertRepository.findByActiveTrue().size();
        long criticalEscalations = notificationRepository.countByNotificationType(NotificationType.ESCALATION);

        DashboardDto.ExecutiveKpiCards kpiCards = new DashboardDto.ExecutiveKpiCards(
                totalColleges,
                pendingScrutiny,
                openDeficiencies,
                scheduledInspections,
                approvedCount,
                rejectedCount,
                criticalEscalations,
                avgReadiness
        );

        DashboardDto.ComplianceOverview compliance = new DashboardDto.ComplianceOverview(
                totalColleges,
                cleanCases,
                deficiencyFlaggedCases,
                deficiencyResubmittedCases,
                openDeficiencies,
                resolvedDeficiencies,
                complianceRate
        );

        DashboardDto.EvcOverview evc = new DashboardDto.EvcOverview(
                evcPendingVisits,
                scheduledInspections,
                evcCompletedVisits,
                totalExperts,
                3
        );

        DashboardDto.RegulatoryClockOverview clocks = new DashboardDto.RegulatoryClockOverview(
                onTrack,
                approachingDeadline,
                overdueBreached,
                criticalEscalations
        );

        LOG.info("Dashboard summary generated: totalColleges={}, complianceRate={}%", totalColleges, complianceRate);

        return new DashboardDto.DashboardSummary(
                "2026-27",
                region,
                kpiCards,
                compliance,
                evc,
                clocks,
                statusDistribution,
                regionalDistribution,
                now
        );
    }
}
