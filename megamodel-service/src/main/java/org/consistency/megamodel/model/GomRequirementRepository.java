package org.consistency.megamodel.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GomRequirementRepository extends JpaRepository<GomRequirementEntity, Long> {
    List<GomRequirementEntity> findByGomId(String gomId);
    List<GomRequirementEntity> findByMicroserviceId(String microserviceId);
    List<GomRequirementEntity> findByComponentId(String componentId);
    void deleteByGomId(String gomId);
}