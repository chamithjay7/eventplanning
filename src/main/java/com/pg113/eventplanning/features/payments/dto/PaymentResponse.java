package com.pg113.eventplanning.features.payments.dto;

import com.pg113.eventplanning.features.payments.model.PaymentMethod;
import com.pg113.eventplanning.features.payments.model.PaymentStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;

@Value
@Builder
public class PaymentResponse {
    Long id;
    Long bookingId;
    Long eventId;
    String payerUsername;

    PaymentMethod method;
    BigDecimal amount;
    PaymentStatus status;
    String reference;

    Instant createdAt;
    Instant updatedAt;
}
