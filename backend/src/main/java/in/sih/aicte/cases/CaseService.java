package in.sih.aicte.cases;

import in.sih.aicte.calendar.CalendarDto;
import in.sih.aicte.calendar.RegulatoryCalendarService;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CaseService {

    private final ApplicationCaseRepository caseRepository;
    private final RegulatoryCalendarService calendarService;

    public CaseService(
            ApplicationCaseRepository caseRepository,
            RegulatoryCalendarService calendarService
    ) {
        this.caseRepository = caseRepository;
        this.calendarService = calendarService;
    }

    public List<CaseDto.CaseSummary> listCases(CaseStatus statusFilter, Region regionFilter) {
        List<ApplicationCase> cases;
        if (statusFilter != null && regionFilter != null) {
            cases = caseRepository.findByStatusWithInstitution(statusFilter).stream()
                    .filter(c -> c.getInstitution() != null && c.getInstitution().getRegion() == regionFilter)
                    .toList();
        } else if (statusFilter != null) {
            cases = caseRepository.findByStatusWithInstitution(statusFilter);
        } else if (regionFilter != null) {
            cases = caseRepository.findByRegionWithInstitution(regionFilter);
        } else {
            cases = caseRepository.findAllWithInstitution();
        }
        return cases.stream().map(this::toSummaryDto).toList();
    }

    public CaseDto.CaseDetail getCaseById(UUID id) {
        ApplicationCase appCase = caseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Application case not found with ID: " + id));
        return toDetailDto(appCase);
    }

    public CaseDto.CaseDetail getCaseByApplicationNumber(String applicationNumber) {
        ApplicationCase appCase = caseRepository.findByApplicationNumber(applicationNumber)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + applicationNumber));
        return toDetailDto(appCase);
    }

    public CaseDto.CaseSummary toSummaryDto(ApplicationCase c) {
        Institution inst = c.getInstitution();
        CalendarDto.DeadlineAnalysis deadline = calendarService.analyzeDeadline(c.getDeadlineAt(), Instant.now());
        return new CaseDto.CaseSummary(
                c.getId(),
                c.getApplicationNumber(),
                inst.getCode(),
                inst.getName(),
                inst.getInstitutionType(),
                inst.getRegion(),
                c.getAcademicYear(),
                c.getApplicationType(),
                c.getStatus(),
                c.getCurrentStage(),
                c.getReadinessScore(),
                c.getAssignedOfficer(),
                c.getDeadlineAt(),
                c.getSubmittedAt(),
                c.getUpdatedAt(),
                deadline.isOverdue(),
                deadline.remainingHours(),
                deadline.remainingBusinessDays(),
                deadline.deadlineStatus(),
                deadline.deadlineAtIst()
        );
    }

    public CaseDto.CaseDetail toDetailDto(ApplicationCase c) {
        Institution inst = c.getInstitution();
        List<CaseDto.CampusSummary> campuses = inst.getCampuses().stream()
                .map(camp -> new CaseDto.CampusSummary(
                        camp.getId(),
                        camp.getCampusName(),
                        camp.getAddress(),
                        camp.getLandAreaAcres(),
                        camp.getBuiltUpAreaSqM(),
                        camp.getLandLeaseStatus(),
                        camp.getLeaseExpiryDate()))
                .toList();

        CaseDto.InstitutionDetail instDetail = new CaseDto.InstitutionDetail(
                inst.getId(),
                inst.getCode(),
                inst.getName(),
                inst.getInstitutionType(),
                inst.getRegion(),
                inst.getAddress(),
                inst.getEstablishedYear(),
                inst.getContactEmail(),
                campuses
        );

        List<CaseDto.DeficiencyDetail> defs = c.getDeficiencies().stream()
                .map(d -> new CaseDto.DeficiencyDetail(
                        d.getId(),
                        d.getCategory(),
                        d.getDescription(),
                        d.getStatus(),
                        d.getDeadlineDays(),
                        d.getFlaggedAt(),
                        d.getResolvedAt(),
                        d.getResolutionComment(),
                        d.getProofDocumentName(),
                        d.getProofDocumentUrl()))
                .toList();

        List<CaseDto.DocumentDetail> docs = c.getDocuments().stream()
                .map(doc -> new CaseDto.DocumentDetail(
                        doc.getId(),
                        doc.getDocumentType(),
                        doc.getDocumentName(),
                        doc.getFileHash(),
                        doc.getVerificationStatus(),
                        doc.getValidUntil(),
                        doc.getUploadedAt()))
                .toList();

        CalendarDto.DeadlineAnalysis deadline = calendarService.analyzeDeadline(c.getDeadlineAt(), Instant.now());
        return new CaseDto.CaseDetail(
                c.getId(),
                c.getApplicationNumber(),
                c.getAcademicYear(),
                c.getApplicationType(),
                c.getStatus(),
                c.getCurrentStage(),
                c.getReadinessScore(),
                c.getAssignedOfficer(),
                c.getDeadlineAt(),
                c.getSubmittedAt(),
                c.getUpdatedAt(),
                deadline.isOverdue(),
                deadline.remainingHours(),
                deadline.remainingBusinessDays(),
                deadline.deadlineStatus(),
                deadline.deadlineAtIst(),
                instDetail,
                defs,
                docs
        );
    }
}
