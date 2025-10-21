package com.pg113.eventplanning.features.events.repository;

import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.events.model.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
    List<TicketType> findByEvent(Event event);
}
