package org.consistency.megamodel.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class GomComponentRef {
    private String componentModelId;
    private String microserviceId;
    private ComponentState requiredState;
}