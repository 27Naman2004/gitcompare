package com.gitcompare.repositories;

import com.gitcompare.models.Suggestion;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SuggestionRepository extends MongoRepository<Suggestion, String> {
}
