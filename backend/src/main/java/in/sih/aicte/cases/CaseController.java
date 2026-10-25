package in.sih.aicte.cases;

import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/cases", produces = MediaType.APPLICATION_JSON_VALUE)
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping
    public List<CaseDto.CaseSummary> list(
            @RequestParam(required = false) CaseStatus status,
            @RequestParam(required = false) Region region) {
        return caseService.listCases(status, region);
    }

    @GetMapping("/{id}")
    public CaseDto.CaseDetail getById(@PathVariable UUID id) {
        return caseService.getCaseById(id);
    }

    @GetMapping("/by-number/{applicationNumber}")
    public CaseDto.CaseDetail getByNumber(@PathVariable String applicationNumber) {
        return caseService.getCaseByApplicationNumber(applicationNumber);
    }
}
