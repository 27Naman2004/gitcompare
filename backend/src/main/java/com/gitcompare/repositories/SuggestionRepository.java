package com.gitcompare.repositories;

import java.util.List;
import com.gitcompare.models.Suggestion;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SuggestionRepository extends MongoRepository<Suggestion, String> {
    List<Suggestion> findByStatus(String status);
    List<Suggestion> findByStatusIn(List<String> statuses);
}
