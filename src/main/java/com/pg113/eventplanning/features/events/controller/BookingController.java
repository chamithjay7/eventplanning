package com.pg113.eventplanning.features.events.controller;

import com.pg113.eventplanning.features.events.dto.BookingBriefResponse;
import com.pg113.eventplanning.features.events.dto.BookingRequest;
import com.pg113.eventplanning.features.events.dto.BookingResponse;
import com.pg113.eventplanning.features.events.repository.BookingRepository;
import com.pg113.eventplanning.features.events.service.BookingService;
import com.pg113.eventplanning.security.CurrentUserService;   // ✅ Correct import
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUser;

    /** ✅ USER: view their own bookings */
    @GetMapping("/mine")
    public List<BookingResponse> myBookings(Authentication auth) {
        var me = currentUser.require(auth);
        return bookingService.getBookingsByUser(me.getId());
    }

    /** ✅ USER: create new booking */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(Authentication auth, @RequestBody BookingRequest req) {
        var me = currentUser.require(auth);
        return bookingService.createBooking(me.getId(), req);
    }

    /** ✅ USER: get single booking details */
    @GetMapping("/{id}")
    public BookingResponse getBooking(Authentication auth, @PathVariable Long id) {
        var me = currentUser.require(auth);
        return bookingService.getBookingById(id, me.getId());
    }

    /** ✅ USER: update booking (change quantity) */
    @PutMapping("/{id}")
    public BookingResponse updateBooking(Authentication auth, @PathVariable Long id, @RequestBody BookingRequest req) {
        var me = currentUser.require(auth);
        return bookingService.updateBooking(id, me.getId(), req);
    }

    /** ✅ USER: cancel booking */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelBooking(Authentication auth, @PathVariable Long id) {
        var me = currentUser.require(auth);
        bookingService.cancelBooking(id, me.getId());
    }

    /** ✅ ADMIN: view all bookings */
    @GetMapping
    public List<BookingResponse> getAll() {
        return bookingService.getAllBookings();
    }
}
