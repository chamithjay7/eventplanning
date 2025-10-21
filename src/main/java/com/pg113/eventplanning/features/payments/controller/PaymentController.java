package com.pg113.eventplanning.features.payments.controller;

import com.pg113.eventplanning.features.payments.model.Payment;
import com.pg113.eventplanning.features.payments.model.PaymentStatus;
import com.pg113.eventplanning.features.payments.repository.PaymentRepository;
import com.pg113.eventplanning.features.payments.service.PaymentService;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    /* Upload & review */
    @PostMapping(value = "/bookings/{bookingId}/bank-transfer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Payment uploadSlip(@PathVariable Long bookingId, @RequestPart("file") MultipartFile file)
            throws IOException {
        if (file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        return paymentService.uploadSlip(bookingId, file);
    }

    @PostMapping("/{paymentId}/approve")
    public Payment approve(@PathVariable Long paymentId, Authentication auth) {
        if (auth == null || auth.getName() == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return paymentService.approvePayment(paymentId, auth.getName());
    }

    @PostMapping("/{paymentId}/reject")
    public Payment reject(@PathVariable Long paymentId, Authentication auth) {
        if (auth == null || auth.getName() == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return paymentService.rejectPayment(paymentId, auth.getName());
    }

    /* Lists used by UI */
    @GetMapping
    public List<Payment> listByStatus(@RequestParam(required = false) PaymentStatus status) {
        if (status != null) return paymentRepository.findByStatus(status);
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/admin")
    public List<Payment> adminList() {
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/mine")
    public List<Payment> myPayments(Authentication auth) {
        if (auth == null || auth.getName() == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        User me = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return paymentRepository.findAllByPayerOrderByCreatedAtDesc(me);
    }

    /* Dashboard summary */
    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        long pending = paymentRepository.countByStatus(PaymentStatus.PENDING);
        long approved = paymentRepository.countByStatus(PaymentStatus.APPROVED);
        long rejected = paymentRepository.countByStatus(PaymentStatus.REJECTED);

        BigDecimal totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.APPROVED)
                .map(p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "pending", pending,
                "approved", approved,
                "rejected", rejected,
                "totalRevenue", totalRevenue
        );
    }
}
