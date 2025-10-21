package com.pg113.eventplanning.features.resources.controller;

import com.pg113.eventplanning.features.resources.dto.VendorRequest;
import com.pg113.eventplanning.features.resources.dto.VendorResponse;
import com.pg113.eventplanning.features.resources.model.Vendor;
import com.pg113.eventplanning.features.resources.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    // Create vendor profile (vendor user or admin)
    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public VendorResponse create(@RequestBody @jakarta.validation.Valid VendorRequest req,
                                 Authentication auth) {
        Vendor saved = vendorService.create(toEntity(req), auth.getName());
        return toResponse(saved);
    }

    // List/search (public)
    @GetMapping
    public List<VendorResponse> list(@RequestParam(required = false) String q) {
        List<Vendor> vendors = (q != null && !q.isBlank())
                ? vendorService.search(q)
                : vendorService.findAll();
        return vendors.stream().map(this::toResponse).toList();
    }

    // Get one (public)
    @GetMapping("/{id}")
    public VendorResponse getOne(@PathVariable Long id) {
        return toResponse(vendorService.findById(id));
    }

    // Update vendor (owner or admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
    public VendorResponse update(@PathVariable Long id,
                                 @RequestBody @jakarta.validation.Valid VendorRequest req,
                                 Authentication auth) {
        Vendor updated = vendorService.updateOwned(id, toEntity(req), auth.getName());
        return toResponse(updated);
    }

    // Approve vendor (admin only)
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public VendorResponse approve(@PathVariable Long id) {
        return toResponse(vendorService.approve(id));
    }

    // Delete vendor (owner or admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        vendorService.deleteOwned(id, auth.getName());
    }

    // --- mappers ---
    private Vendor toEntity(VendorRequest r) {
        return Vendor.builder()
                .name(r.getName())
                .category(r.getCategory())
                .address(r.getAddress())
                .email(r.getEmail())
                .phone(r.getPhone())
                .description(r.getDescription())
                .build();
    }

    private VendorResponse toResponse(Vendor v) {
        return VendorResponse.builder()
                .id(v.getId())
                .name(v.getName())
                .category(v.getCategory())
                .address(v.getAddress())
                .email(v.getEmail())
                .phone(v.getPhone())
                .description(v.getDescription())
                .approved(v.isApproved())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
