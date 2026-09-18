package com.ecommerce.common.domain;

import java.time.Instant;
import java.util.UUID;

public record EventEnvelope<T>(UUID eventId, String eventType, Instant occurredAt, String aggregateId, long version, T payload) {
    public static <T> EventEnvelope<T> of(String type, String aggregateId, T payload) {
        return new EventEnvelope<>(UUID.randomUUID(), type, Instant.now(), aggregateId, 1, payload);
    }
}
