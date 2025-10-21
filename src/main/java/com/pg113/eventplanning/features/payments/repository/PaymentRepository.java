package com.pg113.eventplanning.features.payments.repository;

import com.pg113.eventplanning.features.payments.model.Payment;
import com.pg113.eventplanning.features.payments.model.PaymentStatus;
import com.pg113.eventplanning.features.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByPayerOrderByCreatedAtDesc(User payer);
    List<Payment> findAllByOrderByCreatedAtDesc();
    List<Payment> findByStatus(PaymentStatus status);
    long countByStatus(PaymentStatus status);
}
