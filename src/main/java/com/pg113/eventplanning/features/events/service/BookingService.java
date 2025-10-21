package com.pg113.eventplanning.features.events.service;

import com.pg113.eventplanning.features.events.dto.BookingRequest;
import com.pg113.eventplanning.features.events.dto.BookingResponse;
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
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final UserRepository userRepository;

    /** ✅ Create a booking for a given user, event, and ticket type */
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Event event = eventRepository.findById(req.eventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        TicketType ticketType = ticketTypeRepository.findById(req.ticketTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Ticket type not found"));

        if (req.quantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
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

    /** ✅ List all bookings of a specific user (only CONFIRMED) */
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUser(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)  // Only show CONFIRMED bookings
                .map(b -> {
                    // Debug: Force load ticketType
                    TicketType tt = b.getTicketType();
                    String ttName = tt != null ? tt.getName() : "Unknown";
                    Integer qty = b.getQuantity() != null ? b.getQuantity() : 0;
                    java.math.BigDecimal price = b.getTotalPrice() != null ? b.getTotalPrice() : java.math.BigDecimal.ZERO;

                    System.out.println("DEBUG Booking #" + b.getId() +
                        " - Ticket: " + ttName +
                        ", Qty: " + qty +
                        ", Price: " + price);

                    return new BookingResponse(
                            b.getId(),
                            b.getEvent().getTitle(),
                            ttName,
                            qty,
                            price,
                            b.getStatus().name(),
                            b.getCreatedAt()
                    );
                })
                .toList();
    }

    /** ✅ Get single booking by ID (only by owner) */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot view this booking");
        }

        return new BookingResponse(
                booking.getId(),
                booking.getEvent().getTitle(),
                booking.getTicketType().getName(),
                booking.getQuantity(),
                booking.getTotalPrice(),
                booking.getStatus().name(),
                booking.getCreatedAt()
        );
    }

    /** ✅ Update booking (change quantity) */
    @Transactional
    public BookingResponse updateBooking(Long bookingId, Long userId, BookingRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot update this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot update a cancelled booking");
        }

        // Validate new quantity
        if (req.quantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        TicketType ticketType = booking.getTicketType();
        if (req.quantity() > ticketType.getCapacity()) {
            throw new RuntimeException("Not enough tickets available");
        }

        // Update quantity and recalculate price
        booking.setQuantity(req.quantity());
        var newTotalPrice = ticketType.getPrice().multiply(java.math.BigDecimal.valueOf(req.quantity()));
        booking.setTotalPrice(newTotalPrice);
        bookingRepository.save(booking);

        return new BookingResponse(
                booking.getId(),
                booking.getEvent().getTitle(),
                ticketType.getName(),
                booking.getQuantity(),
                booking.getTotalPrice(),
                booking.getStatus().name(),
                booking.getCreatedAt()
        );
    }

    /** ✅ Cancel a booking (only by its owner) */
    @Transactional
    public void cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    /** ✅ Admin: view all bookings */
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(b -> new BookingResponse(
                        b.getId(),
                        b.getEvent().getTitle(),
                        b.getTicketType().getName(),
                        b.getQuantity(),
                        b.getTotalPrice(),
                        b.getStatus().name(),
                        b.getCreatedAt()
                ))
                .toList();
    }
}
