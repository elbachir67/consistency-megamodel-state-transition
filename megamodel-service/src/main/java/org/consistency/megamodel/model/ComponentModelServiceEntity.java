package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "component_model_services")
@Data
public class ComponentModelServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "component_model_id")
    private ComponentModelEntity componentModel;
    
    @ManyToOne
    @JoinColumn(name = "microservice_id")
    private MicroserviceEntity microservice;
    
    @Enumerated(EnumType.STRING)
    private ComponentState state;
    
    @Enumerated(EnumType.STRING)
    private ConsistencyType consistencyType;
    
    private Long version;
    private LocalDateTime timestamp;
    private LocalDateTime stalenessBound;
    private String conflictResolution;
    private String invalidationStrategy;
}