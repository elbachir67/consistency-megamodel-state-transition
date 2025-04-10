package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "component_models")
@Data
public class ComponentModelEntity {
    @Id
    private String id;
    
    private String name;
    private String metamodel;
    private String description;
    
    @OneToMany(mappedBy = "componentModel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ComponentModelServiceEntity> serviceStates = new HashSet<>();
}