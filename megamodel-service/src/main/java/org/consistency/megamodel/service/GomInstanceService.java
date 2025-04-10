package org.consistency.megamodel.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.consistency.megamodel.model.*;
import org.consistency.megamodel.model.GomInstanceRepository;
import org.consistency.megamodel.model.GlobalOperationModelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GomInstanceService {
    private final GomInstanceRepository gomInstanceRepository;
    private final GlobalOperationModelRepository gomRepository;
    private final StateTransitionService stateTransitionService;

    public List<GomInstanceEntity> getInstancesByGomId(String gomId) {
        return gomInstanceRepository.findByGomId(gomId);
    }

    public Optional<GomInstanceEntity> getInstance(String instanceId) {
        return gomInstanceRepository.findById(instanceId);
    }

    public Optional<Map<String, Object>> getInstanceDetails(String instanceId) {
        return gomInstanceRepository.findById(instanceId)
            .map(instance -> {
                Map<String, Object> details = new HashMap<>();
                details.put("id", instance.getId());
                details.put("name", instance.getName());
                details.put("status", instance.getStatus());
                details.put("createdAt", instance.getCreatedAt());
                details.put("updatedAt", instance.getUpdatedAt());
                
                // Add GOM information
                GlobalOperationModelEntity gom = instance.getGom();
                Map<String, Object> gomInfo = new HashMap<>();
                gomInfo.put("id", gom.getId());
                gomInfo.put("name", gom.getName());
                gomInfo.put("description", gom.getDescription());
                details.put("gom", gomInfo);
                
                // Add state transitions
                List<Map<String, Object>> stateTransitions = new ArrayList<>();
                for (MicroserviceComponentStateEntity state : instance.getMicroserviceStates()) {
                    Map<String, Object> transition = new HashMap<>();
                    transition.put("microserviceId", state.getMicroserviceId());
                    transition.put("componentId", state.getComponentId());
                    transition.put("state", state.getState());
                    transition.put("consistencyType", state.getConsistencyType());
                    transition.put("version", state.getVersion());
                    transition.put("timestamp", state.getTimestamp());
                    stateTransitions.add(transition);
                }
                details.put("stateTransitions", stateTransitions);
                
                // Add execution metrics
                Map<String, Object> metrics = new HashMap<>();
                metrics.put("totalTransitions", instance.getMicroserviceStates().size());
                metrics.put("executionTime", 
                    instance.getUpdatedAt().toInstant(ZoneOffset.UTC).getEpochSecond() - 
                    instance.getCreatedAt().toInstant(ZoneOffset.UTC).getEpochSecond());
                details.put("metrics", metrics);
                
                return details;
            });
    }

    @Transactional
    public GomInstanceEntity createInstance(String gomId, String name) {
        GlobalOperationModelEntity gom = gomRepository.findById(gomId)
                .orElseThrow(() -> new EntityNotFoundException("GOM not found: " + gomId));

        log.info("Creating new instance '{}' for GOM: {}", name, gom.getName());

        GomInstanceEntity instance = new GomInstanceEntity();
        instance.setId(UUID.randomUUID().toString());
        instance.setGom(gom);
        instance.setName(name);
        instance.setStatus(GomInstanceStatus.RUNNING);
        instance.setCreatedAt(LocalDateTime.now());
        instance.setUpdatedAt(LocalDateTime.now());

        // Initialize component states based on GOM requirements
        for (GomRequirementEntity requirement : gom.getRequirements()) {
            log.debug("Initializing state for component {} in microservice {}",
                requirement.getComponent().getId(),
                requirement.getMicroservice().getId());

            MicroserviceComponentStateEntity state = new MicroserviceComponentStateEntity();
            state.setMicroserviceId(requirement.getMicroservice().getId());
            state.setComponentId(requirement.getComponent().getId());
            state.setState(ComponentState.INVALID);
            state.setConsistencyType(requirement.getConsistencyType());
            state.setVersion(0L);
            state.setTimestamp(LocalDateTime.now());
            instance.getMicroserviceStates().add(state);
        }

        GomInstanceEntity savedInstance = gomInstanceRepository.save(instance);
        log.info("Created instance {} for GOM {}", savedInstance.getId(), gom.getName());
        return savedInstance;
    }

    @Transactional
    public void deleteInstance(String instanceId) {
        GomInstanceEntity instance = gomInstanceRepository.findById(instanceId)
                .orElseThrow(() -> new EntityNotFoundException("Instance not found: " + instanceId));
        
        log.info("Deleting instance {} of GOM {}", instance.getId(), instance.getGom().getName());
        gomInstanceRepository.delete(instance);
    }

    @Transactional
    public GomInstanceEntity updateInstance(GomInstanceEntity instance) {
        if (!gomInstanceRepository.existsById(instance.getId())) {
            throw new EntityNotFoundException("Instance not found: " + instance.getId());
        }
        instance.setUpdatedAt(LocalDateTime.now());
        
        log.debug("Updating instance {} of GOM {}", instance.getId(), instance.getGom().getName());
        return gomInstanceRepository.save(instance);
    }
}