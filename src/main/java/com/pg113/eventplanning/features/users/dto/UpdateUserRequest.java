package com.pg113.eventplanning.features.users.dto;

import com.pg113.eventplanning.features.users.model.UserRole;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    // Optional: current/target email (controller may use either "email" or "newEmail")
    private String email;

    @Email
    private String newEmail;

    // Optional password update (service checks for non-blank)
    private String password;

    // Optional role update
    private UserRole role;
}
