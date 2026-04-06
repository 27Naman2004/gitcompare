package com.gitcompare.controllers;

import com.gitcompare.models.Suggestion;
import com.gitcompare.repositories.SuggestionRepository;
import com.gitcompare.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/public/suggestions")
@RequiredArgsConstructor
@Slf4j
public class SuggestionController {

    private final SuggestionRepository suggestionRepository;
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<Map<String, String>> submit(@RequestBody Map<String, String> body) {
        String category = body.getOrDefault("category", "feature");
        String title    = body.getOrDefault("title", "").trim();
        String desc     = body.getOrDefault("description", "").trim();
        String email    = body.getOrDefault("email", "").trim();

        if (title.isEmpty() || desc.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title and description are required."));
        }

        Suggestion suggestion = Suggestion.builder()
                .category(category)
                .title(title)
                .description(desc)
                .email(email.isEmpty() ? null : email)
                .submittedAt(LocalDateTime.now())
                .status("PENDING") // Explicitly set to pending
                .build();
        suggestionRepository.save(suggestion);
        log.info("New suggestion saved: [{}] {}", category, title);

        // Send emails (non-blocking failure — won't crash the response)
        try {
            emailService.sendSuggestionConfirmation(email, title);
        } catch (Exception e) {
            log.warn("Email notification failed but suggestion was saved. {}", e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Suggestion received! Thank you."));
    }
}
