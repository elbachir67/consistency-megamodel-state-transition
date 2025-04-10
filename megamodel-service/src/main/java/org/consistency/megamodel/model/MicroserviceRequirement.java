package org.consistency.megamodel.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Embeddable
@Data
public class MicroserviceRequirement {
    private String microserviceId;
    
    @ElementCollection
    @CollectionTable(name = "microservice_component_requirements")
    private List<ComponentRequirement> requiredComponents = new ArrayList<>();
    
    @Embeddable
    @Data
    public static class ComponentRequirement {
        private String componentId;
        private ConsistencyType consistencyType;
    }
}