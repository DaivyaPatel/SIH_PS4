package in.sih.aicte.cases;

import in.sih.aicte.api.CorrelationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/cases/{caseId}/deficiencies", produces = MediaType.APPLICATION_JSON_VALUE)
public class DeficiencyController {

    private final DeficiencyService deficiencyService;

    public DeficiencyController(DeficiencyService deficiencyService) {
        this.deficiencyService = deficiencyService;
    }

    @PostMapping
    public DeficiencyDto.DeficiencyOperationResponse flagDeficiency(
            @PathVariable UUID caseId,
            @Valid @RequestBody DeficiencyDto.FlagDeficiencyRequest request,
            HttpServletRequest servletRequest
    ) {
        String correlationId = CorrelationFilter.id(servletRequest);
        return deficiencyService.flagDeficiency(caseId, request, correlationId);
    }

    @PostMapping("/{defId}/respond")
    public DeficiencyDto.DeficiencyOperationResponse respondToDeficiency(
            @PathVariable UUID caseId,
            @PathVariable UUID defId,
            @Valid @RequestBody DeficiencyDto.RespondDeficiencyRequest request,
            HttpServletRequest servletRequest
    ) {
        String correlationId = CorrelationFilter.id(servletRequest);
        return deficiencyService.respondToDeficiency(caseId, defId, request, correlationId);
    }

    @PostMapping("/{defId}/resolve")
    public DeficiencyDto.DeficiencyOperationResponse resolveDeficiency(
            @PathVariable UUID caseId,
            @PathVariable UUID defId,
            @Valid @RequestBody DeficiencyDto.ResolveDeficiencyRequest request,
            HttpServletRequest servletRequest
    ) {
        String correlationId = CorrelationFilter.id(servletRequest);
        return deficiencyService.resolveDeficiency(caseId, defId, request, correlationId);
    }
}
