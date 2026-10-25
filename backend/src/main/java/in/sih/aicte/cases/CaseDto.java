package in.sih.aicte.cases;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class CaseDto {

    private CaseDto() {
    }

    public record CaseSummary(
            UUID id,
            String applicationNumber,
            String institutionCode,
            String institutionName,
            String institutionType,
            Region region,
            String academicYear,
            String applicationType,
            CaseStatus status,
            String currentStage,
            int readinessScore,
            String assignedOfficer,
            Instant deadlineAt,
            Instant submittedAt,
            Instant updatedAt
    ) {
    }

    public record CampusSummary(
            UUID id,
            String campusName,
            String address,
            BigDecimal landAreaAcres,
            BigDecimal builtUpAreaSqM,
            String landLeaseStatus,
            LocalDate leaseExpiryDate
    ) {
    }

    public record InstitutionDetail(
            UUID id,
            String code,
            String name,
            String institutionType,
            Region region,
            String address,
            int establishedYear,
            String contactEmail,
            List<CampusSummary> campuses
    ) {
    }

    public record DeficiencyDetail(
            UUID id,
            String category,
            String description,
            String status,
            int deadlineDays,
            Instant flaggedAt,
            Instant resolvedAt,
            String resolutionComment,
            String proofDocumentName,
            String proofDocumentUrl
    ) {
    }

    public record DocumentDetail(
            UUID id,
            String documentType,
            String documentName,
            String fileHash,
            String verificationStatus,
            LocalDate validUntil,
            Instant uploadedAt
    ) {
    }

    public record CaseDetail(
            UUID id,
            String applicationNumber,
            String academicYear,
            String applicationType,
            CaseStatus status,
            String currentStage,
            int readinessScore,
            String assignedOfficer,
            Instant deadlineAt,
            Instant submittedAt,
            Instant updatedAt,
            InstitutionDetail institution,
            List<DeficiencyDetail> deficiencies,
            List<DocumentDetail> documents
    ) {
    }
}
