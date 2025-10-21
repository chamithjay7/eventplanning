package com.pg113.eventplanning.features.users.repository;

import com.pg113.eventplanning.features.users.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String username, String email, Pageable pageable
    );

    /** Combined search for either email or username (used by NotificationService). */
    @Query("SELECT u FROM User u WHERE u.username = :value OR u.email = :value")
    Optional<User> findByEmailOrUsername(String value);
}
