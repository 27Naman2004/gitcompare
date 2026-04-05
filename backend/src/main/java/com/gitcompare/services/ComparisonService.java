package com.gitcompare.services;

import com.gitcompare.dto.DashboardStats;
import com.gitcompare.models.Comparison;
import com.gitcompare.models.User;
import com.gitcompare.repositories.ComparisonRepository;
import com.gitcompare.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing repository comparisons and historical data.
 */
@Service
@RequiredArgsConstructor
public class ComparisonService {

    private final ComparisonRepository comparisonRepository;
    private final UserRepository userRepository;
    private final GitService gitService;
    private final GeminiService geminiService;

    /**
     * Compares two repos/branches and saves the results with AI analysis.
     *
     * @param request The comparison request containing repo URLs and branches.
     * @return The comparison results including stats and file diffs.
     * @throws Exception if cloning or comparison fails.
     */
    public Comparison compareAndSave(com.gitcompare.dto.ComparisonRequest request) throws Exception {
        User user = getCurrentUser();

        Comparison comparison = gitService.compare(request.getSources(), request.getBaseRepoUrl(), request.getBaseBranch());
        comparison.setUserId(user.getId());
        comparison.setCreatedAt(LocalDateTime.now());

        // Perform AI Analysis
        String analysis = geminiService.analyzeComparison(comparison);
        comparison.setAiAnalysis(analysis);

        return comparisonRepository.save(comparison);
    }

    /**
     * Retrieves the complete comparison history for the currently logged-in user.
     *
     * @return A list of comparisons ordered by the user's history.
     */
    public List<Comparison> getHistory() {
        User user = getCurrentUser();
        return comparisonRepository.findByUserId(user.getId());
    }

    /**
     * Retrieves dashboard statistics by aggregating history data for the current user.
     *
     * @return A DashboardStats object containing aggregated metrics.
     */
    public DashboardStats getDashboardStats() {
        List<Comparison> history = getHistory();
        
        long totalComparisons = history.size();
        long totalAdditions = history.stream().mapToLong(Comparison::getAdditions).sum();
        long totalDeletions = history.stream().mapToLong(Comparison::getDeletions).sum();
        long totalFilesChanged = history.stream().mapToLong(Comparison::getFilesChanged).sum();
        
        Map<String, Long> repoCounts = history.stream()
                .collect(Collectors.groupingBy(Comparison::getBaseRepoUrl, Collectors.counting()));
        
        String topRepo = repoCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        return DashboardStats.builder()
                .totalComparisons(totalComparisons)
                .totalAdditions(totalAdditions)
                .totalDeletions(totalDeletions)
                .totalFilesChanged(totalFilesChanged)
                .topRepo(topRepo)
                .repoCounts(repoCounts)
                .build();
    }

    /**
     * Fetches a single comparison result by its unique identifier.
     * Only allows access if the comparison belongs to the currently logged-in user.
     *
     * @param id The ID of the comparison record.
     * @return The Comparison object if found and authorized.
     */
    public Comparison getById(String id) {
        Comparison comparison = comparisonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comparison not found"));
        
        User user = getCurrentUser();
        if (!comparison.getUserId().equals(user.getId())) {
            throw new RuntimeException("Access Denied: You do not have permission to view this comparison");
        }
        
        return comparison;
    }

    private User getCurrentUser() {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
