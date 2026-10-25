package in.sih.aicte.evc;

import in.sih.aicte.cases.Region;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpertRepository extends JpaRepository<Expert, UUID> {
    List<Expert> findByActiveTrue();
    List<Expert> findByDomainAndActiveTrue(String domain);
    List<Expert> findByRegionAndActiveTrue(Region region);
    List<Expert> findByDomainAndRegionAndActiveTrue(String domain, Region region);
}
