package org.consistency.megamodel.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.*;
import org.consistency.megamodel.repository.GomInstanceRepository;
import org.consistency.megamodel.repository.GlobalOperationModelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    @Transactional
    public GomInstanceEntity createInstance(String gomId, String name) {
        GlobalOperationModelEntity gom = gomRepository.findById(gomId)
                .orElseThrow(() -> new EntityNotFoundException("GOM not found: " + gomId));

        GomInstanceEntity instance = new GomInstanceEntity();
        instance.setId(UUID.randomUUID().toString());
        instance.setGom(gom);
        instance.setName(name);
        instance.setStatus(GomInstanceStatus.RUNNING);
        instance.setCreatedAt(LocalDateTime.now());
        instance.setUpdatedAt(LocalDateTime.now());

        // Initialize component states based on GOM requirements
        for (MicroserviceRequirementEntity requirement : gom.getMicroserviceRequirements()) {
            for (ComponentRequirementEntity componentReq : requirement.getRequiredComponents()) {
                MicroserviceComponentStateEntity state = new MicroserviceComponentStateEntity();
                state.setMicroserviceId(requirement.getMicroserviceId());
                state.setComponentId(componentReq.getComponentId());
                state.setState(ComponentState.INVALID);
                state.setConsistencyType(componentReq.getConsistencyType());
                state.setVersion(0L);
                state.setTimestamp(LocalDateTime.now());
                instance.getMicroserviceStates().add(state);
            }
        }

        return gomInstanceRepository.save(instance);
    }

    @Transactional
    public void deleteInstance(String instanceId) {
        GomInstanceEntity instance = gomInstanceRepository.findById(instanceId)
                .orElseThrow(() -> new EntityNotFoundException("Instance not found: " + instanceId));
        gomInstanceRepository.delete(instance);
    }
}