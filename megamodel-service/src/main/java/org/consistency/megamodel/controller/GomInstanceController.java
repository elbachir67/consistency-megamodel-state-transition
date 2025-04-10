package org.consistency.megamodel.controller;

import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.GomInstanceEntity;
import org.consistency.megamodel.service.GomInstanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GomInstanceController {
    private final GomInstanceService gomInstanceService;

    @GetMapping("/goms/{gomId}/instances")
    public List<GomInstanceEntity> getInstancesByGomId(@PathVariable String gomId) {
        return gomInstanceService.getInstancesByGomId(gomId);
    }

    @PostMapping("/goms/{gomId}/instances")
    public GomInstanceEntity createInstance(
            @PathVariable String gomId,
            @RequestBody CreateInstanceRequest request) {
        return gomInstanceService.createInstance(gomId, request.getName());
    }

    @GetMapping("/gom-instances/{instanceId}")
    public ResponseEntity<GomInstanceEntity> getInstance(@PathVariable String instanceId) {
        return gomInstanceService.getInstance(instanceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/gom-instances/{instanceId}")
    public ResponseEntity<Void> deleteInstance(@PathVariable String instanceId) {
        gomInstanceService.deleteInstance(instanceId);
        return ResponseEntity.noContent().build();
    }
}

class CreateInstanceRequest {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}