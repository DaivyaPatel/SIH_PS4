package in.sih.aicte.audit;

import java.time.Instant;
import java.util.UUID;

public final class AuditDto {

    private AuditDto() {
    }

    public record AuditEventRecord(
            UUID id,
            UUID caseId,
            String action,
            String actorRole,
            String actorId,
            String previousState,
            String newState,
            String details,
            String correlationId,
            Instant createdAt
    ) {
    }
}
