package com.gitcompare.dto;

import com.gitcompare.models.RepoSource;
import lombok.Data;
import java.util.List;

@Data
public class ComparisonRequest {
    private List<RepoSource> sources;
    private String baseRepoUrl;
    private String baseBranch;
}
