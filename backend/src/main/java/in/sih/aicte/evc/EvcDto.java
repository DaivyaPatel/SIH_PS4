package in.sih.aicte.evc;

import in.sih.aicte.cases.Region;
import java.util.List;
import java.util.UUID;

public final class EvcDto {

    private EvcDto() {
    }

    public record ExpertDetail(
            UUID id,
            String name,
            String email,
            String designation,
            String domain,
            String affiliatedInstitution,
            Region region,
            String conflictInstitutions,
            List<String> availableDates,
            int maxAssignments,
            boolean active
    ) {
    }

    public record ExpertEligibilityResult(
            UUID expertId,
            String name,
            String domain,
            String affiliatedInstitution,
            Region region,
            boolean eligible,
            String eligibilityReason
    ) {
    }

    public record EligibleExpertsResponse(
            UUID caseId,
            String applicationNumber,
            String institutionName,
            String targetDate,
            String requiredDomain,
            int eligibleCount,
            int ineligibleCount,
            List<ExpertEligibilityResult> eligibleExperts,
            List<ExpertEligibilityResult> ineligibleExperts
    ) {
    }

    public record ScheduleOptimizationRequest(
            List<UUID> caseIds,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            Integer committeeSize,
            Integer maxAssignmentsPerExpert
    ) {
    }

    public record ScheduledCommitteeMember(
            UUID expertId,
            String name,
            String domain,
            String designation,
            String affiliatedInstitution,
            Region region,
            String role
    ) {
    }

    public record ScheduledVisitAssignment(
            UUID caseId,
            String applicationNumber,
            String institutionName,
            Region institutionRegion,
            java.time.LocalDate scheduledInspectionDate,
            List<ScheduledCommitteeMember> committeeMembers
    ) {
    }

    public record UnassignedCaseReason(
            UUID caseId,
            String applicationNumber,
            String reason
    ) {
    }

    public record ScheduleOptimizationResponse(
            String solverStatus,
            long solveTimeMs,
            int totalCasesRequested,
            int totalCasesScheduled,
            List<ScheduledVisitAssignment> scheduledVisits,
            List<UnassignedCaseReason> unassignedCases,
            String solverNotes
    ) {
    }
}
