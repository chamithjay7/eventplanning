package com.pg113.eventplanning.features.payments.dto;

import com.pg113.eventplanning.features.payments.model.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull
    private Long bookingId;

    @NotNull
    private PaymentMethod method;   // ENUM in JSON: "CARD" | "CASH" | "BANK"

    @NotNull @Min(0)
    private BigDecimal amount;

    private String reference;       // optional: txn id, etc.
}
