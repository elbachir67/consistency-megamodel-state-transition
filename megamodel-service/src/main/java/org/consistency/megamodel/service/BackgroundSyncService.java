package org.consistency.megamodel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.consistency.megamodel.model.ComponentModelServiceEntity;
import org.consistency.megamodel.model.ComponentState;
import org.consistency.megamodel.model.ComponentModelServiceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BackgroundSyncService {
    private final ComponentModelServiceRepository componentModelServiceRepo;
    private final StateTransitionService stateTransitionService;
    
    @Scheduled(fixedRate = 10000) // Execute every 10 seconds
    @Transactional
    public void synchronizeSharedMinusComponents() {
        log.debug("Starting background synchronization of SHARED_MINUS components");
        
        List<ComponentModelServiceEntity> sharedMinusComponents = 
            componentModelServiceRepo.findByState(ComponentState.SHARED_MINUS);
        
        for (ComponentModelServiceEntity entity : sharedMinusComponents) {
            try {
                synchronizeComponent(entity);
            } catch (Exception e) {
                log.error("Error synchronizing component: {}", entity.getId(), e);
            }
        }
    }
    
    @Scheduled(fixedRate = 30000) // Execute every 30 seconds
    @Transactional
    public void checkStalenessBounds() {
        log.debug("Checking staleness bounds for components");
        
        List<ComponentModelServiceEntity> components = componentModelServiceRepo.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        for (ComponentModelServiceEntity entity : components) {
            if (entity.getStalenessBound() != null && now.isAfter(entity.getStalenessBound())) {
                log.debug("Component {} has exceeded staleness bound, marking as INVALID", entity.getId());
                entity.setState(ComponentState.INVALID);
                componentModelServiceRepo.save(entity);
            }
        }
    }
    
    private void synchronizeComponent(ComponentModelServiceEntity entity) {
        ComponentModelServiceEntity authoritativeSource = 
            stateTransitionService.findAuthoritativeSource(entity.getComponentModel().getId());
        
        if (authoritativeSource != null && authoritativeSource.getVersion() > entity.getVersion()) {
            log.debug("Updating component {} from version {} to {}", 
                entity.getId(), entity.getVersion(), authoritativeSource.getVersion());
            
            entity.setVersion(authoritativeSource.getVersion());
            entity.setState(ComponentState.SHARED_PLUS);
            entity.setTimestamp(LocalDateTime.now());
            componentModelServiceRepo.save(entity);
        }
    }
}