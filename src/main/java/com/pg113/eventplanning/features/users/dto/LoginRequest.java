package com.pg113.eventplanning.features.users.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginRequest {

    // NOTE: can be the actual username OR the email; we treat it as "identifier"
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}
