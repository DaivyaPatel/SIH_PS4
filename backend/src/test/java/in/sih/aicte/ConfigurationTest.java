package in.sih.aicte;

import static org.assertj.core.api.Assertions.assertThat;

import in.sih.aicte.platform.PlatformProperties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

class ConfigurationTest {
    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(PlatformProperties.class)
    static class PropertiesOnly {}

    @Test
    void unsupportedEnvironmentFailsClosed() {
        new ApplicationContextRunner().withUserConfiguration(PropertiesOnly.class)
                .withPropertyValues("app.environment=production")
                .run(context -> assertThat(context).hasFailed());
    }
}
