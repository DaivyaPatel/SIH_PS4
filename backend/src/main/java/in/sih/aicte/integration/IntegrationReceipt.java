package in.sih.aicte.integration;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "integration_receipts")
public class IntegrationReceipt {

    @Id
    private UUID id;

    @Column(name = "external_source_id", nullable = false, length = 100)
    private String externalSourceId;

    @Column(name = "case_id")
    private UUID caseId;

    @Column(nullable = false, length = 50)
    private String outcome;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "correlation_id", length = 80)
    private String correlationId;

    @Column(name = "synced_at", nullable = false, updatable = false)
    private Instant syncedAt = Instant.now();

    public IntegrationReceipt() {
    }

    public IntegrationReceipt(
            UUID id,
            String externalSourceId,
            UUID caseId,
            String outcome,
            String details,
            String correlationId,
            Instant syncedAt
    ) {
        this.id = id;
        this.externalSourceId = externalSourceId;
        this.caseId = caseId;
        this.outcome = outcome;
        this.details = details;
        this.correlationId = correlationId;
        this.syncedAt = syncedAt != null ? syncedAt : Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getExternalSourceId() {
        return externalSourceId;
    }

    public void setExternalSourceId(String externalSourceId) {
        this.externalSourceId = externalSourceId;
    }

    public UUID getCaseId() {
        return caseId;
    }

    public void setCaseId(UUID caseId) {
        this.caseId = caseId;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public Instant getSyncedAt() {
        return syncedAt;
    }

    public void setSyncedAt(Instant syncedAt) {
        this.syncedAt = syncedAt;
    }
}
