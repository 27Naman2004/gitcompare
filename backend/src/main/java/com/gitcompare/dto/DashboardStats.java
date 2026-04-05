package com.gitcompare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Data Transfer Object for carrying dashboard summary statistics.
 * This DTO aggregates information across all past comparisons for a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    /**
     * Total number of comparisons performed by the user.
     */
    private long totalComparisons;

    /**
     * Total lines added across all comparisons.
     */
    private long totalAdditions;

    /**
     * Total lines deleted across all comparisons.
     */
    private long totalDeletions;

    /**
     * Total number of files changed across all comparisons.
     */
    private long totalFilesChanged;

    /**
     * Most frequently compared repository URL.
     */
    private String topRepo;

    /**
     * Comparison counts by repository.
     */
    private Map<String, Long> repoCounts;
}
