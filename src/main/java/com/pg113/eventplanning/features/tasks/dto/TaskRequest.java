package com.pg113.eventplanning.features.tasks.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class TaskRequest {
    @NotBlank @Size(max = 200)
    private String title;
    @Size(max = 1000)
    private String description;
    private Instant dueDate;
    private Long assignedToUserId; // optional on create
    private Long eventId;          // required
}
