package com.pg113.eventplanning.features.reviews.repository;

import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.resources.model.Vendor;
import com.pg113.eventplanning.features.reviews.model.Review;
import com.pg113.eventplanning.features.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByEvent(Event event);
    List<Review> findByVendor(Vendor vendor);
    List<Review> findByUser(User user);

    @Query("select avg(r.rating) from Review r where r.event = :event")
    Double avgRatingForEvent(Event event);

    @Query("select avg(r.rating) from Review r where r.vendor = :vendor")
    Double avgRatingForVendor(Vendor vendor);
}
