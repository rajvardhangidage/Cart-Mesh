package com.ecommerce.notification.service;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for creating, listing, and acknowledging user notifications")
public class NotificationController {
    final NotificationRepository repo;

    NotificationController(NotificationRepository r) {
        repo = r;
    }

    record Req(@NotNull UUID userId, @NotBlank String type, @NotBlank String message) {}

    @PostMapping
    @Operation(summary = "Create notification", description = "Dispatches a new user notification")
    Notification create(@RequestBody Req x) {
        Notification n = new Notification();
        n.setUserId(x.userId());
        n.setType(x.type());
        n.setMessage(x.message());
        return repo.save(n);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "List user notifications", description = "Retrieves all notifications for a user, ordered from newest to oldest")
    List<Notification> list(@PathVariable UUID userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks a specific notification as acknowledged/read")
    Notification read(@PathVariable UUID id) {
        Notification n = repo.findById(id).orElseThrow();
        n.setReadFlag(true);
        return repo.save(n);
    }
}