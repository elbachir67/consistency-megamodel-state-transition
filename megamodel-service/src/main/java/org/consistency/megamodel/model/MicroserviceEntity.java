package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "microservices")
@Data
public class MicroserviceEntity {
    @Id
    private String id;
    
    private String name;
    private String description;
    
    @OneToMany(mappedBy = "microservice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ComponentModelServiceEntity> componentModels = new HashSet<>();
}