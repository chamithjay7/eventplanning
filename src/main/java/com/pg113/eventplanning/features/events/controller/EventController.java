package com.pg113.eventplanning.features.events.controller;

import com.pg113.eventplanning.features.events.dto.EventRequest;
import com.pg113.eventplanning.features.events.dto.EventResponse;
import com.pg113.eventplanning.features.events.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // Public - list/search all events with pagination
    @GetMapping
    public Page<EventResponse> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String scope
    ) {
        return eventService.searchEvents(q, scope, PageRequest.of(page, size));
    }

    // Organizer - get my events
    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public List<EventResponse> getMyEvents(Authentication auth) {
        return eventService.getMyEvents(auth.getName());
    }

    // Organizer - create event
    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(Authentication auth, @Valid @RequestBody EventRequest request) {
        return eventService.createEventWithDto(auth.getName(), request);
    }

    // Organizer - update event
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventRequest request, Authentication auth) {
        return eventService.updateEventWithDto(id, request, auth.getName());
    }

    // Organizer - publish event
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public EventResponse publish(@PathVariable Long id, Authentication auth) {
        return eventService.publishEvent(id, auth.getName());
    }

    // Organizer - cancel event (deletes from database)
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable Long id, Authentication auth) {
        eventService.cancelEvent(id, auth.getName());
    }

    // Organizer - delete own event
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        eventService.deleteEvent(id, auth.getName());
    }

    // Admin - delete any event
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void adminDelete(@PathVariable Long id) {
        eventService.adminDelete(id);
    }
}
