package com.pg113.eventplanning.features.resources.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class VendorResponse {
    private Long id;
    private String name;
    private String category;
    private String address;
    private String email;
    private String phone;
    private String description;
    private boolean approved;
    private Instant createdAt;
}
//evenza