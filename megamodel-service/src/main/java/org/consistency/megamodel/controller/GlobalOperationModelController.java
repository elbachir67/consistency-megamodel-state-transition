package org.consistency.megamodel.controller;

import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.GlobalOperationModelEntity;
import org.consistency.megamodel.model.GlobalOperationModelRepository;
import org.consistency.megamodel.service.GlobalOperationModelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/goms")
@RequiredArgsConstructor
public class GlobalOperationModelController {
    private final GlobalOperationModelRepository gomRepository;
    private final GlobalOperationModelService gomService;

    @GetMapping
    public List<GlobalOperationModelEntity> getAllGoms() {
        return gomRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GlobalOperationModelEntity> getGomById(@PathVariable String id) {
        return gomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public GlobalOperationModelEntity createGom(@RequestBody GlobalOperationModelEntity gom) {
        if (gom.getId() == null) {
            gom.setId(UUID.randomUUID().toString());
        }
        return gomRepository.save(gom);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GlobalOperationModelEntity> updateGom(
            @PathVariable String id,
            @RequestBody GlobalOperationModelEntity gom) {
        if (!gomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        gom.setId(id);
        return ResponseEntity.ok(gomRepository.save(gom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGom(@PathVariable String id) {
        if (!gomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        gomRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/execute")
    public ResponseEntity<Void> executeGom(
            @PathVariable String id,
            @RequestBody Map<String, Object> inputs) {
        gomService.executeGom(id, inputs);
        return ResponseEntity.ok().build();
    }
}