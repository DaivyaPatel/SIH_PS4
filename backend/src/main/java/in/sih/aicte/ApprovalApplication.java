package in.sih.aicte;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ApprovalApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApprovalApplication.class, args);
    }
}
