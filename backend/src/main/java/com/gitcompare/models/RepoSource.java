package com.gitcompare.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepoSource {
    private String url;
    private String branch;
    private String commitHash;
    private String nickname; // Optional name for the repo in the UI
}
