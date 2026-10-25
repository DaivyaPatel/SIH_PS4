package in.sih.aicte.workflow;

import in.sih.aicte.audit.AuditDto;
import in.sih.aicte.audit.AuditService;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.CaseStatus;
import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkflowTransitionService {

    private final ApplicationCaseRepository caseRepository;
    private final AuditService auditService;

    public WorkflowTransitionService(
            ApplicationCaseRepository caseRepository,
            AuditService auditService
    ) {
        this.caseRepository = caseRepository;
        this.auditService = auditService;
    }

    @Transactional
    public WorkflowDto.TransitionResponse executeTransition(
            UUID caseId,
            WorkflowDto.TransitionRequest request,
            String correlationId
    ) {
        ApplicationCase appCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));

        CaseStatus prevStatus = appCase.getStatus();
        CaseStatus targetStatus;
        String targetStage;
        int targetScore;

        switch (request.action()) {
            case ASSIGN_SCRUTINY -> {
                if (prevStatus != CaseStatus.SUBMITTED) {
                    throw new IllegalArgumentException(
                            "Cannot assign scrutiny: Case is in status " + prevStatus + ", expected SUBMITTED.");
                }
                targetStatus = CaseStatus.UNDER_SCRUTINY;
                targetStage = "DOCUMENT_SCRUTINY";
                targetScore = Math.max(appCase.getReadinessScore(), 80);
            }
            case SCRUTINY_PASS -> {
                if (prevStatus != CaseStatus.UNDER_SCRUTINY && prevStatus != CaseStatus.DEFICIENCY_RESUBMITTED) {
                    throw new IllegalArgumentException(
                            "Cannot execute scrutiny pass: Case is in status " + prevStatus
                                    + ", expected UNDER_SCRUTINY or DEFICIENCY_RESUBMITTED.");
                }
                boolean hasOpenDeficiencies = appCase.getDeficiencies().stream()
                        .anyMatch(d -> !"RESOLVED".equalsIgnoreCase(d.getStatus()));
                if (hasOpenDeficiencies) {
                    throw new IllegalArgumentException(
                            "Guarded transition rejected: Case has unresolved deficiencies that block scrutiny clearance.");
                }
                targetStatus = CaseStatus.EVC_PENDING;
                targetStage = "EVC_SCHEDULING";
                targetScore = 92;
            }
            case COMPLETE_EVC -> {
                if (prevStatus != CaseStatus.EVC_SCHEDULED) {
                    throw new IllegalArgumentException(
                            "Cannot complete EVC: Case is in status " + prevStatus + ", expected EVC_SCHEDULED.");
                }
                targetStatus = CaseStatus.EVC_COMPLETED;
                targetStage = "REGIONAL_COMMITTEE_REVIEW";
                targetScore = 96;
            }
            case RECOMMEND_APPROVAL -> {
                if (prevStatus != CaseStatus.EVC_COMPLETED
                        && prevStatus != CaseStatus.EVC_PENDING
                        && prevStatus != CaseStatus.UNDER_SCRUTINY) {
                    throw new IllegalArgumentException(
                            "Cannot approve case: Status " + prevStatus + " is not eligible for final approval.");
                }
                boolean hasOpenDeficiencies = appCase.getDeficiencies().stream()
                        .anyMatch(d -> !"RESOLVED".equalsIgnoreCase(d.getStatus()));
                if (hasOpenDeficiencies) {
                    throw new IllegalArgumentException(
                            "Guarded transition rejected: Case cannot be approved with active unresolved deficiencies.");
                }
                targetStatus = CaseStatus.APPROVED;
                targetStage = "COMPLETED";
                targetScore = 100;
            }
            case REJECT -> {
                if (prevStatus == CaseStatus.APPROVED || prevStatus == CaseStatus.REJECTED || prevStatus == CaseStatus.DRAFT) {
                    throw new IllegalArgumentException(
                            "Cannot reject case: Terminal or draft status " + prevStatus + " cannot be transitioned.");
                }
                targetStatus = CaseStatus.REJECTED;
                targetStage = "REJECTED";
                targetScore = 0;
            }
            default -> throw new IllegalArgumentException("Unsupported transition action: " + request.action());
        }

        appCase.setStatus(targetStatus);
        appCase.setCurrentStage(targetStage);
        appCase.setReadinessScore(targetScore);
        appCase.setUpdatedAt(Instant.now());
        ApplicationCase saved = caseRepository.save(appCase);

        String details = (request.comment() != null && !request.comment().isBlank())
                ? request.comment()
                : "Guarded transition executed: " + request.action().name();

        AuditDto.AuditEventRecord auditRecord = auditService.recordEvent(
                saved.getId(),
                request.action().name(),
                request.actorRole(),
                request.actorId(),
                prevStatus.name(),
                targetStatus.name(),
                details,
                correlationId
        );

        return new WorkflowDto.TransitionResponse(
                saved.getId(),
                saved.getApplicationNumber(),
                prevStatus,
                targetStatus,
                targetStage,
                targetScore,
                details,
                auditRecord.id(),
                saved.getUpdatedAt()
        );
    }
}
