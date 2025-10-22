package com.pg113.eventplanning.features.tasks.dto;

import com.pg113.eventplanning.features.tasks.model.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotNull
    private TaskStatus status;
}
//UpdateStatusRequest