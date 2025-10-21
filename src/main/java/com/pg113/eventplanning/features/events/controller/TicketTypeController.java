package com.pg113.eventplanning.features.events.controller;

import com.pg113.eventplanning.features.events.dto.TicketTypeRequest;
import com.pg113.eventplanning.features.events.dto.TicketTypeResponse;
import com.pg113.eventplanning.features.events.service.TicketingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/events/{eventId}/ticket-types", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class TicketTypeController {

    private final TicketingService ticketingService;

    @GetMapping
    public List<TicketTypeResponse> getByEvent(@PathVariable Long eventId) {
        return ticketingService.getTicketTypesByEvent(eventId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketTypeResponse create(@PathVariable Long eventId, @Valid @RequestBody TicketTypeRequest request, Authentication auth) {
        return ticketingService.createTicketType(eventId, request, auth.getName());
    }

    @DeleteMapping("/{ticketTypeId}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long eventId, @PathVariable Long ticketTypeId, Authentication auth) {
        ticketingService.deleteTicketType(eventId, ticketTypeId, auth.getName());
    }
}
