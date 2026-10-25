package in.sih.aicte.evc;

import in.sih.aicte.cases.ApplicationCase;
import in.sih.aicte.cases.ApplicationCaseRepository;
import in.sih.aicte.cases.Institution;
import in.sih.aicte.cases.Region;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExpertPoolService {

    private final ExpertRepository expertRepository;
    private final ApplicationCaseRepository caseRepository;

    public ExpertPoolService(
            ExpertRepository expertRepository,
            ApplicationCaseRepository caseRepository
    ) {
        this.expertRepository = expertRepository;
        this.caseRepository = caseRepository;
    }

    public List<EvcDto.ExpertDetail> listExperts(String domain, Region region, Boolean active) {
        List<Expert> experts = expertRepository.findAll();
        return experts.stream()
                .filter(e -> domain == null || domain.isBlank() || e.getDomain().equalsIgnoreCase(domain))
                .filter(e -> region == null || e.getRegion() == region)
                .filter(e -> active == null || e.isActive() == active)
                .map(this::toDetail)
                .toList();
    }

    public EvcDto.ExpertDetail getExpertById(UUID id) {
        Expert expert = expertRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Expert not found with ID: " + id));
        return toDetail(expert);
    }

    public EvcDto.EligibleExpertsResponse findEligibleExpertsForCase(
            UUID caseId,
            LocalDate targetDate,
            String requiredDomain
    ) {
        ApplicationCase appCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new NoSuchElementException("Application case not found: " + caseId));
        Institution inst = appCase.getInstitution();

        List<Expert> activeExperts = expertRepository.findByActiveTrue();
        List<EvcDto.ExpertEligibilityResult> eligible = new ArrayList<>();
        List<EvcDto.ExpertEligibilityResult> ineligible = new ArrayList<>();

        for (Expert expert : activeExperts) {
            if (expert.hasConflictWith(inst.getId(), inst.getCode(), inst.getName())) {
                ineligible.add(new EvcDto.ExpertEligibilityResult(
                        expert.getId(),
                        expert.getName(),
                        expert.getDomain(),
                        expert.getAffiliatedInstitution(),
                        expert.getRegion(),
                        false,
                        "Ineligible: Conflict of interest with " + inst.getName()
                                + " (institutional affiliation or statutory exclusion)."
                ));
            } else if (targetDate != null && !expert.isAvailableOn(targetDate)) {
                ineligible.add(new EvcDto.ExpertEligibilityResult(
                        expert.getId(),
                        expert.getName(),
                        expert.getDomain(),
                        expert.getAffiliatedInstitution(),
                        expert.getRegion(),
                        false,
                        "Ineligible: Expert not available on target date " + targetDate + "."
                ));
            } else if (requiredDomain != null && !requiredDomain.isBlank()
                    && !expert.getDomain().equalsIgnoreCase(requiredDomain)) {
                ineligible.add(new EvcDto.ExpertEligibilityResult(
                        expert.getId(),
                        expert.getName(),
                        expert.getDomain(),
                        expert.getAffiliatedInstitution(),
                        expert.getRegion(),
                        false,
                        "Ineligible: Domain mismatch. Expert domain is " + expert.getDomain()
                                + ", but required is " + requiredDomain + "."
                ));
            } else {
                eligible.add(new EvcDto.ExpertEligibilityResult(
                        expert.getId(),
                        expert.getName(),
                        expert.getDomain(),
                        expert.getAffiliatedInstitution(),
                        expert.getRegion(),
                        true,
                        "Eligible: Available" + (targetDate != null ? " on " + targetDate : "")
                                + " with verified non-conflicted status for " + inst.getName() + "."
                ));
            }
        }

        return new EvcDto.EligibleExpertsResponse(
                appCase.getId(),
                appCase.getApplicationNumber(),
                inst.getName(),
                targetDate != null ? targetDate.toString() : null,
                requiredDomain,
                eligible.size(),
                ineligible.size(),
                eligible,
                ineligible
        );
    }

    private EvcDto.ExpertDetail toDetail(Expert e) {
        return new EvcDto.ExpertDetail(
                e.getId(),
                e.getName(),
                e.getEmail(),
                e.getDesignation(),
                e.getDomain(),
                e.getAffiliatedInstitution(),
                e.getRegion(),
                e.getConflictInstitutions(),
                e.getAvailableDateList(),
                e.getMaxAssignments(),
                e.isActive()
        );
    }
}
