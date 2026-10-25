package in.sih.aicte.platform;

import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("app")
public record PlatformProperties(@Pattern(regexp = "development") String environment) {}
