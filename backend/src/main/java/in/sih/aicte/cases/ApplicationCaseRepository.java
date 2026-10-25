package in.sih.aicte.cases;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationCaseRepository extends JpaRepository<ApplicationCase, UUID> {

    @Query("SELECT c FROM ApplicationCase c JOIN FETCH c.institution ORDER BY c.submittedAt DESC")
    List<ApplicationCase> findAllWithInstitution();

    @Query("SELECT c FROM ApplicationCase c JOIN FETCH c.institution WHERE c.status = :status ORDER BY c.submittedAt DESC")
    List<ApplicationCase> findByStatusWithInstitution(@Param("status") CaseStatus status);

    @Query("SELECT c FROM ApplicationCase c JOIN FETCH c.institution WHERE c.institution.region = :region ORDER BY c.submittedAt DESC")
    List<ApplicationCase> findByRegionWithInstitution(@Param("region") Region region);

    Optional<ApplicationCase> findByApplicationNumber(String applicationNumber);
}
