package com.pg113.eventplanning.features.users.service;

import com.pg113.eventplanning.features.users.model.PasswordResetToken;
import com.pg113.eventplanning.features.users.repository.PasswordResetRepository;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetRepository resetRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public String requestReset(String email) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with that email"));

        // clear old tokens
        resetRepo.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        PasswordResetToken reset = PasswordResetToken.builder()
                .email(email)
                .token(token)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(15 * 60)) // 15 minutes
                .build();
        resetRepo.save(reset);
        return token; // you could send via email later
    }

    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> optional = resetRepo.findByToken(token);
        if (optional.isEmpty()) throw new RuntimeException("Invalid or expired token");

        PasswordResetToken pr = optional.get();
        if (pr.getExpiresAt().isBefore(Instant.now()))
            throw new RuntimeException("Token expired");

        var user = userRepo.findByEmail(pr.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
        resetRepo.delete(pr); // remove after use
    }
}
