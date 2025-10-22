package com.pg113.eventplanning.features.resources.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VenueRequest {
    @NotBlank @Size(max = 150)
    private String name;

    @NotBlank @Size(max = 300)
    private String address;

    @Size(max = 1000)
    private String description;

    private Integer capacity;
}
//evenza