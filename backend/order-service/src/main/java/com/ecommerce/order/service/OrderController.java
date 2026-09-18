package com.ecommerce.order.service;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.math.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Endpoints for placing orders, retrieving order history, and tracking order status")
public class OrderController {
    final OrderRepository repo;

    OrderController(OrderRepository r) {
        repo = r;
    }

    record Req(@NotNull UUID customerId, @NotNull @Positive BigDecimal total) {}

    @PostMapping
    @Operation(summary = "Create order", description = "Places a new customer order")
    Order create(@RequestBody Req x) {
        Order o = new Order();
        o.setCustomerId(x.customerId());
        o.setTotal(x.total());
        return repo.save(o);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieves order details for a specific order UUID")
    Order get(@PathVariable UUID id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("Order not found"));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get customer orders", description = "Retrieves all orders placed by a specific customer, ordered by newest first")
    List<Order> mine(@PathVariable UUID customerId) {
        return repo.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Updates order status (e.g., PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)")
    Order status(@PathVariable UUID id, @RequestParam Order.Status value) {
        Order o = get(id);
        o.setStatus(value);
        return repo.save(o);
    }
}