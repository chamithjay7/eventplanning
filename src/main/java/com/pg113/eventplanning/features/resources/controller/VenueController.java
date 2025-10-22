package com.pg113.eventplanning.features.resources.controller;

import com.pg113.eventplanning.features.resources.dto.VenueRequest;
import com.pg113.eventplanning.features.resources.dto.VenueResponse;
import com.pg113.eventplanning.features.resources.model.Venue;
import com.pg113.eventplanning.features.resources.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    // Create new venue (self-register by vendor)
    @PostMapping
    public VenueResponse create(@RequestBody @jakarta.validation.Valid VenueRequest req) {
        var saved = venueService.create(toEntity(req));
        return toResponse(saved);
    }

    // List/search venues
    @GetMapping
    public List<VenueResponse> list(@RequestParam(required = false) String q) {
        List<Venue> venues = (q != null && !q.isBlank())
                ? venueService.search(q)
                : venueService.findAll();
        return venues.stream().map(this::toResponse).toList();
    }

    // Get one venue
    @GetMapping("/{id}")
    public VenueResponse getOne(@PathVariable Long id) {
        return toResponse(venueService.findById(id));
    }

    // Update
    @PutMapping("/{id}")
    public VenueResponse update(@PathVariable Long id,
                                @RequestBody @jakarta.validation.Valid VenueRequest req) {
        var updated = venueService.update(id, toEntity(req));
        return toResponse(updated);
    }

    // Approve venue (Admin only)
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public VenueResponse approve(@PathVariable Long id) {
        return toResponse(venueService.approve(id));
    }

    // Delete
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        venueService.delete(id);
    }

    // --- mappers ---
    private Venue toEntity(VenueRequest r) {
        return Venue.builder()
                .name(r.getName())
                .address(r.getAddress())
                .description(r.getDescription())
                .capacity(r.getCapacity())
                .build();
    }

    private VenueResponse toResponse(Venue v) {
        return VenueResponse.builder()
                .id(v.getId())
                .name(v.getName())
                .address(v.getAddress())
                .description(v.getDescription())
                .capacity(v.getCapacity())
                .approved(v.isApproved())
                .createdAt(v.getCreatedAt())
                .build();
        //evenza
    }
}
