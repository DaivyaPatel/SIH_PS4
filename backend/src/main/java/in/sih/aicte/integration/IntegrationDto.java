package in.sih.aicte.integration;

import in.sih.aicte.cases.Region;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public final class IntegrationDto {

    private IntegrationDto() {
    }

    public enum SyncOutcome {
        INGESTED,
        DUPLICATE_SKIPPED,
        VALIDATION_FAILED
    }

    public record PortalSyncRequest(
            String externalApplicationId,
            String institutionCode,
            String institutionName,
            String institutionType,
            Region region,
            String academicYear,
            String applicationType,
            String address,
            String contactEmail,
            Integer establishedYear,
            String campusName,
            BigDecimal landAreaAcres,
            BigDecimal builtUpAreaSqM
    ) {
    }

    public record PortalSyncReceipt(
            UUID receiptId,
            String externalApplicationId,
            UUID caseId,
            String applicationNumber,
            SyncOutcome outcome,
            String message,
            String correlationId,
            Instant syncedAt
    ) {
    }

    public record IntegrationStatus(
            boolean connected,
            String sourcePortal,
            long totalSyncCount,
            long totalIngestedCount,
            Instant lastSyncAt
    ) {
    }
}
