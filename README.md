# MarketHub — Multi-Vendor E-Commerce Platform v1.0.0

A full-stack portfolio application demonstrating Java 17, Spring Boot microservices, React/TypeScript, PostgreSQL, JWT/RBAC foundations, optimistic locking for inventory, idempotent payments, Docker, Flyway and an API Gateway.

## Services
API Gateway :8080 • Auth :8081 • Product :8082 • Inventory :8083 • Cart :8084 • Order :8085 • Payment :8086 • Notification :8087

## Run
1. Install Java 17, Maven 3.9+, Node 20+ and Docker.
2. `docker compose -f infra/docker-compose.yml up -d postgres redis kafka`
3. Create the service databases (or run the provided `infra/init-databases.sql`).
4. From `backend`: `mvn clean verify`
5. Run each Spring Boot module, then `cd frontend && npm install && npm run dev`.

## Important
This repository is a production-style portfolio implementation, not a claim of deployment in a regulated production environment. Before a real commercial launch, add managed secrets, TLS, real payment-provider integration, Kafka outbox/DLT, centralized authorization at the gateway, distributed tracing, rate limiting, WAF, backups, SAST/DAST, dependency scanning, load tests and operational runbooks.

## Interview topics
Microservice boundaries, JWT/RBAC, optimistic locking, idempotency, Flyway migrations, pagination, API gateway routing, transactional consistency, eventual consistency, Redis/Kafka evolution and cloud deployment.
