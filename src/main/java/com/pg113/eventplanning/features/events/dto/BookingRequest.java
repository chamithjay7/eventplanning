package com.pg113.eventplanning.features.events.dto;

public record BookingRequest(
        Long eventId,
        Long ticketTypeId,
        Integer quantity
) {}
