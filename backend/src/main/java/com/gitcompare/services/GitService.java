package com.gitcompare.services;

import com.gitcompare.models.Comparison;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for interacting with Git repositories using JGit.
 * Handles cloning and performing diffs between branches or different repositories.
 */
@Service
@Slf4j
public class GitService {

    @Value("${gitcompare.git.storage-path}")
    private String storagePath;

    /**
     * Compares multiple codebases against a base repository/branch.
     * 
     * @param sources List of repository sources to compare.
     * @param baseRepoUrl The URL of the base repository.
     * @param baseBranch The branch of the base repository.
     * @return Aggregated Comparison object.
     */
    public Comparison compare(List<com.gitcompare.models.RepoSource> sources, String baseRepoUrl, String baseBranch) throws GitAPIException, IOException {
        String baseId = UUID.randomUUID().toString();
        Path basePath = Paths.get(storagePath, baseId);
        Files.createDirectories(basePath);

        log.info("Cloning Base Repo: {} into {}", baseRepoUrl, basePath);
        try (Git baseGit = cloneRepo(baseRepoUrl, basePath)) {
            Repository baseRepository = baseGit.getRepository();
            ObjectId baseHead = baseRepository.resolve(baseBranch);
            if (baseHead == null) throw new RuntimeException("Base Branch not found: " + baseBranch);

            int totalFilesChanged = 0;
            int totalAdditions = 0;
            int totalDeletions = 0;
            List<Comparison.FileDiff> allFileDiffs = new ArrayList<>();

            for (com.gitcompare.models.RepoSource source : sources) {
                // If the source is the same as the base, we just update the commit hash
                if (source.getUrl().equals(baseRepoUrl) && source.getBranch().equals(baseBranch)) {
                    source.setCommitHash(baseHead.name());
                    continue;
                }

                // Clone and compare each source against the base
                String sourceId = UUID.randomUUID().toString();
                Path sourcePath = Paths.get(storagePath, sourceId);
                Files.createDirectories(sourcePath);

                log.info("Cloning Source Repo: {} into {}", source.getUrl(), sourcePath);
                try (Git sourceGit = cloneRepo(source.getUrl(), sourcePath)) {
                    Repository sourceRepository = sourceGit.getRepository();
                    ObjectId sourceHead = sourceRepository.resolve(source.getBranch());
                    if (sourceHead == null) throw new RuntimeException("Source Branch not found: " + source.getBranch());
                    
                    source.setCommitHash(sourceHead.name());

                    // For now, we perform a simplified tree comparison for secondary repos
                    // In a production environment, we'd do more sophisticated N-way merging/diffing
                    Comparison subComp = (source.getUrl().equals(baseRepoUrl)) 
                        ? performDiff(baseRepository, baseHead, sourceHead, baseRepoUrl, source.getUrl(), baseBranch, source.getBranch())
                        : performCrossRepoDiff(baseRepository, baseHead, sourceRepository, sourceHead, baseRepoUrl, source.getUrl(), baseBranch, source.getBranch());
                    
                    totalFilesChanged += subComp.getFilesChanged();
                    totalAdditions += subComp.getAdditions();
                    totalDeletions += subComp.getDeletions();
                    allFileDiffs.addAll(subComp.getFileDiffs());
                }
            }

            return Comparison.builder()
                    .sources(sources)
                    .baseRepoUrl(baseRepoUrl)
                    .baseBranch(baseBranch)
                    .filesChanged(totalFilesChanged)
                    .additions(totalAdditions)
                    .deletions(totalDeletions)
                    .fileDiffs(allFileDiffs)
                    .build();
        } finally {
            // Robustness: Cleanup the temporary repository clones from the ephemeral disk
            cleanupStorage(basePath);
        }
    }

    private void cleanupStorage(Path path) {
        if (path == null) return;
        try {
            log.info("Cleaning up storage at {}", path);
            Files.walk(path)
                    .sorted((a, b) -> b.compareTo(a)) // Delete files first, then directories
                    .map(Path::toFile)
                    .forEach(file -> {
                        if (!file.delete()) {
                            log.warn("Failed to delete file: {}", file.getAbsolutePath());
                        }
                    });
        } catch (IOException e) {
            log.error("Failed to cleanup storage: {}", e.getMessage());
        }
    }

    private Git cloneRepo(String url, Path path) throws GitAPIException {
        return Git.cloneRepository()
                .setURI(url)
                .setDirectory(path.toFile())
                .setCloneAllBranches(true)
                .call();
    }

    private Comparison performDiff(Repository repository, ObjectId oldHead, ObjectId newHead, 
                                   String repoA, String repoB, String branchA, String branchB) throws IOException {
        List<Comparison.FileDiff> fileDiffs = new ArrayList<>();
        int additions = 0;
        int deletions = 0;

        try (RevWalk walk = new RevWalk(repository)) {
            RevCommit oldCommit = walk.parseCommit(oldHead);
            RevCommit newCommit = walk.parseCommit(newHead);

            try (ObjectReader reader = repository.newObjectReader()) {
                CanonicalTreeParser oldTreeIter = new CanonicalTreeParser();
                oldTreeIter.reset(reader, oldCommit.getTree().getId());

                CanonicalTreeParser newTreeIter = new CanonicalTreeParser();
                newTreeIter.reset(reader, newCommit.getTree().getId());

                return computeDiff(repository, oldTreeIter, newTreeIter, repoA, repoB, branchA, branchB);
            }
        }
    }

    private Comparison performCrossRepoDiff(Repository targetRepo, ObjectId targetHead, 
                                           Repository baseRepo, ObjectId baseHead,
                                           String targetUrl, String baseUrl, String targetBranch, String baseBranch) throws IOException {
        try (Git git = new Git(targetRepo)) {
            // Add the base repository as a temporary remote to the target repository
            String remoteName = "base-" + UUID.randomUUID().toString().substring(0, 8);
            try {
                git.remoteAdd()
                        .setName(remoteName)
                        .setUri(new URIish(baseRepo.getDirectory().getParentFile().getAbsolutePath()))
                        .call();

                // Fetch the base repository's objects into the target repository's database
                git.fetch()
                        .setRemote(remoteName)
                        .call();

                // Now we can resolve the base commit within the target repository context
                ObjectId fetchedBaseHead = targetRepo.resolve(remoteName + "/" + baseBranch);
                if (fetchedBaseHead == null) {
                    // Fallback to name if branch resolution fails
                    fetchedBaseHead = targetRepo.resolve(baseHead.name());
                }

                try (RevWalk walk = new RevWalk(targetRepo)) {
                    RevCommit baseCommit = walk.parseCommit(fetchedBaseHead);
                    RevCommit targetCommit = walk.parseCommit(targetHead);

                    try (ObjectReader reader = targetRepo.newObjectReader()) {
                        CanonicalTreeParser baseTreeIter = new CanonicalTreeParser();
                        baseTreeIter.reset(reader, baseCommit.getTree().getId());

                        CanonicalTreeParser targetTreeIter = new CanonicalTreeParser();
                        targetTreeIter.reset(reader, targetCommit.getTree().getId());

                        return computeDiff(targetRepo, baseTreeIter, targetTreeIter, baseUrl, targetUrl, baseBranch, targetBranch);
                    }
                }
            } catch (Exception e) {
                log.error("Error performing cross-repo diff", e);
                return Comparison.builder()
                        .baseRepoUrl(baseUrl)
                        .baseBranch(baseBranch)
                        .filesChanged(0)
                        .additions(0)
                        .deletions(0)
                        .fileDiffs(new ArrayList<>())
                        .build();
            }
        }
    }

    private Comparison computeDiff(Repository repository, CanonicalTreeParser oldTree, CanonicalTreeParser newTree,
                                  String repoA, String repoB, String branchA, String branchB) throws IOException {
        List<Comparison.FileDiff> fileDiffs = new ArrayList<>();
        int additions = 0;
        int deletions = 0;

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             DiffFormatter df = new DiffFormatter(out)) {
            df.setRepository(repository);
            List<DiffEntry> entries = df.scan(oldTree, newTree);

            for (DiffEntry entry : entries) {
                out.reset();
                df.format(entry);
                String diffText = out.toString();

                for (String line : diffText.split("\n")) {
                    if (line.startsWith("+") && !line.startsWith("+++")) additions++;
                    else if (line.startsWith("-") && !line.startsWith("---")) deletions++;
                }

                fileDiffs.add(Comparison.FileDiff.builder()
                        .fileName(entry.getNewPath().equals(DiffEntry.DEV_NULL) ? entry.getOldPath() : entry.getNewPath())
                        .changeType(entry.getChangeType().name())
                        .diffContent(diffText)
                        .build());
            }

            return Comparison.builder()
                    .baseRepoUrl(repoA)
                    .baseBranch(branchA)
                    .filesChanged(fileDiffs.size())
                    .additions(additions)
                    .deletions(deletions)
                    .fileDiffs(fileDiffs)
                    .build();
        }
    }
}
