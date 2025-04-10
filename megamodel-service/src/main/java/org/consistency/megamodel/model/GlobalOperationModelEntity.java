package org.consistency.megamodel.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "global_operation_models")
@Data
public class GlobalOperationModelEntity {
    @Id
    private String id;
    private String name;
    private String description;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "gom_id")
    private List<MicroserviceRequirementEntity> microserviceRequirements = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "gom_component_refs")
    private List<GomComponentRef> inputs = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "gom_component_refs")
    private List<GomComponentRef> outputs = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "gom_preconditions")
    private List<String> preconditions = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "gom_postconditions")
    private List<String> postconditions = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "gom_state_transitions")
    private List<StateTransitionRule> stateTransitions = new ArrayList<>();
}