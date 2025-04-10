package org.consistency.megamodel.controller;

import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.ComponentModelEntity;
import org.consistency.megamodel.model.ComponentModelRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/components")
@RequiredArgsConstructor
public class ComponentModelController {
    private final ComponentModelRepository componentModelRepository;

    @GetMapping
    public List<ComponentModelEntity> getAllComponents() {
        return componentModelRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComponentModelEntity> getComponentById(@PathVariable String id) {
        return componentModelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ComponentModelEntity createComponent(@RequestBody ComponentModelEntity component) {
        if (component.getId() == null) {
            component.setId(UUID.randomUUID().toString());
        }
        return componentModelRepository.save(component);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComponentModelEntity> updateComponent(
            @PathVariable String id,
            @RequestBody ComponentModelEntity component) {
        if (!componentModelRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        component.setId(id);
        return ResponseEntity.ok(componentModelRepository.save(component));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComponent(@PathVariable String id) {
        if (!componentModelRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        componentModelRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}