package com.pg113.eventplanning.features.notifications.dto;

import com.pg113.eventplanning.features.notifications.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NotificationRequest {
    private Long userId;                 // required: recipient user id
    private Long eventId;                // optional: related event
    @NotBlank private String title;      // required
    @NotBlank private String message;    // required
    private NotificationType type = NotificationType.GENERAL;
}
