package com.pg113.eventplanning.features.events.service;

import com.pg113.eventplanning.features.events.dto.EventRequest;
import com.pg113.eventplanning.features.events.dto.EventResponse;
import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.events.model.EventStatus;
import com.pg113.eventplanning.features.events.repository.EventRepository;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Event> getAllActiveEvents() {
        return eventRepository.findByActiveTrue();
    }

    @Transactional
    public Event createEvent(String username, Event e) {
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        e.setOrganizer(organizer);
        e.setStatus(EventStatus.DRAFT);
        e.setActive(true);
        return eventRepository.save(e);
    }

    @Transactional
    public Event updateEvent(Long id, Event newData, String username) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!e.getOrganizer().getUsername().equals(username)) {
            throw new RuntimeException("Not allowed to edit this event");
        }

        // ✅ fixed field names
        e.setTitle(newData.getTitle());
        e.setDescription(newData.getDescription());
        e.setStartTime(newData.getStartTime());
        e.setEndTime(newData.getEndTime());
        e.setVenue(newData.getVenue());

        return e;
    }

    @Transactional
    public void deleteEvent(Long id, String username) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (!e.getOrganizer().getUsername().equals(username)) {
            throw new RuntimeException("Not allowed to delete this event");
        }
        eventRepository.delete(e);
    }

    @Transactional
    public void adminDelete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found");
        }
        eventRepository.deleteById(id);
    }

    // --- NEW: Paginated search with scope filtering ---
    @Transactional(readOnly = true)
    public Page<EventResponse> searchEvents(String q, String scope, Pageable pageable) {
        Page<Event> events;
        LocalDateTime now = LocalDateTime.now();

        if ("upcoming".equalsIgnoreCase(scope)) {
            events = eventRepository.searchUpcomingEvents(q, now, pageable);
        } else if ("past".equalsIgnoreCase(scope)) {
            events = eventRepository.searchPastEvents(q, now, pageable);
        } else {
            events = eventRepository.searchActiveEvents(q, pageable);
        }

        return events.map(this::toResponse);
    }

    // --- NEW: Get my events (for organizer) ---
    @Transactional(readOnly = true)
    public List<EventResponse> getMyEvents(String username) {
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return eventRepository.findByOrganizer(organizer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // --- NEW: Create event with DTO ---
    @Transactional
    public EventResponse createEventWithDto(String username, EventRequest request) {
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        Event event = Event.builder()
                .title(request.getName())
                .description(request.getDescription())
                .venue(request.getLocation())
                .startTime(LocalDateTime.ofInstant(request.getStartTime(), ZoneId.systemDefault()))
                .endTime(LocalDateTime.ofInstant(request.getEndTime(), ZoneId.systemDefault()))
                .status(EventStatus.DRAFT)
                .organizer(organizer)
                .active(true)
                .build();

        event = eventRepository.save(event);
        return toResponse(event);
    }

    // --- NEW: Update event with DTO ---
    @Transactional
    public EventResponse updateEventWithDto(Long id, EventRequest request, String username) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new RuntimeException("Not allowed to edit this event");
        }

        event.setTitle(request.getName());
        event.setDescription(request.getDescription());
        event.setVenue(request.getLocation());
        event.setStartTime(LocalDateTime.ofInstant(request.getStartTime(), ZoneId.systemDefault()));
        event.setEndTime(LocalDateTime.ofInstant(request.getEndTime(), ZoneId.systemDefault()));

        return toResponse(event);
    }

    // --- NEW: Publish event ---
    @Transactional
    public EventResponse publishEvent(Long id, String username) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new RuntimeException("Not allowed to publish this event");
        }

        event.setStatus(EventStatus.PUBLISHED);
        return toResponse(event);
    }

    // --- NEW: Cancel event (deletes from database) ---
    @Transactional
    public void cancelEvent(Long id, String username) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new RuntimeException("Not allowed to cancel this event");
        }

        // Delete the event from database instead of just marking as cancelled
        eventRepository.delete(event);
    }

    // --- NEW: Convert Entity to DTO ---
    private EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .name(event.getTitle())
                .description(event.getDescription())
                .location(event.getVenue())
                .startTime(event.getStartTime().atZone(ZoneId.systemDefault()).toInstant())
                .endTime(event.getEndTime().atZone(ZoneId.systemDefault()).toInstant())
                .status(event.getStatus())
                .createdAt(event.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant())
                .updatedAt(event.getUpdatedAt().atZone(ZoneId.systemDefault()).toInstant())
                .build();
    }
}
