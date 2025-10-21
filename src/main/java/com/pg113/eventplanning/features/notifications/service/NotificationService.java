package com.pg113.eventplanning.features.notifications.service;

import com.pg113.eventplanning.features.notifications.model.Notification;
import com.pg113.eventplanning.features.notifications.model.NotificationStatus;
import com.pg113.eventplanning.features.notifications.model.NotificationType;
import com.pg113.eventplanning.features.notifications.repository.NotificationRepository;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;
    private final UserService userService;

    /** Create a new notification for a user (by email or username). */
    @Transactional
    public Notification create(String username, String title, String message, NotificationType type) {
        User user = userService.getUserByEmailOrUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));

        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .status(NotificationStatus.UNREAD)
                .build();

        return repo.save(n);
    }

    /** Latest (top 20) notifications. */
    @Transactional(readOnly = true)
    public List<Notification> latest(String username) {
        User user = userService.getUserByEmailOrUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
        return repo.findTop20ByUserOrderByCreatedAtDesc(user);
    }

    /** All notifications for the user, newest first — matches controller `service.all(...)`. */
    @Transactional(readOnly = true)
    public List<Notification> all(String username) {
        User user = userService.getUserByEmailOrUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
        return repo.findByUserOrderByCreatedAtDesc(user);
    }

    /** Only unread notifications — matches controller `service.unread(...)`. */
    @Transactional(readOnly = true)
    public List<Notification> unread(String username) {
        User user = userService.getUserByEmailOrUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
        return repo.findByUserAndStatus(user, NotificationStatus.UNREAD);
    }

    /** Count of unread — matches controller `service.unreadCount(...)`. */
    @Transactional(readOnly = true)
    public long unreadCount(String username) {
        User user = userService.getUserByEmailOrUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
        return repo.countByUserAndStatus(user, NotificationStatus.UNREAD);
    }

    /** Mark ALL as read — matches controller `service.readAll(...)`. */
    @Transactional
    public void readAll(String username) {
        User user = userService.getUserByEmailOrUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));
        List<Notification> list = repo.findByUserAndStatus(user, NotificationStatus.UNREAD);
        list.forEach(n -> n.setStatus(NotificationStatus.READ));
        if (!list.isEmpty()) {
            repo.saveAll(list);
        }
    }

    /** Mark ONE as read (id+user) — original signature kept. */
    @Transactional
    public void markRead(Long id, String username) {
        User user = userService.getUserByEmailOrUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));

        Notification n = repo.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found: " + id));
        n.setStatus(NotificationStatus.READ);
        repo.save(n);
    }

    /** Overload to match controller call order `markRead(username, id)`. */
    @Transactional
    public void markRead(String username, Long id) {
        markRead(id, username);
    }

    /** Archive = delete the notification (controller calls `service.archive(...)`). */
    @Transactional
    public void archive(String username, Long id) {
        User user = userService.getUserByEmailOrUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));

        Notification n = repo.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found: " + id));
        repo.delete(n);
    }

    // ========== ADMIN METHODS ==========

    /** Find notification by ID (admin use). */
    @Transactional(readOnly = true)
    public Notification findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found: " + id));
    }

    /** Delete notification by ID (admin use). */
    @Transactional
    public void deleteById(Long id) {
        repo.deleteById(id);
    }
}
