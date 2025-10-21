package com.pg113.eventplanning.features.tasks.dto;

import com.pg113.eventplanning.features.tasks.model.TaskStatus;
import lombok.Data;

import java.time.Instant;

@Data
public class UpdateTaskRequest {
    private String title;
    private String description;
    private Instant dueDate;
    private TaskStatus status;     // optional
    private Long assignedToUserId; // optional
}

