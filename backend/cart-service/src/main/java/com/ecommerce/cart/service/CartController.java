package com.ecommerce.cart.service;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.math.*;
import java.util.*;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Endpoints for managing customer shopping cart items")
public class CartController {
    final CartRepository repo;

    CartController(CartRepository r) {
        repo = r;
    }

    record Req(
            @NotNull UUID customerId,
            @NotNull UUID productId,
            @Min(1) int quantity,
            @NotNull @Positive BigDecimal unitPrice
    ) {}

    @GetMapping("/{customerId}")
    @Operation(summary = "Get cart items", description = "Retrieves all items in the shopping cart for a given customer")
    List<CartItem> get(@PathVariable UUID customerId) {
        return repo.findByCustomerId(customerId);
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Adds a product to the cart or increments quantity if already present")
    CartItem add(@RequestBody Req x) {
        CartItem i = repo.findByCustomerIdAndProductId(x.customerId(), x.productId()).orElseGet(CartItem::new);
        i.setCustomerId(x.customerId());
        i.setProductId(x.productId());
        i.setQuantity(i.getQuantity() + x.quantity());
        i.setUnitPrice(x.unitPrice());
        return repo.save(i);
    }

    @DeleteMapping("/{customerId}")
    @Operation(summary = "Clear cart", description = "Removes all items from a customer's cart")
    @org.springframework.transaction.annotation.Transactional
    void clear(@PathVariable UUID customerId) {
        repo.deleteByCustomerId(customerId);
    }
}