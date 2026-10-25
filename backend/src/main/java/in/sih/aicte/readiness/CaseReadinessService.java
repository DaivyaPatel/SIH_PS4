package in.sih.aicte.readiness;

import in.sih.aicte.calendar.CalendarDto;
import in.sih.aicte.calendar.RegulatoryCalendarService;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.CaseStatus;
import in.sih.aicte.cases.Deficiency;
import in.sih.aicte.cases.DeficiencyRepository;
import in.sih.aicte.cases.DocumentMetadata;
import in.sih.aicte.cases.DocumentMetadataRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CaseReadinessService {

    private static final Logger LOG = LoggerFactory.getLogger(CaseReadinessService.class);

    private final ApplicationCaseRepository caseRepository;
    private final DocumentMetadataRepository documentRepository;
    private final DeficiencyRepository deficiencyRepository;
    private final RegulatoryCalendarService calendarService;

    public CaseReadinessService(
            ApplicationCaseRepository caseRepository,
            DocumentMetadataRepository documentRepository,
            DeficiencyRepository deficiencyRepository,
            RegulatoryCalendarService calendarService
    ) {
        this.caseRepository = caseRepository;
        this.documentRepository = documentRepository;
        this.deficiencyRepository = deficiencyRepository;
        this.calendarService = calendarService;
    }

    @Transactional
    public ReadinessDto.CaseReadinessResponse evaluateReadiness(UUID caseId) {
        ApplicationCase applicationCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));

        List<DocumentMetadata> documents = documentRepository.findByApplicationCaseId(caseId);
        List<Deficiency> deficiencies = deficiencyRepository.findByApplicationCaseId(caseId);
        CalendarDto.DeadlineAnalysis deadlineAnalysis =
                calendarService.analyzeDeadline(applicationCase.getDeadlineAt(), Instant.now());

        List<ReadinessDto.ReadinessCriteria> criteriaList = new ArrayList<>();
        List<ReadinessDto.BlockingPrerequisite> blockingPrerequisites = new ArrayList<>();
        List<ReadinessDto.RecoveryAction> recommendedActions = new ArrayList<>();

        int docPoints = evaluateDocuments(documents, caseId, criteriaList, blockingPrerequisites, recommendedActions);
        int defPoints = evaluateDeficiencies(deficiencies, caseId, criteriaList, blockingPrerequisites, recommendedActions);
        int workflowPoints = evaluateWorkflowStage(applicationCase, criteriaList, blockingPrerequisites, recommendedActions);
        int deadlinePoints = evaluateDeadline(deadlineAnalysis, caseId, criteriaList, blockingPrerequisites, recommendedActions);

        int totalScore = Math.max(0, Math.min(100, docPoints + defPoints + workflowPoints + deadlinePoints));

        // Update case record with current evaluated score
        applicationCase.setReadinessScore(totalScore);
        applicationCase.setUpdatedAt(Instant.now());
        caseRepository.save(applicationCase);

        String readinessTier;
        if (totalScore >= 90) {
            readinessTier = "FULLY_COMPLIANT";
        } else if (totalScore >= 70) {
            readinessTier = "NEAR_READY";
        } else if (totalScore >= 40) {
            readinessTier = "NEEDS_ATTENTION";
        } else {
            readinessTier = "CRITICAL_DEFICIT";
        }

        boolean readyForNext = blockingPrerequisites.isEmpty() && totalScore >= 75;
        String nextStage = resolveNextStage(applicationCase.getStatus());

        if (readyForNext && applicationCase.getStatus() != CaseStatus.APPROVED) {
            recommendedActions.add(new ReadinessDto.RecoveryAction(
                    1,
                    "TRANSITION_NEXT_STAGE",
                    "All prerequisites cleared. Advance case to " + nextStage + " via workflow transition.",
                    "REGIONAL_OFFICER",
                    "/api/v1/cases/" + caseId + "/transition"
            ));
        }

        String institutionName = (applicationCase.getInstitution() != null)
                ? applicationCase.getInstitution().getName()
                : "Institution";

        LOG.info("Evaluated readiness for case {}: score={}, tier={}, blockingPrereqs={}",
                applicationCase.getApplicationNumber(), totalScore, readinessTier, blockingPrerequisites.size());

        return new ReadinessDto.CaseReadinessResponse(
                caseId,
                applicationCase.getApplicationNumber(),
                institutionName,
                applicationCase.getStatus().name(),
                applicationCase.getCurrentStage(),
                totalScore,
                readinessTier,
                readyForNext,
                nextStage,
                criteriaList,
                blockingPrerequisites,
                recommendedActions,
                Instant.now()
        );
    }

    private int evaluateDocuments(
            List<DocumentMetadata> documents,
            UUID caseId,
            List<ReadinessDto.ReadinessCriteria> criteriaList,
            List<ReadinessDto.BlockingPrerequisite> blockingPrerequisites,
            List<ReadinessDto.RecoveryAction> recommendedActions
    ) {
        int maxPoints = 35;
        if (documents.isEmpty()) {
            criteriaList.add(new ReadinessDto.ReadinessCriteria(
                    "MANDATORY_DOCUMENTS",
                    0,
                    maxPoints,
                    0,
                    "FAILED",
                    "No statutory documents uploaded or verified."
            ));
            blockingPrerequisites.add(new ReadinessDto.BlockingPrerequisite(
                    "DOC_MISSING_ALL",
                    "MANDATORY_DOCUMENT",
                    "CRITICAL",
                    "No statutory land, building, or safety documents attached to case.",
                    "Upload certified statutory title deed, fire clearance NOC, and structural certificates."
            ));
            return 0;
        }

        LocalDate now = LocalDate.now();
        int validCount = 0;
        int defectCount = 0;

        for (DocumentMetadata doc : documents) {
            boolean isStatusDeficient = "DEFICIENT".equalsIgnoreCase(doc.getVerificationStatus())
                    || "EXPIRED".equalsIgnoreCase(doc.getVerificationStatus())
                    || "REJECTED".equalsIgnoreCase(doc.getVerificationStatus());

            boolean isExpired = doc.getValidUntil() != null && doc.getValidUntil().isBefore(now);

            if (isStatusDeficient || isExpired) {
                defectCount++;
                String reason = isExpired
                        ? "Validity expired on " + doc.getValidUntil()
                        : "Verification status is " + doc.getVerificationStatus();

                blockingPrerequisites.add(new ReadinessDto.BlockingPrerequisite(
                        "DOC_DEFECT_" + doc.getId(),
                        "MANDATORY_DOCUMENT",
                        "CRITICAL",
                        "Document " + doc.getDocumentName() + " (" + doc.getDocumentType() + ") has defect: " + reason,
                        "Upload valid renewed certificate or legal deed with minimum 3-year live validity."
                ));

                recommendedActions.add(new ReadinessDto.RecoveryAction(
                        2,
                        "UPLOAD_REPLACEMENT_DOCUMENT",
                        "Upload rectification for defective document: " + doc.getDocumentName(),
                        "INSTITUTION_ADMIN",
                        "/api/v1/cases/" + caseId + "/deficiencies"
                ));
            } else if ("VERIFIED".equalsIgnoreCase(doc.getVerificationStatus())) {
                validCount++;
            }
        }

        int earnedPoints;
        String status;
        if (defectCount > 0) {
            earnedPoints = (int) Math.round(((double) validCount / documents.size()) * maxPoints * 0.4);
            status = "FAILED";
        } else if (validCount == documents.size()) {
            earnedPoints = maxPoints;
            status = "PASSED";
        } else {
            earnedPoints = (int) Math.round(((double) validCount / documents.size()) * maxPoints);
            status = "WARNING";
        }

        int scorePct = (int) Math.round(((double) earnedPoints / maxPoints) * 100);
        criteriaList.add(new ReadinessDto.ReadinessCriteria(
                "MANDATORY_DOCUMENTS",
                scorePct,
                maxPoints,
                earnedPoints,
                status,
                validCount + " of " + documents.size() + " documents verified; " + defectCount + " defects identified."
        ));

        return earnedPoints;
    }

    private int evaluateDeficiencies(
            List<Deficiency> deficiencies,
            UUID caseId,
            List<ReadinessDto.ReadinessCriteria> criteriaList,
            List<ReadinessDto.BlockingPrerequisite> blockingPrerequisites,
            List<ReadinessDto.RecoveryAction> recommendedActions
    ) {
        int maxPoints = 35;
        if (deficiencies.isEmpty()) {
            criteriaList.add(new ReadinessDto.ReadinessCriteria(
                    "DEFICIENCY_CLEARANCE",
                    100,
                    maxPoints,
                    maxPoints,
                    "PASSED",
                    "Zero deficiencies flagged against application."
            ));
            return maxPoints;
        }

        int openCount = 0;
        int resubmittedCount = 0;
        int resolvedCount = 0;

        for (Deficiency def : deficiencies) {
            if ("OPEN".equalsIgnoreCase(def.getStatus())) {
                openCount++;
                blockingPrerequisites.add(new ReadinessDto.BlockingPrerequisite(
                        "DEF_OPEN_" + def.getId(),
                        "STATUTORY_DEFICIENCY",
                        "CRITICAL",
                        "Open deficiency in " + def.getCategory() + ": " + def.getDescription(),
                        "Institutional administrator must upload proof document and response comments."
                ));
                recommendedActions.add(new ReadinessDto.RecoveryAction(
                        1,
                        "RESPOND_TO_DEFICIENCY",
                        "Submit institutional compliance for deficiency: " + def.getCategory(),
                        "INSTITUTION_ADMIN",
                        "/api/v1/cases/" + caseId + "/deficiencies/" + def.getId() + "/respond"
                ));
            } else if ("RESUBMITTED".equalsIgnoreCase(def.getStatus())) {
                resubmittedCount++;
                blockingPrerequisites.add(new ReadinessDto.BlockingPrerequisite(
                        "DEF_RESUBMITTED_" + def.getId(),
                        "SCRUTINY_PENDING",
                        "HIGH",
                        "Institutional response resubmitted for " + def.getCategory() + " awaiting officer verification.",
                        "Scrutiny officer must review submitted proof and mark deficiency resolved."
                ));
                recommendedActions.add(new ReadinessDto.RecoveryAction(
                        2,
                        "RESOLVE_DEFICIENCY",
                        "Review resubmission and resolve deficiency: " + def.getCategory(),
                        "SCRUTINY_OFFICER",
                        "/api/v1/cases/" + caseId + "/deficiencies/" + def.getId() + "/resolve"
                ));
            } else if ("RESOLVED".equalsIgnoreCase(def.getStatus())) {
                resolvedCount++;
            }
        }

        int earnedPoints;
        String status;
        if (openCount > 0) {
            earnedPoints = (int) Math.round(((double) resolvedCount / deficiencies.size()) * maxPoints * 0.3);
            status = "FAILED";
        } else if (resubmittedCount > 0) {
            earnedPoints = (int) Math.round(maxPoints * 0.7);
            status = "WARNING";
        } else {
            earnedPoints = maxPoints;
            status = "PASSED";
        }

        int scorePct = (int) Math.round(((double) earnedPoints / maxPoints) * 100);
        criteriaList.add(new ReadinessDto.ReadinessCriteria(
                "DEFICIENCY_CLEARANCE",
                scorePct,
                maxPoints,
                earnedPoints,
                status,
                resolvedCount + " resolved, " + resubmittedCount + " resubmitted, " + openCount + " open deficiencies."
        ));

        return earnedPoints;
    }

    private int evaluateWorkflowStage(
            ApplicationCase c,
            List<ReadinessDto.ReadinessCriteria> criteriaList,
            List<ReadinessDto.BlockingPrerequisite> blockingPrerequisites,
            List<ReadinessDto.RecoveryAction> recommendedActions
    ) {
        int maxPoints = 20;
        int earnedPoints;
        String status;
        String details;

        switch (c.getStatus()) {
            case APPROVED -> {
                earnedPoints = 20;
                status = "PASSED";
                details = "Application has received final regulatory approval.";
            }
            case EVC_COMPLETED -> {
                earnedPoints = 18;
                status = "PASSED";
                details = "EVC inspection completed; ready for final Regional Committee decision.";
            }
            case EVC_SCHEDULED -> {
                earnedPoints = 16;
                status = "PASSED";
                details = "Expert Visit Committee scheduled with zero conflicts.";
            }
            case EVC_PENDING -> {
                earnedPoints = 12;
                status = "WARNING";
                details = "Scrutiny cleared; Expert Visit Committee pending allocation.";
                blockingPrerequisites.add(new ReadinessDto.BlockingPrerequisite(
                        "EVC_COMMITTEE_UNSCHEDULED",
                        "COMMITTEE_ALIGNMENT",
                        "HIGH",
                        "EVC committee members not yet allocated for campus verification.",
                        "Execute Google OR-Tools CP-SAT scheduler to assign non-conflicted expert committee."
                ));
                recommendedActions.add(new ReadinessDto.RecoveryAction(
                        1,
                        "SCHEDULE_EVC_VISIT",
                        "Run bounded CP-SAT solver to schedule inspection committee.",
                        "REGIONAL_OFFICER",
                        "/api/v1/evc/optimize-schedule"
                ));
            }
            case DEFICIENCY_RESUBMITTED -> {
                earnedPoints = 10;
                status = "WARNING";
                details = "Application in re-scrutiny stage.";
            }
            case DEFICIENCY_FLAGGED -> {
                earnedPoints = 5;
                status = "FAILED";
                details = "Application paused pending institutional deficiency resolution.";
            }
            case UNDER_SCRUTINY -> {
                earnedPoints = 8;
                status = "WARNING";
                details = "Application undergoing document scrutiny review.";
            }
            case SUBMITTED, DRAFT -> {
                earnedPoints = 3;
                status = "FAILED";
                details = "Preliminary ingestion stage; initial scrutiny pending.";
            }
            case REJECTED -> {
                earnedPoints = 0;
                status = "FAILED";
                details = "Application has been rejected.";
            }
            default -> {
                earnedPoints = 5;
                status = "WARNING";
                details = "Active workflow stage: " + c.getCurrentStage();
            }
        }

        int scorePct = (int) Math.round(((double) earnedPoints / maxPoints) * 100);
        criteriaList.add(new ReadinessDto.ReadinessCriteria(
                "COMMITTEE_AND_WORKFLOW",
                scorePct,
                maxPoints,
                earnedPoints,
                status,
                details
        ));

        return earnedPoints;
    }

    private int evaluateDeadline(
            CalendarDto.DeadlineAnalysis analysis,
            UUID caseId,
            List<ReadinessDto.ReadinessCriteria> criteriaList,
            List<ReadinessDto.BlockingPrerequisite> blockingPrerequisites,
            List<ReadinessDto.RecoveryAction> recommendedActions
    ) {
        int maxPoints = 10;
        int earnedPoints;
        String status;
        String details;

        if (analysis.isOverdue()) {
            earnedPoints = 0;
            status = "FAILED";
            details = "Statutory deadline exceeded by " + Math.abs(analysis.remainingHours()) + " hours.";

            blockingPrerequisites.add(new ReadinessDto.BlockingPrerequisite(
                    "STATUTORY_DEADLINE_BREACH",
                    "REGULATORY_CLOCK",
                    "CRITICAL",
                    "Application is overdue beyond its statutory deadline (" + analysis.deadlineAtIst() + ").",
                    "Request statutory deadline extension or submit urgent compliance to prevent statutory lapse."
            ));

            recommendedActions.add(new ReadinessDto.RecoveryAction(
                    1,
                    "REQUEST_DEADLINE_EXTENSION",
                    "Grant regulatory deadline extension under APH emergency powers.",
                    "REGIONAL_OFFICER",
                    "/api/v1/cases/" + caseId + "/deadline/extend"
            ));
        } else if ("APPROACHING_DEADLINE".equalsIgnoreCase(analysis.deadlineStatus())) {
            earnedPoints = 5;
            status = "WARNING";
            details = "Deadline approaching within " + analysis.remainingHours() + " hours (" + analysis.deadlineAtIst() + ").";
        } else {
            earnedPoints = 10;
            status = "PASSED";
            details = (analysis.deadlineAtIst() != null)
                    ? "On track. Deadline: " + analysis.deadlineAtIst() + " (" + analysis.remainingBusinessDays() + " business days left)."
                    : "No statutory deadline active.";
        }

        int scorePct = (int) Math.round(((double) earnedPoints / maxPoints) * 100);
        criteriaList.add(new ReadinessDto.ReadinessCriteria(
                "REGULATORY_DEADLINE",
                scorePct,
                maxPoints,
                earnedPoints,
                status,
                details
        ));

        return earnedPoints;
    }

    private String resolveNextStage(CaseStatus status) {
        if (status == null) {
            return "UNKNOWN";
        }
        return switch (status) {
            case DRAFT -> "SUBMITTED";
            case SUBMITTED -> "UNDER_SCRUTINY";
            case UNDER_SCRUTINY -> "EVC_PENDING";
            case DEFICIENCY_FLAGGED -> "DEFICIENCY_RESUBMITTED";
            case DEFICIENCY_RESUBMITTED -> "EVC_PENDING";
            case EVC_PENDING -> "EVC_SCHEDULED";
            case EVC_SCHEDULED -> "EVC_COMPLETED";
            case EVC_COMPLETED -> "APPROVED";
            case APPROVED -> "TERMINAL_APPROVED";
            case REJECTED -> "TERMINAL_REJECTED";
        };
    }
}
