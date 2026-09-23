# v1.0.0 Release Notes

Implemented functional API and UI foundation across authentication, catalog, inventory, cart, order, payment and notification domains. Added MySQL/Flyway persistence, API gateway routes, validation, optimistic inventory locking, payment idempotency, Actuator endpoints, Docker infrastructure, GitHub CI workflows and a responsive React storefront.

## Verification status
The generation environment did not contain Maven or Node dependency caches, so a full dependency-resolving build was not honestly claimable here. The source/package configuration is included for local/CI verification. Run `mvn clean verify` and `npm run build` before treating this as a release candidate.
