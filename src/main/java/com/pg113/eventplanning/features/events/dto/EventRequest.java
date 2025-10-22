package com.pg113.eventplanning.features.events.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class EventRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 500)
    private String description;

    @NotBlank
    @Size(max = 200)
    private String location;

    @NotNull
    private Instant startTime;  // ISO-8601 string in JSON

    @NotNull
    private Instant endTime;

    // ⚠️ We do NOT expose status here — always starts as DRAFT,
    // then organizer can publish/cancel later.
    // event request
}
