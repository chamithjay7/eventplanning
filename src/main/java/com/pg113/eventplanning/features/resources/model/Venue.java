package com.pg113.eventplanning.features.resources.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "venues")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Venue {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank @Size(max = 300)
    @Column(nullable = false, length = 300)
    private String address;

    @Size(max = 1000)
    private String description;

    private Integer capacity;

    @Column(nullable = false)
    private boolean approved = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}
//evenza