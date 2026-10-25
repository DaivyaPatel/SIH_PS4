package in.sih.aicte.dashboard;

import in.sih.aicte.cases.Region;
import java.time.Instant;
import java.util.Map;

public final class DashboardDto {

    private DashboardDto() {
    }

    public record StageMetric(
            String stageKey,
            String stageDisplayName,
            long count,
            double percentage
    ) {
    }

    public record ComplianceOverview(
            long totalCases,
            long cleanCases,
            long deficiencyFlaggedCases,
            long deficiencyResubmittedCases,
            long totalOpenDeficiencies,
            long totalResolvedDeficiencies,
            double overallComplianceRate
    ) {
    }

    public record EvcOverview(
            long pendingScheduling,
            long scheduledVisits,
            long completedVisits,
            long totalActiveExperts,
            int defaultCommitteeSize
    ) {
    }

    public record RegulatoryClockOverview(
            long onTrack,
            long approachingDeadline,
            long overdueBreached,
            long totalEscalationsDispatched
    ) {
    }

    public record ExecutiveKpiCards(
            long totalColleges,
            long pendingScrutiny,
            long openDeficiencies,
            long scheduledInspections,
            long approvedCount,
            long rejectedCount,
            long criticalEscalations,
            double averageReadinessScore
    ) {
    }

    public record DashboardSummary(
            String academicYear,
            Region filteredRegion,
            ExecutiveKpiCards kpiCards,
            ComplianceOverview compliance,
            EvcOverview evc,
            RegulatoryClockOverview clocks,
            Map<String, Long> statusDistribution,
            Map<String, Long> regionalDistribution,
            Instant generatedAt
    ) {
    }
}
