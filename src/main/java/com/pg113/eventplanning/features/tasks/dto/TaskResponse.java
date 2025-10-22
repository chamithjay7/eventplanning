package com.pg113.eventplanning.features.tasks.dto;

import com.pg113.eventplanning.features.tasks.model.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TaskResponse {
    private Long id;
    private Long eventId;
    private Long assignedToUserId;
    private String assignedToUsername;
    private String title;
    private String description;
    private TaskStatus status;
    private Instant dueDate;
    private Instant createdAt;
}
//TaskResponse