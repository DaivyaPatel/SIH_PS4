package in.sih.aicte.readiness;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ReadinessDto {

    private ReadinessDto() {
    }

    public record ReadinessCriteria(
            String category,
            int scorePercentage,
            int maxPoints,
            int earnedPoints,
            String status,
            String details
    ) {
    }

    public record BlockingPrerequisite(
            String id,
            String category,
            String severity,
            String description,
            String resolutionGuide
    ) {
    }

    public record RecoveryAction(
            int priority,
            String actionType,
            String description,
            String targetRole,
            String targetEndpoint
    ) {
    }

    public record CaseReadinessResponse(
            UUID caseId,
            String applicationNumber,
            String institutionName,
            String status,
            String currentStage,
            int readinessScore,
            String readinessTier,
            boolean readyForNextStage,
            String nextTargetStage,
            List<ReadinessCriteria> criteria,
            List<BlockingPrerequisite> blockingPrerequisites,
            List<RecoveryAction> recommendedNextActions,
            Instant calculatedAt
    ) {
    }
}
