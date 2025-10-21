package com.pg113.eventplanning.features.reviews.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class ReviewResponse {
    Long id;
    Long eventId;
    Long vendorId;
    int rating;
    String comment;

    /** 👇 add this field */
    String authorUsername;

    Instant createdAt;
}
