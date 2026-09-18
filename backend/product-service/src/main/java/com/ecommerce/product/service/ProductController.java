package com.ecommerce.product.service;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Endpoints for managing products and catalog search")
public class ProductController {
    private final ProductRepository repo;

    public ProductController(ProductRepository r) {
        repo = r;
    }

    record Req(
            @NotNull UUID vendorId,
            @NotBlank String name,
            @NotBlank String category,
            @NotBlank String sku,
            @Size(max = 2000) String description,
            @NotNull @Positive BigDecimal price
    ) {}

    @GetMapping
    @Operation(summary = "List and search products", description = "Returns a paginated list of active products matching search keyword")
    public Page<Product> list(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return repo.findByActiveTrueAndNameContainingIgnoreCase(
                q,
                PageRequest.of(Math.max(page, 0), Math.min(size, 100), Sort.by("createdAt").descending())
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieves product details for the specified product UUID")
    public Product get(@PathVariable UUID id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("Product not found"));
    }

    @PostMapping
    @Operation(summary = "Create product", description = "Adds a new product to the catalog")
    public ResponseEntity<Product> create(@Valid @RequestBody Req x) {
        Product p = new Product();
        p.setVendorId(x.vendorId());
        p.setName(x.name());
        p.setCategory(x.category());
        p.setSku(x.sku());
        p.setDescription(x.description());
        p.setPrice(x.price());
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(p));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Updates an existing product by UUID")
    public Product update(@PathVariable UUID id, @Valid @RequestBody Req x) {
        Product p = get(id);
        p.setVendorId(x.vendorId());
        p.setName(x.name());
        p.setCategory(x.category());
        p.setSku(x.sku());
        p.setDescription(x.description());
        p.setPrice(x.price());
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete product", description = "Soft-deletes a product by marking it inactive")
    public void delete(@PathVariable UUID id) {
        Product p = get(id);
        p.setActive(false);
        repo.save(p);
    }
}