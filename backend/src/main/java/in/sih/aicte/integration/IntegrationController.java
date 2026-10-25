package in.sih.aicte.integration;

import in.sih.aicte.api.CorrelationFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/integration", produces = MediaType.APPLICATION_JSON_VALUE)
public class IntegrationController {

    private final PortalSyncService syncService;

    public IntegrationController(PortalSyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/sync-portal")
    public IntegrationDto.PortalSyncReceipt syncPortal(
            @RequestBody(required = false) IntegrationDto.PortalSyncRequest request,
            HttpServletRequest servletRequest
    ) {
        String correlationId = CorrelationFilter.id(servletRequest);
        return syncService.syncFromPortal(request, correlationId);
    }

    @GetMapping("/status")
    public IntegrationDto.IntegrationStatus getStatus() {
        return syncService.getStatus();
    }
}
