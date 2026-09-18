package com.ecommerce.payment.service;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.math.*;
import java.util.*;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Endpoints for processing payments and payment audit history")
public class PaymentController {
    final PaymentRepository repo;

    PaymentController(PaymentRepository r) {
        repo = r;
    }

    record Req(@NotNull UUID orderId, @NotNull @Positive BigDecimal amount, @NotBlank String idempotencyKey) {}

    @PostMapping
    @Operation(summary = "Process payment", description = "Processes payment for an order with idempotency key guarantee")
    Payment pay(@RequestBody Req x) {
        return repo.findByIdempotencyKey(x.idempotencyKey()).orElseGet(() -> {
            Payment p = new Payment();
            p.setOrderId(x.orderId());
            p.setAmount(x.amount());
            p.setIdempotencyKey(x.idempotencyKey());
            return repo.save(p);
        });
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payments by order ID", description = "Retrieves payment history for a given order")
    List<Payment> byOrder(@PathVariable UUID orderId) {
        return repo.findByOrderId(orderId);
    }
}