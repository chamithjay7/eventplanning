package com.pg113.eventplanning.features.users.controller;

import com.pg113.eventplanning.features.users.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService resetService;

    @PostMapping("/forgot-password")
    public Map<String, String> forgot(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String token = resetService.requestReset(email);
        // Later you’ll email the token link; now just return it for testing
        return Map.of("message", "Password reset link created", "token", token);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reset(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        resetService.resetPassword(token, newPassword);
    }
}
