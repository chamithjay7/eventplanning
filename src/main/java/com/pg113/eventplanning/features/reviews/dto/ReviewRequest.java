package com.pg113.eventplanning.features.reviews.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {
    private Long eventId;   // optional
    private Long vendorId;  // optional
    @Min(1) @Max(5)
    private int rating;
    @Size(max = 1000)
    private String comment;
}
