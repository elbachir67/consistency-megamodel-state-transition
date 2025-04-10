package org.consistency.megamodel.event;

import lombok.Getter;
import org.consistency.megamodel.model.ComponentState;
import org.springframework.context.ApplicationEvent;

@Getter
public class StateChangeEvent extends ApplicationEvent {
    private final String microserviceId;
    private final String componentId;
    private final ComponentState oldState;
    private final ComponentState newState;
    private final Long version;

    public StateChangeEvent(Object source, String microserviceId, String componentId, 
                          ComponentState oldState, ComponentState newState, Long version) {
        super(source);
        this.microserviceId = microserviceId;
        this.componentId = componentId;
        this.oldState = oldState;
        this.newState = newState;
        this.version = version;
    }
}