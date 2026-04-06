package com.gitcompare.controllers;

import com.gitcompare.models.Suggestion;
import com.gitcompare.repositories.SuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final SuggestionRepository suggestionRepository;

    @GetMapping
    public Map<String, List<Suggestion>> getRoadmap() {
        // Only show suggestions that are not "PENDING" or "REJECTED" on the public roadmap
        // (or show all except private ones)
        List<Suggestion> roadmapItems = suggestionRepository.findByStatusIn(List.of("PLANNED", "IN_PROGRESS", "SHIPPED", "RESEARCH"));
        
        return roadmapItems.stream()
                .collect(Collectors.groupingBy(Suggestion::getStatus));
    }
}
