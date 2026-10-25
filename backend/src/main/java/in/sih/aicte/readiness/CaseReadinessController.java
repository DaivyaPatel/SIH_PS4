package in.sih.aicte.readiness;

import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/cases/{id}/readiness", produces = MediaType.APPLICATION_JSON_VALUE)
public class CaseReadinessController {

    private final CaseReadinessService readinessService;

    public CaseReadinessController(CaseReadinessService readinessService) {
        this.readinessService = readinessService;
    }

    @GetMapping
    public ReadinessDto.CaseReadinessResponse getReadiness(@PathVariable UUID id) {
        return readinessService.evaluateReadiness(id);
    }
}
