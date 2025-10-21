package com.pg113.eventplanning.features.events.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TicketTypeRequest {
    @NotBlank @Size(max = 100) private String name;
    @NotNull private BigDecimal price;
    @NotNull @Min(1) private Integer capacity;
}
