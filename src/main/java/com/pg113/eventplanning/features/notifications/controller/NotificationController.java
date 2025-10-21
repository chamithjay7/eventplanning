package com.pg113.eventplanning.features.notifications.controller;

import com.pg113.eventplanning.features.notifications.dto.NotificationRequest;
import com.pg113.eventplanning.features.notifications.dto.NotificationResponse;
import com.pg113.eventplanning.features.notifications.model.Notification;
import com.pg113.eventplanning.features.notifications.model.NotificationType;
import com.pg113.eventplanning.features.notifications.service.NotificationService;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.model.UserRole;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;
    private final UserRepository userRepository;

    @GetMapping("/latest")
    public List<NotificationResponse> latest(Authentication auth) {
        return service.latest(auth.getName()).stream().map(this::toDto).toList();
    }

    @GetMapping
    public List<NotificationResponse> all(Authentication auth) {
        return service.all(auth.getName()).stream().map(this::toDto).toList();
    }

    @GetMapping("/unread")
    public List<NotificationResponse> unread(Authentication auth) {
        return service.unread(auth.getName()).stream().map(this::toDto).toList();
    }

    @GetMapping("/unread-count")
    public long unreadCount(Authentication auth) {
        return service.unreadCount(auth.getName());
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void readOne(@PathVariable Long id, Authentication auth) {
        service.markRead(auth.getName(), id);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void readAll(Authentication auth) {
        service.readAll(auth.getName());
    }

    @PatchMapping("/{id}/archive")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@PathVariable Long id, Authentication auth) {
        service.archive(auth.getName(), id); // archive ONE notification
    }

    // ========== ADMIN ENDPOINTS ==========

    /**
     * Admin: Create and broadcast notification to all users or specific roles
     */
    @PostMapping("/admin/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public void broadcastNotification(@RequestBody NotificationRequest req) {
        // Broadcast to all users (ADMIN, ORGANIZER, USER, VENDOR)
        List<User> allUsers = userRepository.findAll();

        for (User user : allUsers) {
            service.create(
                user.getUsername(),
                req.getTitle(),
                req.getMessage(),
                req.getType() != null ? req.getType() : NotificationType.GENERAL
            );
        }
    }

    /**
     * Admin: Create notification for specific user
     */
    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponse createForUser(@RequestBody NotificationRequest req) {
        if (req.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification n = service.create(
            user.getUsername(),
            req.getTitle(),
            req.getMessage(),
            req.getType() != null ? req.getType() : NotificationType.GENERAL
        );

        return toDto(n);
    }

    /**
     * Admin: Delete any notification by ID
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNotification(@PathVariable Long id) {
        // Admin can delete any notification
        // We need to add a method to delete by ID directly
        var notification = service.findById(id);
        service.deleteById(id);
    }

    private NotificationResponse toDto(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .status(n.getStatus())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
