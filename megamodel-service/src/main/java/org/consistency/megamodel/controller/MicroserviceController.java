package org.consistency.megamodel.controller;

import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.MicroserviceEntity;
import org.consistency.megamodel.model.MicroserviceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/microservices")
@RequiredArgsConstructor
public class MicroserviceController {
    private final MicroserviceRepository microserviceRepository;

    @GetMapping
    public List<MicroserviceEntity> getAllMicroservices() {
        return microserviceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MicroserviceEntity> getMicroserviceById(@PathVariable String id) {
        return microserviceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MicroserviceEntity createMicroservice(@RequestBody MicroserviceEntity microservice) {
        if (microservice.getId() == null) {
            microservice.setId(UUID.randomUUID().toString());
        }
        return microserviceRepository.save(microservice);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MicroserviceEntity> updateMicroservice(
            @PathVariable String id,
            @RequestBody MicroserviceEntity microservice) {
        if (!microserviceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        microservice.setId(id);
        return ResponseEntity.ok(microserviceRepository.save(microservice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMicroservice(@PathVariable String id) {
        if (!microserviceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        microserviceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}