package in.sih.aicte.proof;

import org.flowable.dmn.engine.DmnEngine;
import org.flowable.engine.RepositoryService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class ProofResources {
    @Bean
    ApplicationRunner deploySyntheticResources(RepositoryService repository, DmnEngine decisions) {
        return args -> {
            repository.createDeployment().name("synthetic-stack-proof")
                    .enableDuplicateFiltering()
                    .addClasspathResource("processes/synthetic-review.bpmn20.xml").deploy();
            decisions.getDmnRepositoryService().createDeployment().name("synthetic-route-proof")
                    .addClasspathResource("decisions/synthetic-route.dmn").deploy();
        };
    }
}
