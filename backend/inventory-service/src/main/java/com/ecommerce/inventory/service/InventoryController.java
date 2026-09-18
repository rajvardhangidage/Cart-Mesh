package com.ecommerce.inventory.service;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.http.*;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Endpoints for inventory stock lookup, creation, reservation, and release")
public class InventoryController {
    final InventoryRepository repo;

    InventoryController(InventoryRepository r) {
        repo = r;
    }

    record Req(@NotNull UUID productId, @Min(0) int quantity) {}

    @GetMapping("/{productId}")
    @Operation(summary = "Get stock by product ID", description = "Retrieves current available inventory for a product")
    public Inventory get(@PathVariable UUID productId) {
        return repo.findByProductId(productId).orElseThrow(() -> new NoSuchElementException("Inventory not found"));
    }

    @PostMapping
    @Operation(summary = "Create or initialize inventory", description = "Sets initial stock level for a product")
    public ResponseEntity<Inventory> create(@RequestBody Req x) {
        Inventory i = new Inventory();
        i.setProductId(x.productId());
        i.setAvailable(x.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(i));
    }

    @PostMapping("/{productId}/reserve")
    @Operation(summary = "Reserve inventory", description = "Reserves a given quantity of inventory for an order")
    public Inventory reserve(@PathVariable UUID productId, @RequestParam @Min(1) int quantity) {
        Inventory i = get(productId);
        if (i.getAvailable() < quantity) {
            throw new IllegalStateException("Insufficient inventory");
        }
        i.setAvailable(i.getAvailable() - quantity);
        return repo.save(i);
    }

    @PostMapping("/{productId}/release")
    @Operation(summary = "Release inventory", description = "Releases previously reserved inventory back to available stock")
    public Inventory release(@PathVariable UUID productId, @RequestParam @Min(1) int quantity) {
        Inventory i = get(productId);
        i.setAvailable(i.getAvailable() + quantity);
        return repo.save(i);
    }
}