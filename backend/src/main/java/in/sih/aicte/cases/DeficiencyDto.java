package in.sih.aicte.cases;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class DeficiencyDto {

    private DeficiencyDto() {
    }

    public record FlagDeficiencyRequest(
            @NotBlank String category,
            @NotBlank String description,
            int deadlineDays,
            @NotBlank String actorRole,
            @NotBlank String actorId
    ) {
    }

    public record RespondDeficiencyRequest(
            @NotBlank String responseComment,
            @NotBlank String proofDocumentName,
            String proofDocumentUrl,
            @NotBlank String actorRole,
            @NotBlank String actorId
    ) {
    }

    public record ResolveDeficiencyRequest(
            String resolutionComment,
            @NotBlank String actorRole,
            @NotBlank String actorId
    ) {
    }

    public record DeficiencyOperationResponse(
            UUID deficiencyId,
            UUID caseId,
            String category,
            String description,
            String status,
            int deadlineDays,
            Instant flaggedAt,
            Instant resolvedAt,
            String resolutionComment,
            String proofDocumentName,
            String proofDocumentUrl,
            CaseStatus caseStatus,
            String caseCurrentStage,
            int caseReadinessScore,
            UUID auditEventId
    ) {
    }
}
