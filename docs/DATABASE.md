# Domain / Database Model

## Auth DB
- users(id, email, password_hash, status, created_at, updated_at)
- roles(id, name)
- user_roles(user_id, role_id)
- refresh_tokens(id, user_id, token_hash, expires_at, revoked_at, created_at)

## Product DB
- vendors(id, user_id, business_name, status, created_at)
- categories(id, parent_id, name, slug)
- products(id, vendor_id, category_id, sku, name, description, price, currency, status, created_at, updated_at)
- product_images(id, product_id, url, sort_order)

Indexes: product(sku), product(vendor_id,status), product(category_id,status), category(slug).

## Inventory DB
- inventory(id, product_id, available_qty, reserved_qty, version, updated_at)
- reservations(id, order_id, product_id, quantity, status, expires_at, created_at)

Unique: inventory(product_id). Index reservation(order_id,status).

## Cart DB / Redis
Redis key: `cart:{customerId}`

Cart item fields: productId, quantity, unitPriceSnapshot.

Persistent checkout snapshot is stored by Order Service; the cart is not treated as the financial source of truth.

## Order DB
- orders(id, customer_id, status, currency, subtotal, tax, shipping_fee, total, shipping_address_json, idempotency_key, created_at, updated_at)
- order_items(id, order_id, product_id, vendor_id, sku, product_name_snapshot, unit_price, quantity, line_total)
- order_status_history(id, order_id, from_status, to_status, reason, created_at)

Unique: orders(customer_id,idempotency_key).

## Payment DB
- payment_intents(id, order_id, customer_id, amount, currency, provider, provider_reference, status, idempotency_key, created_at, updated_at)
- payment_events(id, payment_intent_id, event_id, event_type, payload_json, created_at)

Unique: payment_intents(idempotency_key), payment_events(event_id).

## Notification DB
- notifications(id, recipient_user_id, event_id, type, title, body, read_at, created_at)

Unique: notifications(event_id, recipient_user_id).
