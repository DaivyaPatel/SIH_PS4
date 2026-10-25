package in.sih.aicte.evc;

import in.sih.aicte.cases.Region;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/evc", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExpertController {

    private final ExpertPoolService expertService;

    public ExpertController(ExpertPoolService expertService) {
        this.expertService = expertService;
    }

    @GetMapping("/experts")
    public List<EvcDto.ExpertDetail> listExperts(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) Region region,
            @RequestParam(required = false) Boolean active
    ) {
        return expertService.listExperts(domain, region, active);
    }

    @GetMapping("/experts/{id}")
    public EvcDto.ExpertDetail getExpertById(@PathVariable UUID id) {
        return expertService.getExpertById(id);
    }

    @GetMapping("/cases/{caseId}/eligible-experts")
    public EvcDto.EligibleExpertsResponse getEligibleExperts(
            @PathVariable UUID caseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate,
            @RequestParam(required = false) String requiredDomain
    ) {
        return expertService.findEligibleExpertsForCase(caseId, targetDate, requiredDomain);
    }
}
