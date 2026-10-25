package in.sih.aicte.cases;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentMetadataRepository extends JpaRepository<DocumentMetadata, UUID> {
    List<DocumentMetadata> findByApplicationCaseId(UUID caseId);
}
