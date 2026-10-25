package in.sih.aicte.platform;

import in.sih.aicte.api.ApiPage;
import in.sih.aicte.api.PageQuery;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformController {
    private final PlatformProperties properties;

    public PlatformController(PlatformProperties properties) {
        this.properties = properties;
    }

    public record Status(String name, String environment, boolean synthetic,
                         boolean identityIntegrated, boolean hostConnected, boolean notificationsEnabled) {}

    @GetMapping
    public Status status() {
        return new Status("Approval Coordination", properties.environment(), true, false, false, false);
    }

    public record ModuleStatus(String name, boolean integrated) {}

    @GetMapping("/modules")
    public ApiPage<ModuleStatus> modules(@Valid @ModelAttribute PageQuery page) {
        return ApiPage.from(List.of(new ModuleStatus("identity", false), new ModuleStatus("host", false),
                new ModuleStatus("notifications", false)), page);
    }
}
