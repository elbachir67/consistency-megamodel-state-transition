package org.consistency.megamodel.service;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.consistency.megamodel.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GlobalOperationModelService {
    private final GlobalOperationModelRepository gomRepository;
    private final StateTransitionService stateTransitionService;
    private final GomInstanceService gomInstanceService;
    
    @Transactional
    public GlobalOperationModelEntity createGom(GlobalOperationModelEntity gom) {
        if (gom.getId() == null) {
            gom.setId(UUID.randomUUID().toString());
        }
        log.info("Creating new GOM: {}", gom.getName());
        return gomRepository.save(gom);
    }
    
    @Transactional
    public void executeGom(String gomId, Map<String, Object> inputs) {
        GlobalOperationModelEntity gom = gomRepository.findById(gomId)
            .orElseThrow(() -> new EntityNotFoundException("GOM not found: " + gomId));
        
        log.info("Starting execution of GOM: {} (ID: {})", gom.getName(), gomId);
        
        // Create a new instance for this execution
        GomInstanceEntity instance = gomInstanceService.createInstance(gomId, "Execution-" + UUID.randomUUID());
        log.info("Created new instance: {} for GOM: {}", instance.getId(), gom.getName());
        
        try {
            // Validate microservice requirements
            validateMicroserviceRequirements(gom);
            log.info("Validated microservice requirements for GOM: {}", gom.getName());
            
            // Execute operations and let state transitions happen automatically
            for (MicroserviceRequirementEntity requirement : gom.getMicroserviceRequirements()) {
                for (ComponentRequirementEntity componentReq : requirement.getRequiredComponents()) {
                    executeComponentOperation(requirement.getMicroserviceId(), componentReq, instance);
                }
            }
            
            instance.setStatus(GomInstanceStatus.COMPLETED);
            log.info("GOM execution completed successfully: {}", gom.getName());
            
        } catch (Exception e) {
            instance.setStatus(GomInstanceStatus.FAILED);
            log.error("GOM execution failed: {} - {}", gom.getName(), e.getMessage(), e);
            throw e;
        } finally {
            gomInstanceService.updateInstance(instance);
        }
    }
    
    private void validateMicroserviceRequirements(GlobalOperationModelEntity gom) {
        for (MicroserviceRequirementEntity requirement : gom.getMicroserviceRequirements()) {
            log.debug("Validating requirements for microservice: {}", requirement.getMicroserviceId());
            
            for (ComponentRequirementEntity componentReq : requirement.getRequiredComponents()) {
                validateComponentRequirement(requirement.getMicroserviceId(), componentReq);
            }
        }
    }
    
    private void validateComponentRequirement(String microserviceId, ComponentRequirementEntity requirement) {
        log.debug("Validating component {} for microservice {} with consistency type {}",
            requirement.getComponentId(),
            microserviceId,
            requirement.getConsistencyType());
            
        ComponentModelServiceEntity componentState = stateTransitionService
            .getComponentState(microserviceId, requirement.getComponentId());
            
        if (componentState == null) {
            String error = String.format("Microservice %s does not have access to component %s",
                microserviceId, requirement.getComponentId());
            log.error(error);
            throw new IllegalStateException(error);
        }
        
        if (componentState.getConsistencyType() != requirement.getConsistencyType()) {
            String error = String.format("Component %s requires %s consistency but has %s",
                requirement.getComponentId(),
                requirement.getConsistencyType(),
                componentState.getConsistencyType());
            log.error(error);
            throw new IllegalStateException(error);
        }
    }
    
    private void executeComponentOperation(
        String microserviceId,
        ComponentRequirementEntity requirement,
        GomInstanceEntity instance
    ) {
        try {
            log.debug("Executing operation for component {} in microservice {}",
                requirement.getComponentId(),
                microserviceId);
            
            // Determine operation type based on consistency requirements
            boolean isWrite = requirement.getConsistencyType() == ConsistencyType.STRONG ||
                            requirement.getConsistencyType() == ConsistencyType.READ_MY_WRITES;
            
            if (isWrite) {
                stateTransitionService.handleWriteOperation(
                    microserviceId,
                    requirement.getComponentId()
                );
            } else {
                stateTransitionService.handleReadOperation(
                    microserviceId,
                    requirement.getComponentId()
                );
            }
            
            // Record the operation in the instance
            ComponentModelServiceEntity currentState = stateTransitionService
                .getComponentState(microserviceId, requirement.getComponentId());
            
            if (currentState != null) {
                MicroserviceComponentStateEntity stateRecord = new MicroserviceComponentStateEntity();
                stateRecord.setMicroserviceId(microserviceId);
                stateRecord.setComponentId(requirement.getComponentId());
                stateRecord.setState(currentState.getState());
                stateRecord.setConsistencyType(currentState.getConsistencyType());
                stateRecord.setVersion(currentState.getVersion());
                instance.getMicroserviceStates().add(stateRecord);
            }
            
            log.info("Successfully executed operation for component {} in microservice {}",
                requirement.getComponentId(),
                microserviceId);
                
        } catch (Exception e) {
            String error = String.format("Failed to execute operation: %s", e.getMessage());
            log.error(error, e);
            throw new RuntimeException(error, e);
        }
    }
}