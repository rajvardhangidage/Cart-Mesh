# Kafka Events

Topic naming convention: `ecommerce.<domain>.v1`

## Order events
- OrderCreated
- OrderCancelled
- OrderPaid
- OrderConfirmed
- OrderShipped
- OrderDelivered

## Inventory events
- InventoryReserved
- InventoryReservationFailed
- InventoryReleased
- InventoryCommitted

## Payment events
- PaymentAuthorized
- PaymentFailed
- PaymentRefunded

## Event envelope

```json
{
  "eventId": "uuid",
  "eventType": "OrderCreated",
  "occurredAt": "2026-01-01T10:00:00Z",
  "aggregateId": "order-id",
  "version": 1,
  "payload": {}
}
```

Consumers must be idempotent. Producers should use an outbox table and a publisher process so database state and event publication do not depend on a fragile dual write.
