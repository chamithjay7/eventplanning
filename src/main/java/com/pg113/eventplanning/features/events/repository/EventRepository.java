package com.pg113.eventplanning.features.events.repository;

import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.events.model.EventStatus;
import com.pg113.eventplanning.features.users.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByActiveTrue();
    List<Event> findByStatus(EventStatus status);
    List<Event> findByOrganizer(User organizer);

    // Paginated queries
    Page<Event> findByActiveTrueAndStatusOrderByStartTimeDesc(EventStatus status, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.active = true " +
           "AND (:q IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "ORDER BY e.startTime DESC")
    Page<Event> searchActiveEvents(@Param("q") String q, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.active = true " +
           "AND (:q IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND e.startTime >= :now " +
           "ORDER BY e.startTime ASC")
    Page<Event> searchUpcomingEvents(@Param("q") String q, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.active = true " +
           "AND (:q IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND e.endTime < :now " +
           "ORDER BY e.startTime DESC")
    Page<Event> searchPastEvents(@Param("q") String q, @Param("now") LocalDateTime now, Pageable pageable);
}

// event repository
