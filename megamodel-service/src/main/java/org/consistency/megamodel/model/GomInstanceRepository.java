package org.consistency.megamodel.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GomInstanceRepository extends JpaRepository<GomInstanceEntity, String> {
    List<GomInstanceEntity> findByGomId(String gomId);
}