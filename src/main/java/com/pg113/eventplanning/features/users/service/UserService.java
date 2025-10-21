package com.pg113.eventplanning.features.users.service;

import com.pg113.eventplanning.features.users.dto.UpdateUserRequest;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.model.UserRole;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ---------- Queries ----------

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // alias kept for other callers
    public Optional<User> getUserById(Long id) {
        return findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // used by AuthController
    public Optional<User> getUserByUsername(String username) {
        return findByUsername(username);
    }

    /** Find by either username or email (used by NotificationService). */
    public Optional<User> getUserByEmailOrUsername(String value) {
        if (value == null || value.isBlank()) return Optional.empty();
        // delegate to repository combined matcher
        return userRepository.findByEmailOrUsername(value);
    }

    /** Simple text search over username/email (paged). */
    public Page<User> search(String q, Pageable pageable) {
        String term = (q == null) ? "" : q.trim();
        return userRepository
                .findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(term, term, pageable);
    }

    // ---------- Commands ----------

    /** Entity-based create (matches UserController). */
    @Transactional
    public User create(User user) {
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new RuntimeException("Username is required");
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /** Backward-compatible alias some code may still call. */
    @Transactional
    public User saveUser(User user) {
        return create(user);
    }

    /** Overload #1: entity-based update (partial). */
    @Transactional
    public User update(Long id, User updates) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getEmail() != null && !updates.getEmail().isBlank()) {
            u.setEmail(updates.getEmail());
        }
        if (updates.getRole() != null) {
            u.setRole(updates.getRole());
        }
        if (updates.getPassword() != null && !updates.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(updates.getPassword()));
        }
        return u; // JPA dirty-checking
    }

    /** Overload #2: DTO-based update used by UserController. */
    @Transactional
    public User update(Long id, UpdateUserRequest req) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Support either "email" or "newEmail" in the DTO
        String newEmail = (req.getEmail() != null && !req.getEmail().isBlank())
                ? req.getEmail()
                : req.getNewEmail();

        if (newEmail != null && !newEmail.isBlank()) {
            u.setEmail(newEmail);
        }
        if (req.getRole() != null) {
            u.setRole(req.getRole());
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        return u; // JPA dirty-checking
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    /** Dedicated password change for /change-password. */
    @Transactional
    public void changePassword(String username, String oldPw, String newPw) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPw, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        if (newPw == null || newPw.isBlank()) {
            throw new RuntimeException("New password is required");
        }
        user.setPassword(passwordEncoder.encode(newPw));
    }
}
