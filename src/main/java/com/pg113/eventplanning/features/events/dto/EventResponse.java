package com.pg113.eventplanning.features.events.dto;

import com.pg113.eventplanning.features.events.model.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class EventResponse {
    private Long id;
    private String name;
    private String description;
    private String location;
    private Instant startTime;
    private Instant endTime;
    private EventStatus status;   // include current status
    private Instant createdAt;
    private Instant updatedAt;
}
