package org.consistency.megamodel.controller;

import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.ComponentModelServiceEntity;
import org.consistency.megamodel.model.ConsistencyType;
import org.consistency.megamodel.model.ComponentModelServiceRepository;
import org.consistency.megamodel.service.StateTransitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/states")
@RequiredArgsConstructor
public class StateController {
    private final ComponentModelServiceRepository componentModelServiceRepository;
    private final StateTransitionService stateTransitionService;

    @GetMapping
    public List<ComponentModelServiceEntity> getAllStates() {
        return componentModelServiceRepository.findAll();
    }

    @GetMapping("/{microserviceId}/{componentId}")
    public ResponseEntity<ComponentModelServiceEntity> getState(
            @PathVariable String microserviceId,
            @PathVariable String componentId) {
        return componentModelServiceRepository
                .findByMicroserviceIdAndComponentModelId(microserviceId, componentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{microserviceId}/{componentId}")
    public ResponseEntity<ComponentModelServiceEntity> updateState(
            @PathVariable String microserviceId,
            @PathVariable String componentId,
            @RequestBody UpdateStateRequest request) {
        return componentModelServiceRepository
                .findByMicroserviceIdAndComponentModelId(microserviceId, componentId)
                .map(entity -> {
                    entity.setConsistencyType(request.getConsistencyType());
                    return ResponseEntity.ok(componentModelServiceRepository.save(entity));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/operations/read")
    public ResponseEntity<Void> handleReadOperation(
            @RequestParam String microserviceId,
            @RequestParam String componentId) {
        stateTransitionService.handleReadOperation(microserviceId, componentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/operations/write")
    public ResponseEntity<Void> handleWriteOperation(
            @RequestParam String microserviceId,
            @RequestParam String componentId) {
        stateTransitionService.handleWriteOperation(microserviceId, componentId);
        return ResponseEntity.ok().build();
    }
}

class UpdateStateRequest {
    private ConsistencyType consistencyType;

    public ConsistencyType getConsistencyType() {
        return consistencyType;
    }

    public void setConsistencyType(ConsistencyType consistencyType) {
        this.consistencyType = consistencyType;
    }
}