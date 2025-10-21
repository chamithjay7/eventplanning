package com.pg113.eventplanning.features.reviews.controller;

import com.pg113.eventplanning.features.reviews.dto.ReviewRequest;
import com.pg113.eventplanning.features.reviews.dto.ReviewResponse;
import com.pg113.eventplanning.features.reviews.model.Review;
import com.pg113.eventplanning.features.reviews.service.ReviewService;
import com.pg113.eventplanning.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserService currentUser; // resolves by email or username

    // Add a review (logged-in user)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse add(@RequestBody @Valid ReviewRequest req, Authentication auth) {
        var user = currentUser.require(auth);               // <-- no Optional, always a User
        Review r = reviewService.addReview(
                user.getId(),
                req.getEventId(),
                req.getVendorId(),
                req.getRating(),
                req.getComment()
        );
        return toResponse(r);
    }

    // Get reviews for an event
    @GetMapping("/event/{eventId}")
    public List<ReviewResponse> forEvent(@PathVariable Long eventId) {
        return reviewService.reviewsForEvent(eventId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get reviews for a vendor
    @GetMapping("/vendor/{vendorId}")
    public List<ReviewResponse> forVendor(@PathVariable Long vendorId) {
        return reviewService.reviewsForVendor(vendorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Update a review (only by author)
    @PutMapping("/{id}")
    public ReviewResponse update(@PathVariable Long id, @RequestBody @Valid ReviewRequest req, Authentication auth) {
        var user = currentUser.require(auth);
        Review r = reviewService.updateReview(id, user.getId(), req.getRating(), req.getComment());
        return toResponse(r);
    }

    // Delete a review (only by author or admin)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        var user = currentUser.require(auth);
        reviewService.deleteReview(id, user.getId());
    }

    /* ---------- mapper ---------- */
    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .eventId(r.getEvent() != null ? r.getEvent().getId() : null)
                .vendorId(r.getVendor() != null ? r.getVendor().getId() : null)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .authorUsername(r.getUser() != null ? r.getUser().getUsername() : null)
                .build();
    }
}
