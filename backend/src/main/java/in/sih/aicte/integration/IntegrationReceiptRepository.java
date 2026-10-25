package in.sih.aicte.integration;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IntegrationReceiptRepository extends JpaRepository<IntegrationReceipt, UUID> {
    Optional<IntegrationReceipt> findFirstByExternalSourceIdOrderBySyncedAtDesc(String externalSourceId);
    long countByOutcome(String outcome);
}
