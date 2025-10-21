package com.pg113.eventplanning.features.resources.repository;

import com.pg113.eventplanning.features.resources.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    // Search by name or category
    List<Vendor> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String name, String category);
}
