package com.pg113.eventplanning.features.notifications.repository;

import com.pg113.eventplanning.features.notifications.model.Notification;
import com.pg113.eventplanning.features.notifications.model.NotificationStatus;
import com.pg113.eventplanning.features.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Latest (top 20) for a user. */
    List<Notification> findTop20ByUserOrderByCreatedAtDesc(User user);

    /** All for a user, newest first — used by service.all(...) */
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    /** All unread for a user. */
    List<Notification> findByUserAndStatus(User user, NotificationStatus status);

    /** Count unread for a user. */
    long countByUserAndStatus(User user, NotificationStatus status);

    /** One by id for a user (ownership check). */
    Optional<Notification> findByIdAndUser(Long id, User user);
}
//Repo