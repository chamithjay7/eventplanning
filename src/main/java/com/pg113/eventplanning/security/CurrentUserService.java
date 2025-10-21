package com.pg113.eventplanning.security;

import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    /**
     * Resolve the current user using either email or username,
     * depending on what JwtAuthFilter put into Authentication#getName().
     */
    public User require(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        final String name = auth.getName();

        // 🔹 Uses the single-argument repository method
        return userRepository.findByEmailOrUsername(name)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
