package com.pg113.eventplanning.features.resources.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VendorRequest {

    @NotBlank @Size(max = 150)
    private String name;

    @NotBlank @Size(max = 100)
    private String category;

    @Size(max = 300)
    private String address;

    @Email @Size(max = 120)
    private String email;

    @Size(max = 40)
    private String phone;

    @Size(max = 1000)
    private String description;
}
//evenza