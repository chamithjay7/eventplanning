package com.pg113.eventplanning.features.reviews.service;

import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.events.repository.EventRepository;
import com.pg113.eventplanning.features.resources.model.Vendor;
import com.pg113.eventplanning.features.resources.repository.VendorRepository;
import com.pg113.eventplanning.features.reviews.model.Review;
import com.pg113.eventplanning.features.reviews.repository.ReviewRepository;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final UserRepository userRepo;
    private final EventRepository eventRepo;
    private final VendorRepository vendorRepo;

    public Review addReview(Long userId, Long eventId, Long vendorId, int rating, String comment) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Event event = null;
        Vendor vendor = null;

        if (eventId != null) {
            event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        }
        if (vendorId != null) {
            vendor = vendorRepo.findById(vendorId).orElseThrow(() -> new RuntimeException("Vendor not found"));
        }

        Review r = Review.builder()
                .user(user)
                .event(event)
                .vendor(vendor)
                .rating(rating)
                .comment(comment)
                .build();

        return reviewRepo.save(r);
    }

    public List<Review> reviewsForEvent(Long eventId) {
        Event e = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        return reviewRepo.findByEvent(e);
    }

    public List<Review> reviewsForVendor(Long vendorId) {
        Vendor v = vendorRepo.findById(vendorId).orElseThrow(() -> new RuntimeException("Vendor not found"));
        return reviewRepo.findByVendor(v);
    }

    public Double avgForEvent(Long eventId) {
        Event e = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        return reviewRepo.avgRatingForEvent(e);
    }

    public Double avgForVendor(Long vendorId) {
        Vendor v = vendorRepo.findById(vendorId).orElseThrow(() -> new RuntimeException("Vendor not found"));
        return reviewRepo.avgRatingForVendor(v);
    }

    public Review updateReview(Long reviewId, Long userId, int rating, String comment) {
        Review r = reviewRepo.findById(reviewId).orElseThrow(() -> new RuntimeException("Review not found"));

        // Only the author can update their review
        if (!r.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own reviews");
        }

        r.setRating(rating);
        r.setComment(comment);
        return reviewRepo.save(r);
    }

    public void deleteReview(Long reviewId, Long userId) {
        Review r = reviewRepo.findById(reviewId).orElseThrow(() -> new RuntimeException("Review not found"));

        // Only the author can delete their review
        if (!r.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        reviewRepo.delete(r);
    }
}
