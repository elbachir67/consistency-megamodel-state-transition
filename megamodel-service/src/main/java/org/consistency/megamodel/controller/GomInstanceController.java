package org.consistency.megamodel.controller;

import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.GomInstanceEntity;
import org.consistency.megamodel.service.GomInstanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GomInstanceController {
    private final GomInstanceService gomInstanceService;

    @GetMapping("/goms/{gomId}/instances")
    public List<GomInstanceEntity> getInstancesByGomId(@PathVariable String gomId) {
        return gomInstanceService.getInstancesByGomId(gomId);
    }

    @GetMapping("/gom-instances/{instanceId}")
    public ResponseEntity<Map<String, Object>> getInstanceDetails(@PathVariable String instanceId) {
        return gomInstanceService.getInstanceDetails(instanceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/goms/{gomId}/instances")
    public GomInstanceEntity createInstance(
            @PathVariable String gomId,
            @RequestBody CreateInstanceRequest request) {
        return gomInstanceService.createInstance(gomId, request.getName());
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