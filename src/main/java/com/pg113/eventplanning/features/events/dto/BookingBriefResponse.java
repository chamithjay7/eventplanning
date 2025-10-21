package com.pg113.eventplanning.features.events.dto;

import java.time.Instant;

public record BookingBriefResponse(
        Long id,
        String eventTitle,
        String status,
        Instant createdAt
) {}
