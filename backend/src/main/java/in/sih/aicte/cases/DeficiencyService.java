package in.sih.aicte.cases;

import in.sih.aicte.audit.AuditDto;
import in.sih.aicte.audit.AuditService;
import in.sih.aicte.calendar.RegulatoryCalendarService;
import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeficiencyService {

    private final ApplicationCaseRepository caseRepository;
    private final DeficiencyRepository deficiencyRepository;
    private final AuditService auditService;
    private final RegulatoryCalendarService calendarService;

    public DeficiencyService(
            ApplicationCaseRepository caseRepository,
            DeficiencyRepository deficiencyRepository,
            AuditService auditService,
            RegulatoryCalendarService calendarService
    ) {
        this.caseRepository = caseRepository;
        this.deficiencyRepository = deficiencyRepository;
        this.auditService = auditService;
        this.calendarService = calendarService;
    }

    @Transactional
    public DeficiencyDto.DeficiencyOperationResponse flagDeficiency(
            UUID caseId,
            DeficiencyDto.FlagDeficiencyRequest request,
            String correlationId
    ) {
        ApplicationCase appCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));

        if (appCase.getStatus() == CaseStatus.APPROVED || appCase.getStatus() == CaseStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Cannot flag deficiency on a completed or rejected case: " + appCase.getStatus());
        }

        CaseStatus prevStatus = appCase.getStatus();
        appCase.setStatus(CaseStatus.DEFICIENCY_FLAGGED);
        appCase.setCurrentStage("DEFICIENCY_REVIEW");
        appCase.setReadinessScore(Math.max(10, Math.min(appCase.getReadinessScore(), 45)));

        int days = request.deadlineDays() > 0 ? request.deadlineDays() : 7;
        Instant calculatedDeadline = calendarService.calculateDeadline(Instant.now(), days);
        if (appCase.getDeadlineAt() == null || calculatedDeadline.isBefore(appCase.getDeadlineAt())) {
            appCase.setDeadlineAt(calculatedDeadline);
        }
        appCase.setUpdatedAt(Instant.now());
        ApplicationCase savedCase = caseRepository.save(appCase);

        Deficiency deficiency = new Deficiency();
        deficiency.setId(UUID.randomUUID());
        deficiency.setApplicationCase(savedCase);
        deficiency.setCategory(request.category());
        deficiency.setDescription(request.description());
        deficiency.setStatus("OPEN");
        deficiency.setDeadlineDays(days);
        deficiency.setFlaggedAt(Instant.now());
        Deficiency savedDeficiency = deficiencyRepository.save(deficiency);

        AuditDto.AuditEventRecord auditRecord = auditService.recordEvent(
                savedCase.getId(),
                "FLAG_DEFICIENCY",
                request.actorRole(),
                request.actorId(),
                prevStatus.name(),
                savedCase.getStatus().name(),
                "Deficiency flagged [" + request.category() + "]: " + request.description(),
                correlationId
        );

        return toOperationResponse(savedDeficiency, savedCase, auditRecord.id());
    }

    @Transactional
    public DeficiencyDto.DeficiencyOperationResponse respondToDeficiency(
            UUID caseId,
            UUID defId,
            DeficiencyDto.RespondDeficiencyRequest request,
            String correlationId
    ) {
        ApplicationCase appCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));

        Deficiency deficiency = deficiencyRepository.findByIdAndApplicationCaseId(defId, caseId)
                .orElseThrow(() -> new NoSuchElementException("Deficiency " + defId + " not found for case " + caseId));

        if ("RESOLVED".equalsIgnoreCase(deficiency.getStatus())) {
            throw new IllegalArgumentException("Cannot respond to an already resolved deficiency.");
        }

        CaseStatus prevStatus = appCase.getStatus();
        deficiency.setStatus("RESUBMITTED");
        deficiency.setResolutionComment(request.responseComment());
        deficiency.setProofDocumentName(request.proofDocumentName());
        String proofUrl = (request.proofDocumentUrl() != null && !request.proofDocumentUrl().isBlank())
                ? request.proofDocumentUrl()
                : "/documents/proofs/" + UUID.randomUUID() + "-" + request.proofDocumentName();
        deficiency.setProofDocumentUrl(proofUrl);
        Deficiency savedDeficiency = deficiencyRepository.save(deficiency);

        var allDeficiencies = deficiencyRepository.findByApplicationCaseId(caseId);
        boolean hasRemainingOpen = allDeficiencies.stream()
                .anyMatch(d -> "OPEN".equalsIgnoreCase(d.getStatus()));

        if (!hasRemainingOpen) {
            appCase.setStatus(CaseStatus.DEFICIENCY_RESUBMITTED);
            appCase.setCurrentStage("SCRUTINY_RE_REVIEW");
            appCase.setReadinessScore(Math.max(appCase.getReadinessScore(), 78));
            appCase.setUpdatedAt(Instant.now());
            caseRepository.save(appCase);
        }

        AuditDto.AuditEventRecord auditRecord = auditService.recordEvent(
                appCase.getId(),
                "RESPOND_DEFICIENCY",
                request.actorRole(),
                request.actorId(),
                prevStatus.name(),
                appCase.getStatus().name(),
                "Compliance response submitted for deficiency: " + request.responseComment(),
                correlationId
        );

        return toOperationResponse(savedDeficiency, appCase, auditRecord.id());
    }

    @Transactional
    public DeficiencyDto.DeficiencyOperationResponse resolveDeficiency(
            UUID caseId,
            UUID defId,
            DeficiencyDto.ResolveDeficiencyRequest request,
            String correlationId
    ) {
        ApplicationCase appCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));

        Deficiency deficiency = deficiencyRepository.findByIdAndApplicationCaseId(defId, caseId)
                .orElseThrow(() -> new NoSuchElementException("Deficiency " + defId + " not found for case " + caseId));

        if ("RESOLVED".equalsIgnoreCase(deficiency.getStatus())) {
            throw new IllegalArgumentException("Deficiency " + defId + " is already resolved.");
        }

        CaseStatus prevStatus = appCase.getStatus();
        deficiency.setStatus("RESOLVED");
        deficiency.setResolvedAt(Instant.now());
        if (request.resolutionComment() != null && !request.resolutionComment().isBlank()) {
            String combinedComment = (deficiency.getResolutionComment() != null)
                    ? deficiency.getResolutionComment() + " | Clearance: " + request.resolutionComment()
                    : request.resolutionComment();
            deficiency.setResolutionComment(combinedComment);
        }
        Deficiency savedDeficiency = deficiencyRepository.save(deficiency);

        var allDeficiencies = deficiencyRepository.findByApplicationCaseId(caseId);
        boolean allResolved = allDeficiencies.stream()
                .allMatch(d -> "RESOLVED".equalsIgnoreCase(d.getStatus()));

        if (allResolved) {
            appCase.setStatus(CaseStatus.EVC_PENDING);
            appCase.setCurrentStage("EVC_SCHEDULING");
            appCase.setReadinessScore(92);
            appCase.setUpdatedAt(Instant.now());
            caseRepository.save(appCase);
        }

        AuditDto.AuditEventRecord auditRecord = auditService.recordEvent(
                appCase.getId(),
                "RESOLVE_DEFICIENCY",
                request.actorRole(),
                request.actorId(),
                prevStatus.name(),
                appCase.getStatus().name(),
                "Deficiency cleared: " + (request.resolutionComment() != null
                        ? request.resolutionComment() : "Accepted resolution"),
                correlationId
        );

        return toOperationResponse(savedDeficiency, appCase, auditRecord.id());
    }

    private DeficiencyDto.DeficiencyOperationResponse toOperationResponse(
            Deficiency deficiency,
            ApplicationCase appCase,
            UUID auditEventId
    ) {
        return new DeficiencyDto.DeficiencyOperationResponse(
                deficiency.getId(),
                appCase.getId(),
                deficiency.getCategory(),
                deficiency.getDescription(),
                deficiency.getStatus(),
                deficiency.getDeadlineDays(),
                deficiency.getFlaggedAt(),
                deficiency.getResolvedAt(),
                deficiency.getResolutionComment(),
                deficiency.getProofDocumentName(),
                deficiency.getProofDocumentUrl(),
                appCase.getStatus(),
                appCase.getCurrentStage(),
                appCase.getReadinessScore(),
                auditEventId
        );
    }
}
