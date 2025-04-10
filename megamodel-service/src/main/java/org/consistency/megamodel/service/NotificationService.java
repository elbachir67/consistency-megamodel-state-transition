package org.consistency.megamodel.service;

import lombok.extern.slf4j.Slf4j;
import org.consistency.megamodel.event.StateChangeEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationService {
    
    @EventListener
    public void handleStateChange(StateChangeEvent event) {
        log.info("State change detected for component {} in microservice {}: {} -> {} (version {})",
            event.getComponentId(),
            event.getMicroserviceId(),
            event.getOldState(),
            event.getNewState(),
            event.getVersion());
            
        // Here you could implement additional notification channels:
        // - WebSocket notifications to UI clients
        // - Email notifications for critical state changes
        // - Integration with monitoring systems
    }
}