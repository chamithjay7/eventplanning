package com.pg113.eventplanning.features.users.controller;

import com.pg113.eventplanning.features.users.dto.*;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.service.UserService;
import com.pg113.eventplanning.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    // ✅ Registration (public)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody UserRequest req) {
        User u = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(req.getPassword())
                .role(req.getRole())
                .build();
        u = userService.create(u);
        return toUserResponse(u);
    }

    // ✅ Get current user (authenticated user)
    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication auth) {
        User u = currentUserService.require(auth);
        return toUserResponse(u);
    }

    // ✅ Update current user (authenticated user)
    @PutMapping("/me")
    public UserResponse updateCurrentUser(Authentication auth, @Valid @RequestBody UpdateUserRequest req) {
        User currentUser = currentUserService.require(auth);
        User updated = userService.update(currentUser.getId(), req);
        return toUserResponse(updated);
    }

    // ✅ List all users (ADMIN only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q
    ) {
        return userService.search(q, PageRequest.of(page, size)).map(this::toUserResponse);
    }

    // ✅ Get simple list of users for task assignment (ORGANIZER and ADMIN)
    @GetMapping("/simple")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public java.util.List<UserResponse> getSimpleList() {
        return userService.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    // ✅ Get user by ID (ADMIN or self)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal?.id")
    public UserResponse get(@PathVariable Long id) {
        User u = userService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserResponse(u);
    }

    // ✅ Update user (ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) {
        User updated = userService.update(id, req);
        return toUserResponse(updated);
    }

    // ✅ Delete user (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }

    // ✅ Change password (self)
    @PostMapping("/change-password")
    public void changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest req) {
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        userService.changePassword(auth.getName(), req.getOldPassword(), req.getNewPassword());
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
