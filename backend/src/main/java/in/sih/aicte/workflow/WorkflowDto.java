package in.sih.aicte.workflow;

import in.sih.aicte.cases.CaseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public final class WorkflowDto {

    private WorkflowDto() {
    }

    public enum TransitionAction {
        ASSIGN_SCRUTINY,
        SCRUTINY_PASS,
        COMPLETE_EVC,
        RECOMMEND_APPROVAL,
        REJECT
    }

    public record TransitionRequest(
            @NotNull TransitionAction action,
            @NotBlank String actorRole,
            @NotBlank String actorId,
            String comment
    ) {
    }

    public record TransitionResponse(
            UUID caseId,
            String applicationNumber,
            CaseStatus previousStatus,
            CaseStatus newStatus,
            String currentStage,
            int readinessScore,
            String comment,
            UUID auditEventId,
            Instant transitionedAt
    ) {
    }
}
