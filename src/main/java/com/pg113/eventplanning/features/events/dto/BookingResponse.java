package com.pg113.eventplanning.features.events.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record BookingResponse(
        Long id,
        String eventTitle,
        String ticketTypeName,
        Integer quantity,
        BigDecimal totalPrice,
        String status,
        Instant createdAt
) {}
