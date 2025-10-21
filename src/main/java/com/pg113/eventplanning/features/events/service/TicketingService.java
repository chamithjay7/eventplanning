package com.pg113.eventplanning.features.events.service;

import com.pg113.eventplanning.features.events.dto.BookingRequest;
import com.pg113.eventplanning.features.events.dto.BookingResponse;
import com.pg113.eventplanning.features.events.dto.TicketTypeRequest;
import com.pg113.eventplanning.features.events.dto.TicketTypeResponse;
import com.pg113.eventplanning.features.events.model.*;
import com.pg113.eventplanning.features.events.repository.*;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserRepository userRepository;

    /** ✅ Return DTO list instead of entities. */
    @Transactional(readOnly = true)
    public List<TicketTypeResponse> getTicketTypesByEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        return ticketTypeRepository.findByEvent(event)
                .stream()
                .map(t -> {
                    // Calculate how many tickets have been sold (confirmed bookings only)
                    int sold = bookingRepository.findByEventAndTicketType(event, t)
                            .stream()
                            .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                            .mapToInt(Booking::getQuantity)
                            .sum();

                    return new TicketTypeResponse(
                            t.getId(),
                            t.getName(),
                            t.getPrice(),
                            t.getCapacity(),
                            sold
                    );
                })
                .toList();
    }

    /** ✅ Book tickets for a given event and ticket type. */
    @Transactional
    public BookingResponse bookTickets(Long userId, BookingRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Event event = eventRepository.findById(req.eventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        TicketType ticketType = ticketTypeRepository.findById(req.ticketTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Ticket type not found"));

        // validate requested quantity
        if (req.quantity() > ticketType.getCapacity()) {
            throw new RuntimeException("Not enough tickets available for this type");
        }

        // Calculate total price
        var totalPrice = ticketType.getPrice().multiply(java.math.BigDecimal.valueOf(req.quantity()));

        Booking booking = new Booking();
        booking.setEvent(event);
        booking.setTicketType(ticketType);
        booking.setUser(user);
        booking.setQuantity(req.quantity());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return new BookingResponse(
                booking.getId(),
                event.getTitle(),
                ticketType.getName(),
                booking.getQuantity(),
                booking.getTotalPrice(),
                booking.getStatus().name(),
                booking.getCreatedAt()
        );
    }

    /** ✅ Cancel booking by user. */
    @Transactional
    public void cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
    }

    /** ✅ Create ticket type for an event */
    @Transactional
    public TicketTypeResponse createTicketType(Long eventId, TicketTypeRequest request, String username) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        // Check if user is the organizer of this event
        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new RuntimeException("You are not allowed to add ticket types to this event");
        }

        TicketType ticketType = new TicketType();
        ticketType.setEvent(event);
        ticketType.setName(request.getName());
        ticketType.setPrice(request.getPrice());
        ticketType.setCapacity(request.getCapacity());

        ticketType = ticketTypeRepository.save(ticketType);

        return new TicketTypeResponse(
                ticketType.getId(),
                ticketType.getName(),
                ticketType.getPrice(),
                ticketType.getCapacity(),
                0  // No tickets sold yet
        );
    }

    /** ✅ Delete ticket type */
    @Transactional
    public void deleteTicketType(Long eventId, Long ticketTypeId, String username) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new RuntimeException("You are not allowed to delete ticket types from this event");
        }

        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket type not found"));

        if (!ticketType.getEvent().getId().equals(eventId)) {
            throw new RuntimeException("Ticket type does not belong to this event");
        }

        ticketTypeRepository.delete(ticketType);
    }
}
