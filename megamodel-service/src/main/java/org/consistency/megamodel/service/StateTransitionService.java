package org.consistency.megamodel.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.consistency.megamodel.event.StateChangeEvent;
import org.consistency.megamodel.model.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StateTransitionService {
    private final ComponentModelServiceRepository componentModelServiceRepo;
    private final MicroserviceRepository microserviceRepo;
    private final ComponentModelRepository componentModelRepo;
    private final ApplicationEventPublisher eventPublisher;
    private final MetricsService metricsService;
    
    @Transactional
    public void handleWriteOperation(String microserviceId, String componentId) {
        ComponentModelServiceEntity entity = getOrCreateComponentModelService(microserviceId, componentId);
        ComponentState oldState = entity.getState();
        
        // Writing service always transitions to MODIFIED state
        transitionToModified(entity);
        
        // Find all other services that have this component
        List<ComponentModelServiceEntity> otherServices = componentModelServiceRepo
            .findByComponentModelIdAndMicroserviceIdNot(componentId, microserviceId);
        
        // Apply state transitions based on consistency requirements
        for (ComponentModelServiceEntity otherService : otherServices) {
            applyConsistencyBasedTransition(otherService, entity);
        }
    }
    
    private void transitionToModified(ComponentModelServiceEntity entity) {
        ComponentState oldState = entity.getState();
        entity.setState(ComponentState.MODIFIED);
        entity.setVersion(entity.getVersion() + 1);
        entity.setTimestamp(LocalDateTime.now());
        componentModelServiceRepo.save(entity);
        publishStateChange(entity, oldState);
    }
    
    private void applyConsistencyBasedTransition(ComponentModelServiceEntity service, ComponentModelServiceEntity modifiedEntity) {
        ComponentState oldState = service.getState();
        ComponentState newState = determineNewState(service.getConsistencyType(), service.getState());
        
        if (oldState != newState) {
            service.setState(newState);
            service.setTimestamp(LocalDateTime.now());
            
            if (service.getConsistencyType() == ConsistencyType.BOUNDED_STALENESS) {
                service.setStalenessBound(LocalDateTime.now().plusSeconds(30)); // Configurable staleness bound
            }
            
            componentModelServiceRepo.save(service);
            publishStateChange(service, oldState);
        }
    }
    
    private ComponentState determineNewState(ConsistencyType consistencyType, ComponentState currentState) {
        switch (consistencyType) {
            case STRONG:
                return ComponentState.INVALID;
                
            case EVENTUAL:
            case BOUNDED_STALENESS:
            case READ_MY_WRITES:
                if (currentState == ComponentState.SHARED_PLUS) {
                    return ComponentState.SHARED_MINUS;
                }
                return currentState;
                
            case MONOTONIC_READS:
                return currentState; // State remains unchanged for monotonic reads
                
            default:
                return currentState;
        }
    }
    
    @Transactional
    public void handleReadOperation(String microserviceId, String componentId) {
        ComponentModelServiceEntity entity = getOrCreateComponentModelService(microserviceId, componentId);
        ComponentState oldState = entity.getState();
        
        switch (entity.getState()) {
            case INVALID:
                handleInvalidState(entity);
                break;
                
            case SHARED_MINUS:
                handleSharedMinusState(entity);
                break;
                
            case MODIFIED:
            case SHARED_PLUS:
                // No state change needed
                break;
        }
    }
    
    private void handleInvalidState(ComponentModelServiceEntity entity) {
        ComponentModelServiceEntity authoritativeSource = findAuthoritativeSource(entity.getComponentModel().getId());
        if (authoritativeSource != null) {
            ComponentState newState = determineReadState(entity.getConsistencyType());
            updateFromAuthoritativeSource(entity, authoritativeSource, newState);
        }
    }
    
    private void handleSharedMinusState(ComponentModelServiceEntity entity) {
        if (entity.getConsistencyType() == ConsistencyType.BOUNDED_STALENESS && 
            entity.getStalenessBound() != null && 
            LocalDateTime.now().isAfter(entity.getStalenessBound())) {
            
            ComponentState oldState = entity.getState();
            entity.setState(ComponentState.INVALID);
            componentModelServiceRepo.save(entity);
            publishStateChange(entity, oldState);
            handleInvalidState(entity);
        }
    }
    
    private ComponentState determineReadState(ConsistencyType consistencyType) {
        switch (consistencyType) {
            case STRONG:
                return ComponentState.SHARED_PLUS;
            case EVENTUAL:
            case BOUNDED_STALENESS:
            case READ_MY_WRITES:
            case MONOTONIC_READS:
                return ComponentState.SHARED_MINUS;
            default:
                return ComponentState.SHARED_MINUS;
        }
    }
    
    private void updateFromAuthoritativeSource(
        ComponentModelServiceEntity entity,
        ComponentModelServiceEntity authSource,
        ComponentState newState
    ) {
        ComponentState oldState = entity.getState();
        entity.setState(newState);
        entity.setVersion(authSource.getVersion());
        entity.setTimestamp(LocalDateTime.now());
        
        if (entity.getConsistencyType() == ConsistencyType.BOUNDED_STALENESS) {
            entity.setStalenessBound(LocalDateTime.now().plusSeconds(30));
        }
        
        componentModelServiceRepo.save(entity);
        publishStateChange(entity, oldState);
    }
    
    public ComponentModelServiceEntity findAuthoritativeSource(String componentId) {
        // First try to find a MODIFIED version
        Optional<ComponentModelServiceEntity> modified = componentModelServiceRepo
            .findByComponentModelIdAndState(componentId, ComponentState.MODIFIED)
            .stream()
            .max(Comparator.comparing(ComponentModelServiceEntity::getVersion));
        
        if (modified.isPresent()) {
            return modified.get();
        }
        
        // If no MODIFIED version exists, look for SHARED_PLUS
        return componentModelServiceRepo
            .findByComponentModelIdAndState(componentId, ComponentState.SHARED_PLUS)
            .stream()
            .max(Comparator.comparing(ComponentModelServiceEntity::getVersion))
            .orElse(null);
    }
    
    private void publishStateChange(ComponentModelServiceEntity entity, ComponentState oldState) {
        if (oldState != entity.getState()) {
            log.debug("Publishing state change event: {} -> {} for component {} in microservice {}",
                oldState,
                entity.getState(),
                entity.getComponentModel().getId(),
                entity.getMicroservice().getId());
                
            eventPublisher.publishEvent(new StateChangeEvent(
                this,
                entity.getMicroservice().getId(),
                entity.getComponentModel().getId(),
                oldState,
                entity.getState(),
                entity.getVersion()
            ));

            // Record the transition in metrics
            metricsService.recordStateTransition(
                entity.getComponentModel().getId(),
                entity.getMicroservice().getId(),
                oldState,
                entity.getState()
            );
        }
    }

    public ComponentModelServiceEntity getComponentState(String microserviceId, String componentId) {
        return componentModelServiceRepo
            .findByMicroserviceIdAndComponentModelId(microserviceId, componentId)
            .orElse(null);
    }
    
    private ComponentModelServiceEntity getOrCreateComponentModelService(String microserviceId, String componentId) {
        return componentModelServiceRepo
            .findByMicroserviceIdAndComponentModelId(microserviceId, componentId)
            .orElseGet(() -> {
                MicroserviceEntity microservice = microserviceRepo.findById(microserviceId)
                    .orElseThrow(() -> new EntityNotFoundException("Microservice not found"));
                ComponentModelEntity componentModel = componentModelRepo.findById(componentId)
                    .orElseThrow(() -> new EntityNotFoundException("Component model not found"));
                
                ComponentModelServiceEntity newEntity = new ComponentModelServiceEntity();
                newEntity.setMicroservice(microservice);
                newEntity.setComponentModel(componentModel);
                newEntity.setState(ComponentState.INVALID);
                newEntity.setVersion(0L);
                newEntity.setTimestamp(LocalDateTime.now());
                newEntity.setConsistencyType(ConsistencyType.EVENTUAL);
                
                return componentModelServiceRepo.save(newEntity);
            });
    }
}