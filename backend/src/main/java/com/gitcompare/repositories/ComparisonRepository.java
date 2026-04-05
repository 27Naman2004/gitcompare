package com.gitcompare.repositories;

import com.gitcompare.models.Comparison;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

/**
 * Repository interface for {@link Comparison} entities in MongoDB.
 * Handles persistence and retrieval of git comparison results.
 */
public interface ComparisonRepository extends MongoRepository<Comparison, String> {
    
    /**
     * Finds all comparisons associated with a specific user.
     *
     * @param userId The ID of the user whose history is being retrieved.
     * @return A list of comparisons for the user.
     */
    List<Comparison> findByUserId(String userId);
}
