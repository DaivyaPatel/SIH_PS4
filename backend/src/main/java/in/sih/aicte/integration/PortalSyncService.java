package in.sih.aicte.integration;

import in.sih.aicte.audit.AuditService;
import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.Campus;
import in.sih.aicte.cases.CaseStatus;
import in.sih.aicte.cases.Institution;
import in.sih.aicte.cases.InstitutionRepository;
import in.sih.aicte.cases.Region;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PortalSyncService {

    private final ApplicationCaseRepository caseRepository;
    private final InstitutionRepository institutionRepository;
    private final IntegrationReceiptRepository receiptRepository;
    private final AuditService auditService;

    public PortalSyncService(
            ApplicationCaseRepository caseRepository,
            InstitutionRepository institutionRepository,
            IntegrationReceiptRepository receiptRepository,
            AuditService auditService
    ) {
        this.caseRepository = caseRepository;
        this.institutionRepository = institutionRepository;
        this.receiptRepository = receiptRepository;
        this.auditService = auditService;
    }

    @Transactional
    public IntegrationDto.PortalSyncReceipt syncFromPortal(
            IntegrationDto.PortalSyncRequest request,
            String correlationId
    ) {
        String effectiveAppId = (request != null && request.externalApplicationId() != null && !request.externalApplicationId().isBlank())
                ? request.externalApplicationId().trim()
                : "APP-2026-ERO-006";

        Optional<ApplicationCase> existing = caseRepository.findByApplicationNumber(effectiveAppId);
        if (existing.isPresent()) {
            ApplicationCase existingCase = existing.get();
            UUID receiptId = UUID.randomUUID();
            IntegrationReceipt receipt = new IntegrationReceipt(
                    receiptId,
                    effectiveAppId,
                    existingCase.getId(),
                    IntegrationDto.SyncOutcome.DUPLICATE_SKIPPED.name(),
                    "Application already present in orchestration system with ID: " + existingCase.getId(),
                    correlationId,
                    Instant.now()
            );
            receiptRepository.save(receipt);

            return new IntegrationDto.PortalSyncReceipt(
                    receiptId,
                    effectiveAppId,
                    existingCase.getId(),
                    existingCase.getApplicationNumber(),
                    IntegrationDto.SyncOutcome.DUPLICATE_SKIPPED,
                    "Duplicate ingestion request ignored; existing case preserved without regression.",
                    correlationId,
                    receipt.getSyncedAt()
            );
        }

        String code = (request != null && request.institutionCode() != null)
                ? request.institutionCode()
                : "1-60789012";
        String name = (request != null && request.institutionName() != null)
                ? request.institutionName()
                : "Kolkata Institute of Technology & Research";
        String type = (request != null && request.institutionType() != null)
                ? request.institutionType()
                : "ENGINEERING_COLLEGE";
        Region region = (request != null && request.region() != null)
                ? request.region()
                : Region.ERO;
        String address = (request != null && request.address() != null)
                ? request.address()
                : "Sector V, Salt Lake, Kolkata, West Bengal 700091";
        String email = (request != null && request.contactEmail() != null)
                ? request.contactEmail()
                : "director@kolkatatech.edu.in";
        int estYear = (request != null && request.establishedYear() != null)
                ? request.establishedYear()
                : 2014;

        Institution institution = institutionRepository.findByCode(code).orElseGet(() -> {
            Institution newInst = new Institution();
            newInst.setId(UUID.randomUUID());
            newInst.setCode(code);
            newInst.setName(name);
            newInst.setInstitutionType(type);
            newInst.setRegion(region);
            newInst.setAddress(address);
            newInst.setEstablishedYear(estYear);
            newInst.setContactEmail(email);

            Campus campus = new Campus();
            campus.setId(UUID.randomUUID());
            campus.setInstitution(newInst);
            campus.setCampusName("Salt Lake Main Campus");
            campus.setAddress(address);
            campus.setLandAreaAcres(new BigDecimal("10.50"));
            campus.setBuiltUpAreaSqM(new BigDecimal("16000.00"));
            campus.setLandLeaseStatus("OWNED");
            newInst.getCampuses().add(campus);

            return institutionRepository.save(newInst);
        });

        ApplicationCase newCase = new ApplicationCase();
        newCase.setId(UUID.randomUUID());
        newCase.setApplicationNumber(effectiveAppId);
        newCase.setInstitution(institution);
        newCase.setAcademicYear((request != null && request.academicYear() != null) ? request.academicYear() : "2026-27");
        newCase.setApplicationType((request != null && request.applicationType() != null) ? request.applicationType() : "EXTENSION_OF_APPROVAL");
        newCase.setStatus(CaseStatus.SUBMITTED);
        newCase.setCurrentStage("INITIAL_SCRUTINY");
        newCase.setReadinessScore(75);
        newCase.setAssignedOfficer("AICTE Regional Ingestion Desk");
        newCase.setDeadlineAt(Instant.now().plus(14, ChronoUnit.DAYS));
        newCase.setSubmittedAt(Instant.now());
        newCase.setUpdatedAt(Instant.now());

        ApplicationCase savedCase = caseRepository.save(newCase);

        auditService.recordEvent(
                savedCase.getId(),
                "APPLICATION_INGESTED_FROM_PORTAL",
                "PORTAL_CONNECTOR",
                "AICTE_NATIONAL_PORTAL",
                "EXTERNAL_PORTAL",
                CaseStatus.SUBMITTED.name(),
                "Synchronized application package from national portal feed.",
                correlationId
        );

        UUID receiptId = UUID.randomUUID();
        IntegrationReceipt receipt = new IntegrationReceipt(
                receiptId,
                effectiveAppId,
                savedCase.getId(),
                IntegrationDto.SyncOutcome.INGESTED.name(),
                "Application successfully ingested into orchestration pipeline.",
                correlationId,
                Instant.now()
        );
        receiptRepository.save(receipt);

        return new IntegrationDto.PortalSyncReceipt(
                receiptId,
                effectiveAppId,
                savedCase.getId(),
                savedCase.getApplicationNumber(),
                IntegrationDto.SyncOutcome.INGESTED,
                "Application successfully synchronized and registered for approval orchestration.",
                correlationId,
                receipt.getSyncedAt()
        );
    }

    @Transactional(readOnly = true)
    public IntegrationDto.IntegrationStatus getStatus() {
        long total = receiptRepository.count();
        long ingested = receiptRepository.countByOutcome(IntegrationDto.SyncOutcome.INGESTED.name());
        Instant lastSync = receiptRepository.findAll().stream()
                .map(IntegrationReceipt::getSyncedAt)
                .max(Instant::compareTo)
                .orElse(null);

        return new IntegrationDto.IntegrationStatus(
                true,
                "AICTE National Approval Portal Connector v26.1",
                total,
                ingested,
                lastSync
        );
    }
}
