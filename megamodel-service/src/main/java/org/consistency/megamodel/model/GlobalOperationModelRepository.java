package org.consistency.megamodel.model;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalOperationModelRepository extends JpaRepository<GlobalOperationModelEntity, String> {
}