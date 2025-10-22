package com.pg113.eventplanning.features.resources.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class VenueResponse {
    private Long id;
    private String name;
    private String address;
    private String description;
    private Integer capacity;
    private boolean approved;
    private Instant createdAt;
}
//evenza