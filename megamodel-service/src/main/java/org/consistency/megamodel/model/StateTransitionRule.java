package org.consistency.megamodel.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Embeddable
@Data
public class StateTransitionRule {
    private String sourceServiceId;
    private String componentModelId;
    
    @Enumerated(EnumType.STRING)
    private OperationType operationType;
    
    @Enumerated(EnumType.STRING)
    private ComponentState targetState;
    
    private String conditionExpression;
}