package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gom_instances")
@Data
public class GomInstanceEntity {
    @Id
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "gom_id")
    private GlobalOperationModelEntity gom;
    
    private String name;
    
    @Enumerated(EnumType.STRING)
    private GomInstanceStatus status;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "instance_id")
    private List<MicroserviceComponentStateEntity> microserviceStates = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}