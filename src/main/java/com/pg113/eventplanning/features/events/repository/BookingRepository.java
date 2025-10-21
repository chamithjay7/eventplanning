package com.pg113.eventplanning.features.events.repository;

import com.pg113.eventplanning.features.events.model.Booking;
import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.events.model.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * ✅ Returns all bookings belonging to a specific user.
     * Automatically uses the user_id foreign key from Booking entity.
     */
    List<Booking> findByUserId(Long userId);

    /**
     * ✅ Optional: returns all bookings of a user ordered by creation time (most recent first)
     */
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * ✅ Returns all bookings for a specific event and ticket type
     */
    List<Booking> findByEventAndTicketType(Event event, TicketType ticketType);
}
