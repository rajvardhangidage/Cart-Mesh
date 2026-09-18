# Architecture

React → API Gateway → domain services. Each transactional domain owns its PostgreSQL schema. Inventory uses JPA optimistic locking. Payment uses an idempotency key. Kafka is included in the infrastructure baseline for asynchronous workflows; the next hardening step is implementing transactional outbox + retry/DLT consumers.
