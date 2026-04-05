package com.gitcompare.services;

import com.gitcompare.models.Comparison;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for interacting with Google Gemini AI to analyze repository comparisons.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${google.gemini.api.key:}")
    private String apiKey;

    private String getEffectiveApiKey() {
        // 1. Check if Spring @Value injected it correctly (dotenv-java sets System Properties
        //    before Spring context starts, so this should normally work)
        if (apiKey != null && !apiKey.isEmpty() && !apiKey.startsWith("${")) {
            return apiKey.trim();
        }
        // 2. Explicit System.getProperty() fallback — dotenv-java uses System.setProperty()
        String propKey = System.getProperty("GOOGLE_GEMINI_API_KEY");
        if (propKey != null && !propKey.isEmpty()) {
            return propKey.trim();
        }
        // 3. OS-level environment variable fallback
        String envKey = System.getenv("GOOGLE_GEMINI_API_KEY");
        if (envKey != null && !envKey.isEmpty()) {
            return envKey.trim();
        }
        return null;
    }

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    /**
     * Analyzes a comparison result and generates a detailed technical report.
     *
     * @param comparison The comparison object containing metadata and diffs.
     * @return AI-generated analysis string.
     */
    public String analyzeComparison(Comparison comparison) {
        String effectiveKey = getEffectiveApiKey();
        
        if (effectiveKey == null || effectiveKey.isEmpty()) {
            log.error("Gemini API Key is missing or empty.");
            return "AI Analysis unavailable: No API Key configured.";
        }

        log.info("Gemini key resolved. Length={}, prefix={}...", effectiveKey.length(), effectiveKey.substring(0, Math.min(8, effectiveKey.length())));

        String prompt = constructPrompt(comparison);
        
        try {
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);
            content.put("parts", List.of(parts));
            requestBody.put("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL + effectiveKey, entity, Map.class);
            
            return extractTextFromResponse(response);
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "Failed to generate AI analysis: " + e.getMessage();
        }
    }

    private String constructPrompt(Comparison comparison) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert software architect and senior developer. Analyze the following Git comparison between a base repository and multiple other sources:\n\n");
        sb.append("Base Repository: ").append(comparison.getBaseRepoUrl()).append(" (Branch: ").append(comparison.getBaseBranch()).append(")\n\n");
        
        sb.append("Compared Sources:\n");
        comparison.getSources().forEach(source -> {
            sb.append("- ").append(source.getUrl()).append(" (Branch: ").append(source.getBranch()).append(", Commit: ").append(source.getCommitHash()).append(")\n");
        });
        
        sb.append("\nKey Metrics (Aggregated):\n");
        sb.append("- Total Files Changed: ").append(comparison.getFilesChanged()).append("\n");
        sb.append("- Code Additions: ").append(comparison.getAdditions()).append("\n");
        sb.append("- Code Deletions: ").append(comparison.getDeletions()).append("\n\n");

        if (comparison.getFileDiffs() != null && !comparison.getFileDiffs().isEmpty()) {
            sb.append("Significant File Changes (Top 20 Samples):\n");
            comparison.getFileDiffs().stream().limit(20).forEach(diff -> {
                sb.append("- ").append(diff.getFileName()).append(" (Type: ").append(diff.getChangeType()).append(")\n");
            });
        }

        sb.append("\nYour Task: Provide an exceptionally deep and detailed technical analysis. Focus on:\n");
        sb.append("1. **Deep Technology Stack & Ecosystem**: Identify the core tech stack (languages, frameworks, DBs, cloud providers) from the file structure and changes. Analyze how dependencies interact.\n");
        sb.append("2. **Architectural Evolution**: How does the codebase evolve across these sources? Identify shifts in patterns (e.g., Monolith to Microservices, introduction of Hexagonal architecture).\n");
        sb.append("3. **Design Pattern Detection**: Identify specific GoF or Cloud patterns observed in the changes (e.g., Strategy, Circuit Breaker, CQRS).\n");
        sb.append("4. **Cross-Repo Consistency**: Evaluate how consistent the coding standards and library usage are across the analyzed repositories.\n");
        sb.append("5. **Complexity & Technical Debt**: Estimate cyclomatic complexity trends and highlight potential technical debt introduced in new changes.\n");
        sb.append("6. **Security & Performance Audit**: Identify potential vulnerabilities (e.g., SQLi, XSS) and performance bottlenecks (e.g., N+1 queries).\n");
        sb.append("7. **Final Verdict**: Provide a production-readiness score and recommendations for the next development phase.\n\n");
        sb.append("Format the response using professional Markdown with clear headings, sub-headings, and structured lists.");

        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> response) {
        try {
            if (response == null) return "No response from AI.";
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "AI generated no candidates.";
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Error parsing AI response", e);
            return "Error parsing AI response.";
        }
    }
}
