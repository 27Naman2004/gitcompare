package com.gitcompare.controllers;

import com.gitcompare.dto.ComparisonRequest;
import com.gitcompare.dto.DashboardStats;
import com.gitcompare.models.Comparison;
import com.gitcompare.services.ComparisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for repository comparison operations and user history.
 */
@RestController
@RequestMapping("/compare")
@RequiredArgsConstructor
public class ComparisonController {

    private final ComparisonService comparisonService;

    /**
     * Trigger a new comparison between two branches of a repository.
     *
     * @param request The repo URL and branches to compare.
     * @return The created comparison record.
     * @throws Exception if comparison fails.
     */
    @PostMapping
    public ResponseEntity<Comparison> getComparison(@RequestBody ComparisonRequest request) throws Exception {
        return ResponseEntity.ok(comparisonService.compareAndSave(request));
    }

    /**
     * Get the comparison activity history for the current user.
     *
     * @return List of past comparisons.
     */
    @GetMapping("/history")
    public ResponseEntity<List<Comparison>> getHistory() {
        return ResponseEntity.ok(comparisonService.getHistory());
    }

    /**
     * Get aggregate statistics for the user's dashboard.
     *
     * @return Statistics such as total additions, deletions, etc.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(comparisonService.getDashboardStats());
    }

    /**
     * Get detailed results for a specific comparison.
     *
     * @param id The comparison record ID.
     * @return The comparison details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Comparison> getById(@PathVariable String id) {
        return ResponseEntity.ok(comparisonService.getById(id));
    }
}
