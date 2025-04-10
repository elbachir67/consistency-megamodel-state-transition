package org.consistency.megamodel.controller;

import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.ComponentState;
import org.consistency.megamodel.service.MetricsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {
    private final MetricsService metricsService;
    
    @GetMapping("/state-distribution")
    public Map<ComponentState, Long> getStateDistribution() {
        return metricsService.getCurrentStateDistribution();
    }
    
    @GetMapping("/total-operations")
    public long getTotalOperations() {
        return metricsService.getTotalOperations();
    }
    
    @GetMapping("/transition-counts")
    public Map<ComponentState, Long> getTransitionCounts() {
        return metricsService.getStateTransitionCounts();
    }
}