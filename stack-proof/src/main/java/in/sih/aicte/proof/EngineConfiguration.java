package in.sih.aicte.proof;

import javax.sql.DataSource;
import org.flowable.dmn.api.DmnDecisionService;
import org.flowable.dmn.engine.DmnEngine;
import org.flowable.dmn.spring.SpringDmnEngineConfiguration;
import org.flowable.engine.ManagementService;
import org.flowable.engine.ProcessEngine;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.spring.SpringProcessEngineConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

/** Both engines join the application's Spring transaction and PostgreSQL datasource. */
@Configuration(proxyBeanMethods = false)
public class EngineConfiguration {
    @Bean
    SpringProcessEngineConfiguration processConfiguration(DataSource dataSource,
            PlatformTransactionManager transactionManager) {
        var configuration = new SpringProcessEngineConfiguration();
        configuration.setDataSource(dataSource);
        configuration.setTransactionManager(transactionManager);
        configuration.setDatabaseSchemaUpdate("true");
        configuration.setAsyncExecutorActivate(false);
        return configuration;
    }

    @Bean(destroyMethod = "close")
    ProcessEngine processEngine(SpringProcessEngineConfiguration configuration) {
        return configuration.buildProcessEngine();
    }

    @Bean
    SpringDmnEngineConfiguration decisionConfiguration(DataSource dataSource,
            PlatformTransactionManager transactionManager) {
        var configuration = new SpringDmnEngineConfiguration();
        configuration.setDataSource(dataSource);
        configuration.setTransactionManager(transactionManager);
        configuration.setDatabaseSchemaUpdate("true");
        return configuration;
    }

    @Bean(destroyMethod = "close")
    DmnEngine dmnEngine(SpringDmnEngineConfiguration configuration) {
        return configuration.buildDmnEngine();
    }

    @Bean
    RuntimeService runtimeService(ProcessEngine engine) {
        return engine.getRuntimeService();
    }

    @Bean
    TaskService taskService(ProcessEngine engine) {
        return engine.getTaskService();
    }

    @Bean
    RepositoryService repositoryService(ProcessEngine engine) {
        return engine.getRepositoryService();
    }

    @Bean
    ManagementService managementService(ProcessEngine engine) {
        return engine.getManagementService();
    }

    @Bean
    DmnDecisionService decisionService(DmnEngine engine) {
        return engine.getDmnDecisionService();
    }
}
