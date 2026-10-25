package in.sih.aicte.audit;

import in.sih.aicte.cases.ApplicationCaseRepository;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditEventRepository auditRepository;
    private final ApplicationCaseRepository caseRepository;

    public AuditService(AuditEventRepository auditRepository, ApplicationCaseRepository caseRepository) {
        this.auditRepository = auditRepository;
        this.caseRepository = caseRepository;
    }

    @Transactional
    public AuditDto.AuditEventRecord recordEvent(
            UUID caseId,
            String action,
            String actorRole,
            String actorId,
            String previousState,
            String newState,
            String details,
            String correlationId
    ) {
        if (!caseRepository.existsById(caseId)) {
            throw new NoSuchElementException("Application case not found for audit: " + caseId);
        }
        UUID eventId = UUID.randomUUID();
        AuditEvent event = new AuditEvent(
                eventId,
                caseId,
                action,
                actorRole,
                actorId,
                previousState,
                newState,
                details,
                correlationId,
                Instant.now()
        );
        AuditEvent saved = auditRepository.save(event);
        return toRecord(saved);
    }

    @Transactional(readOnly = true)
    public List<AuditDto.AuditEventRecord> getAuditTrailForCase(UUID caseId) {
        if (!caseRepository.existsById(caseId)) {
            throw new NoSuchElementException("Application case not found: " + caseId);
        }
        return auditRepository.findByCaseIdOrderByCreatedAtAsc(caseId).stream()
                .map(this::toRecord)
                .toList();
    }

    private AuditDto.AuditEventRecord toRecord(AuditEvent e) {
        return new AuditDto.AuditEventRecord(
                e.getId(),
                e.getCaseId(),
                e.getAction(),
                e.getActorRole(),
                e.getActorId(),
                e.getPreviousState(),
                e.getNewState(),
                e.getDetails(),
                e.getCorrelationId(),
                e.getCreatedAt()
        );
    }
}
