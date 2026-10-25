package in.sih.aicte.calendar;

import in.sih.aicte.api.CorrelationFilter;
import in.sih.aicte.audit.AuditDto;
import in.sih.aicte.audit.AuditService;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.CaseStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/cases/{caseId}/deadline", produces = MediaType.APPLICATION_JSON_VALUE)
public class CalendarController {

    private final ApplicationCaseRepository caseRepository;
    private final RegulatoryCalendarService calendarService;
    private final AuditService auditService;

    public CalendarController(
            ApplicationCaseRepository caseRepository,
            RegulatoryCalendarService calendarService,
            AuditService auditService
    ) {
        this.caseRepository = caseRepository;
        this.calendarService = calendarService;
        this.auditService = auditService;
    }

    @GetMapping
    public CalendarDto.DeadlineDetailResponse getDeadlineInfo(@PathVariable UUID caseId) {
        ApplicationCase appCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));

        CalendarDto.DeadlineAnalysis analysis =
                calendarService.analyzeDeadline(appCase.getDeadlineAt(), Instant.now());

        return new CalendarDto.DeadlineDetailResponse(
                appCase.getId(),
                appCase.getApplicationNumber(),
                appCase.getStatus(),
                appCase.getCurrentStage(),
                analysis.deadlineAt(),
                analysis.deadlineAtIst(),
                analysis.isOverdue(),
                analysis.remainingHours(),
                analysis.remainingBusinessDays(),
                analysis.deadlineStatus(),
                calendarService.getRegulatoryOffsetDays(appCase.getStatus()),
                calendarService.getRegulatoryPolicyNote(appCase.getStatus()),
                null
        );
    }

    @PostMapping("/extend")
    public CalendarDto.DeadlineDetailResponse extendDeadline(
            @PathVariable UUID caseId,
            @Valid @RequestBody CalendarDto.ExtendDeadlineRequest request,
            HttpServletRequest servletRequest
    ) {
        ApplicationCase appCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));

        if (appCase.getStatus() == CaseStatus.APPROVED || appCase.getStatus() == CaseStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Cannot extend deadline on terminal case in status " + appCase.getStatus());
        }

        Instant baseInstant = (appCase.getDeadlineAt() != null) ? appCase.getDeadlineAt() : Instant.now();
        Instant newDeadline = calendarService.calculateDeadline(baseInstant, request.extensionDays());

        appCase.setDeadlineAt(newDeadline);
        appCase.setUpdatedAt(Instant.now());
        ApplicationCase savedCase = caseRepository.save(appCase);

        String correlationId = CorrelationFilter.id(servletRequest);
        AuditDto.AuditEventRecord auditRecord = auditService.recordEvent(
                savedCase.getId(),
                "EXTEND_DEADLINE",
                request.authorityRole(),
                request.authorityId(),
                savedCase.getStatus().name(),
                savedCase.getStatus().name(),
                "Deadline extended by " + request.extensionDays() + " business days. Reason: " + request.reason(),
                correlationId
        );

        CalendarDto.DeadlineAnalysis analysis =
                calendarService.analyzeDeadline(savedCase.getDeadlineAt(), Instant.now());

        return new CalendarDto.DeadlineDetailResponse(
                savedCase.getId(),
                savedCase.getApplicationNumber(),
                savedCase.getStatus(),
                savedCase.getCurrentStage(),
                analysis.deadlineAt(),
                analysis.deadlineAtIst(),
                analysis.isOverdue(),
                analysis.remainingHours(),
                analysis.remainingBusinessDays(),
                analysis.deadlineStatus(),
                calendarService.getRegulatoryOffsetDays(savedCase.getStatus()),
                calendarService.getRegulatoryPolicyNote(savedCase.getStatus()),
                auditRecord.id()
        );
    }
}
