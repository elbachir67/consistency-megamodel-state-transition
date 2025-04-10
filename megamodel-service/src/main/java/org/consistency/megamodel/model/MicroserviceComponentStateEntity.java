package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "microservice_component_states")
@Data
public class MicroserviceComponentStateEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String microserviceId;
    private String componentId;
    
    @Enumerated(EnumType.STRING)
    private ComponentState state;
    
    @Enumerated(EnumType.STRING)
    private ConsistencyType consistencyType;
    
    private Long version;
    private LocalDateTime timestamp;
}