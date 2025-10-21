package com.pg113.eventplanning.features.notifications.dto;

import com.pg113.eventplanning.features.notifications.model.NotificationStatus;
import com.pg113.eventplanning.features.notifications.model.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationStatus status;
    private Instant createdAt;
}
