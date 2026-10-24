package in.sih.aicte.platform;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformController {
    public record Status(String name, String environment, boolean synthetic,
                         boolean identityIntegrated, boolean hostConnected, boolean notificationsEnabled) {}

    @GetMapping
    public Status status() {
        return new Status("Approval Coordination", "development", true, false, false, false);
    }
}
