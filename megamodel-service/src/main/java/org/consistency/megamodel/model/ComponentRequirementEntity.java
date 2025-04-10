package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "component_requirements")
@Data
public class ComponentRequirementEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String componentId;
    
    @Enumerated(EnumType.STRING)
    private ConsistencyType consistencyType;
}