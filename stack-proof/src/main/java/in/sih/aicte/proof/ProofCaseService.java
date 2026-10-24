package in.sih.aicte.proof;

import java.util.UUID;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Synthetic proof tables only; not the application's regulatory domain model. */
@Service
public class ProofCaseService {
    private final JdbcTemplate jdbc;
    private final RuntimeService runtime;
    private final TaskService tasks;

    public ProofCaseService(JdbcTemplate jdbc, RuntimeService runtime, TaskService tasks) {
        this.jdbc = jdbc;
        this.runtime = runtime;
        this.tasks = tasks;
    }

    @Transactional
    public String start(String caseId, boolean failAfterWrites) {
        String processId = runtime.startProcessInstanceByKey("syntheticReview", caseId).getId();
        jdbc.update("insert into proof_case(id, process_id, state) values (?, ?, 'REVIEW_PENDING')", caseId, processId);
        appendIntent(caseId, "REVIEW_CREATED");
        if (failAfterWrites) {
            throw new IllegalStateException("Injected failure after engine, case, audit and outbox writes");
        }
        return processId;
    }

    @Transactional
    public void completeReview(String caseId, boolean failAfterWrites) {
        String processId = jdbc.queryForObject("select process_id from proof_case where id = ?", String.class, caseId);
        var task = tasks.createTaskQuery().processInstanceId(processId).singleResult();
        if (task == null) {
            throw new IllegalStateException("No current proof review task");
        }
        tasks.complete(task.getId());
        jdbc.update("update proof_case set state = 'WAITING_TIMER' where id = ?", caseId);
        appendIntent(caseId, "REVIEW_RECORDED");
        if (failAfterWrites) {
            throw new IllegalStateException("Injected failure after task completion and timer creation");
        }
    }

    private void appendIntent(String caseId, String kind) {
        String eventId = UUID.randomUUID().toString();
        jdbc.update("insert into proof_audit(id, case_id, kind) values (?, ?, ?)", eventId, caseId, kind);
        jdbc.update("insert into proof_outbox(id, case_id, kind) values (?, ?, ?)", eventId, caseId, kind);
    }
}
