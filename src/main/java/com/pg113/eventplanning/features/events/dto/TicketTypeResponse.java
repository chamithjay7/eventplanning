package com.pg113.eventplanning.features.events.dto;

import java.math.BigDecimal;

public record TicketTypeResponse(
        Long id,
        String name,
        BigDecimal price,
        Integer capacity,
        Integer sold
) {}
