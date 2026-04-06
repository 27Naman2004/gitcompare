package com.gitcompare.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "suggestions")
public class Suggestion {

    @Id
    private String id;
    private String category;
    private String title;
    private String description;
    private String email;
    private LocalDateTime submittedAt;
    
    @Builder.Default
    private String status = "PENDING"; // PENDING, IN_PROGRESS, SHIPPED, REJECTED
}
