package com.pg113.eventplanning.features.users.dto;

import com.pg113.eventplanning.features.users.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserRequest {
    @NotBlank @Size(max = 50)
    private String username;

    @NotBlank @Email @Size(max = 100)
    private String email;

    @NotBlank @Size(max = 255)
    private String password;

    // optional; defaults to USER in entity if null
    private UserRole role;
}
