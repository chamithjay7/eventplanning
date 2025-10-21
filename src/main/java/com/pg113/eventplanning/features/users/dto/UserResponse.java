package com.pg113.eventplanning.features.users.dto;

import com.pg113.eventplanning.features.users.model.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private Instant createdAt;
}
