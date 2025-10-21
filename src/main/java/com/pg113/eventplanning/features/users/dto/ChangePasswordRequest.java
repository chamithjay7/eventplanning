package com.pg113.eventplanning.features.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChangePasswordRequest {
    @NotBlank @Size(max = 255)
    private String oldPassword;

    @NotBlank @Size(max = 255)
    private String newPassword;
}
