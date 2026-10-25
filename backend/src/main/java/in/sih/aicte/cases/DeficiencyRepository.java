package in.sih.aicte.cases;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeficiencyRepository extends JpaRepository<Deficiency, UUID> {
    List<Deficiency> findByApplicationCaseId(UUID caseId);
    Optional<Deficiency> findByIdAndApplicationCaseId(UUID id, UUID caseId);
}
