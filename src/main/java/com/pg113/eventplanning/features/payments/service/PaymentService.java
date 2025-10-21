package com.pg113.eventplanning.features.payments.service;

import com.pg113.eventplanning.features.events.model.Booking;
import com.pg113.eventplanning.features.events.model.BookingStatus;
import com.pg113.eventplanning.features.events.repository.BookingRepository;
import com.pg113.eventplanning.features.payments.model.*;
import com.pg113.eventplanning.features.payments.repository.PaymentRepository;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/slips";

    /** User uploads a bank-transfer slip */
    @Transactional
    public Payment uploadSlip(Long bookingId, MultipartFile file) throws IOException {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        // Create upload directory if not exists
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();

        // Generate unique filename
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        File dest = new File(dir, fileName);
        file.transferTo(dest);

        Payment payment = Payment.builder()
                .booking(booking)
                .event(booking.getEvent())
                .payer(booking.getUser())
                .method(PaymentMethod.BANK_TRANSFER)
                .status(PaymentStatus.PENDING)
                .amount(booking.getTicketType().getPrice()
                        .multiply(java.math.BigDecimal.valueOf(booking.getQuantity())))
                .slipPath("/" + UPLOAD_DIR + "/" + fileName)
                .createdAt(Instant.now())
                .build();

        return paymentRepository.save(payment);
    }

    /** Admin approves payment */
    @Transactional
    public Payment approvePayment(Long paymentId, String reviewerEmail) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found"));

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new EntityNotFoundException("Reviewer not found"));

        payment.setReviewedBy(reviewer);
        payment.setReviewedAt(Instant.now());
        payment.setStatus(PaymentStatus.APPROVED);
        paymentRepository.save(payment);

        // Update related booking
        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return payment;
    }

    /** Admin rejects payment */
    @Transactional
    public Payment rejectPayment(Long paymentId, String reviewerEmail) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found"));

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new EntityNotFoundException("Reviewer not found"));

        payment.setReviewedBy(reviewer);
        payment.setReviewedAt(Instant.now());
        payment.setStatus(PaymentStatus.REJECTED);
        paymentRepository.save(payment);

        // Update related booking
        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        return payment;
    }
}
