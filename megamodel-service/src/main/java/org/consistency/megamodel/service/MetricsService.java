package org.consistency.megamodel.service;

import lombok.RequiredArgsConstructor;
import org.consistency.megamodel.model.ComponentState;
import org.consistency.megamodel.model.ComponentModelServiceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MetricsService {
    private final ComponentModelServiceRepository componentModelServiceRepo;
    private final Map<ComponentState, AtomicLong> stateTransitionCounts = new EnumMap<>(ComponentState.class);
    private final AtomicLong totalOperations = new AtomicLong(0);
    private final Queue<Map<String, Object>> recentTransitions = new ConcurrentLinkedQueue<>();
    private static final int MAX_RECENT_TRANSITIONS = 10;
    
    {
        for (ComponentState state : ComponentState.values()) {
            stateTransitionCounts.put(state, new AtomicLong(0));
        }
    }
    
    public void recordStateTransition(String componentId, String microserviceId, ComponentState fromState, ComponentState toState) {
        stateTransitionCounts.get(toState).incrementAndGet();
        totalOperations.incrementAndGet();

        Map<String, Object> transition = new HashMap<>();
        transition.put("componentId", componentId);
        transition.put("microserviceId", microserviceId);
        transition.put("fromState", fromState);
        transition.put("toState", toState);
        transition.put("timestamp", LocalDateTime.now());

        recentTransitions.offer(transition);
        while (recentTransitions.size() > MAX_RECENT_TRANSITIONS) {
            recentTransitions.poll();
        }
    }
    
    @Scheduled(fixedRate = 60000) // Every minute
    public void logMetrics() {
        Map<ComponentState, Long> currentCounts = new EnumMap<>(ComponentState.class);
        componentModelServiceRepo.findAll().forEach(entity -> 
            currentCounts.merge(entity.getState(), 1L, Long::sum));
            
        StringBuilder report = new StringBuilder("\nSystem Metrics Report:\n");
        report.append("Total operations: ").append(totalOperations.get()).append("\n");
        report.append("Current state distribution:\n");
        
        currentCounts.forEach((state, count) -> 
            report.append(String.format("  %s: %d\n", state, count)));
            
        report.append("Transition counts:\n");
        stateTransitionCounts.forEach((state, count) -> 
            report.append(String.format("  To %s: %d\n", state, count.get())));
            
        System.out.println(report);
    }
    
    public Map<ComponentState, Long> getCurrentStateDistribution() {
        Map<ComponentState, Long> distribution = new EnumMap<>(ComponentState.class);
        componentModelServiceRepo.findAll().forEach(entity -> 
            distribution.merge(entity.getState(), 1L, Long::sum));
        return distribution;
    }
    
    public long getTotalOperations() {
        return totalOperations.get();
    }
    
    public Map<ComponentState, Long> getStateTransitionCounts() {
        Map<ComponentState, Long> counts = new EnumMap<>(ComponentState.class);
        stateTransitionCounts.forEach((state, count) -> 
            counts.put(state, count.get()));
        return counts;
    }

    public List<Map<String, Object>> getRecentTransitions() {
        return new ArrayList<>(recentTransitions);
    }
}