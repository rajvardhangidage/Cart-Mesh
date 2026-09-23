// Auth Types
export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  enabled?: boolean;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  role: UserRole;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  role: UserRole;
}

// Product Types
export interface Product {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  sku: string;
  description?: string;
  price: number;
  active: boolean;
  createdAt: string;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CreateProductPayload {
  vendorId: string;
  name: string;
  category: string;
  sku: string;
  description?: string;
  price: number;
}

export interface UpdateProductPayload {
  vendorId: string;
  name: string;
  category: string;
  sku: string;
  description?: string;
  price: number;
}

// Inventory Types
export interface Inventory {
  id: string;
  productId: string;
  available: number;
  version: number;
}

export interface CreateInventoryPayload {
  productId: string;
  quantity: number;
}

// Cart Types
export interface CartItem {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface AddCartItemPayload {
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

// Order Types
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  customerId: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderPayload {
  customerId: string;
  total: number;
}

// Payment Types
export type PaymentStatus = 'CAPTURED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  amount: number;
  idempotencyKey: string;
}

// Notification Types
export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  message: string;
  readFlag: boolean;
  createdAt: string;
}

export interface CreateNotificationPayload {
  userId: string;
  type: string;
  message: string;
}

// API Error Response
export interface ApiError {
  timestamp?: string;
  error?: string;
  message?: string;
  status?: number;
}
