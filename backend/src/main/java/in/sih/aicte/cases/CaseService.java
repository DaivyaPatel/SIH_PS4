package in.sih.aicte.cases;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CaseService {

    private final ApplicationCaseRepository caseRepository;

    public CaseService(ApplicationCaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    public List<CaseDto.CaseSummary> listCases(CaseStatus statusFilter, Region regionFilter) {
        List<ApplicationCase> cases;
        if (statusFilter != null) {
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
                c.getUpdatedAt()
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
                instDetail,
                defs,
                docs
        );
    }
}
