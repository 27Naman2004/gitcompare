package com.gitcompare.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comparisons")
public class Comparison {
    private String id;
    private String userId;
    
    private List<RepoSource> sources;
    private String baseRepoUrl;
    private String baseBranch;
    
    private int filesChanged;
    private int additions;
    private int deletions;
    
    private List<FileDiff> fileDiffs;
    
    /**
     * AI-generated analysis of the comparison, covering tech stack, 
     * logic differences, and project overview.
     */
    private String aiAnalysis;
    
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileDiff {
        private String fileName;
        private String changeType; // ADD, MODIFY, DELETE, RENAME
        private String diffContent;
    }
}
