package com.gitcompare.repositories;

import com.gitcompare.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

/**
 * Repository interface for managing {@link User} entities in MongoDB.
 * Handles user persistence, existence checking, and retrieval for authentication.
 */
public interface UserRepository extends MongoRepository<User, String> {
    
    /**
     * Finds a user by their unique username.
     *
     * @param username The username string to query.
     * @return An Optional containing the User if found.
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Checks if a user already exists with the given username.
     *
     * @param username The username string to check.
     * @return true if a user exists, false otherwise.
     */
    Boolean existsByUsername(String username);
    
    Optional<User> findByEmail(String email);
}
