package in.sih.aicte.cases;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "deficiencies")
public class Deficiency {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private ApplicationCase applicationCase;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "deadline_days", nullable = false)
    private int deadlineDays = 7;

    @Column(name = "flagged_at", nullable = false, updatable = false)
    private Instant flaggedAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "resolution_comment", columnDefinition = "TEXT")
    private String resolutionComment;

    @Column(name = "proof_document_name", length = 255)
    private String proofDocumentName;

    @Column(name = "proof_document_url", columnDefinition = "TEXT")
    private String proofDocumentUrl;

    public Deficiency() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ApplicationCase getApplicationCase() {
        return applicationCase;
    }

    public void setApplicationCase(ApplicationCase applicationCase) {
        this.applicationCase = applicationCase;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getDeadlineDays() {
        return deadlineDays;
    }

    public void setDeadlineDays(int deadlineDays) {
        this.deadlineDays = deadlineDays;
    }

    public Instant getFlaggedAt() {
        return flaggedAt;
    }

    public void setFlaggedAt(Instant flaggedAt) {
        this.flaggedAt = flaggedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolutionComment() {
        return resolutionComment;
    }

    public void setResolutionComment(String resolutionComment) {
        this.resolutionComment = resolutionComment;
    }

    public String getProofDocumentName() {
        return proofDocumentName;
    }

    public void setProofDocumentName(String proofDocumentName) {
        this.proofDocumentName = proofDocumentName;
    }

    public String getProofDocumentUrl() {
        return proofDocumentUrl;
    }

    public void setProofDocumentUrl(String proofDocumentUrl) {
        this.proofDocumentUrl = proofDocumentUrl;
    }
}
