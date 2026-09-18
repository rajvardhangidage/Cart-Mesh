# Initial API Contract

## Auth
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

## Catalog
GET /api/v1/products
GET /api/v1/products/{id}
POST /api/v1/vendors/products
PUT /api/v1/vendors/products/{id}
DELETE /api/v1/vendors/products/{id}

## Cart
GET /api/v1/cart
POST /api/v1/cart/items
PATCH /api/v1/cart/items/{productId}
DELETE /api/v1/cart/items/{productId}
DELETE /api/v1/cart

## Orders
POST /api/v1/orders/checkout
GET /api/v1/orders
GET /api/v1/orders/{id}
POST /api/v1/orders/{id}/cancel

## Payment
POST /api/v1/payments/intents
POST /api/v1/payments/{id}/confirm
POST /api/v1/payments/{id}/refund

## Admin
GET /api/v1/admin/vendors/pending
PATCH /api/v1/admin/vendors/{id}/approve
PATCH /api/v1/admin/vendors/{id}/reject
