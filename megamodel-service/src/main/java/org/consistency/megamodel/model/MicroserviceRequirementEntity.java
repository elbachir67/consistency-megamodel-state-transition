package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "microservice_requirements")
@Data
public class MicroserviceRequirementEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String microserviceId;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "requirement_id")
    private List<ComponentRequirementEntity> requiredComponents = new ArrayList<>();
}