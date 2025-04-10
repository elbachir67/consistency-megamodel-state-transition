package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "gom_requirements")
@Data
public class GomRequirementEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "gom_id")
    private GlobalOperationModelEntity gom;
    
    @ManyToOne
    @JoinColumn(name = "microservice_id")
    private MicroserviceEntity microservice;
    
    @ManyToOne
    @JoinColumn(name = "component_id")
    private ComponentModelEntity component;
    
    @Enumerated(EnumType.STRING)
    private ConsistencyType consistencyType;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}