package org.consistency.megamodel.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComponentModelServiceRepository extends JpaRepository<ComponentModelServiceEntity, Long> {
    Optional<ComponentModelServiceEntity> findByMicroserviceIdAndComponentModelId(String microserviceId, String componentId);
    List<ComponentModelServiceEntity> findByComponentModelIdAndMicroserviceIdNot(String componentId, String microserviceId);
    List<ComponentModelServiceEntity> findByComponentModelIdAndState(String componentId, ComponentState state);
    List<ComponentModelServiceEntity> findByState(ComponentState state);
}