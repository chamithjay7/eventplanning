package com.pg113.eventplanning.features.resources.repository;

import com.pg113.eventplanning.features.resources.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    // Search venues by name or address
    List<Venue> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address);
}
//evenza