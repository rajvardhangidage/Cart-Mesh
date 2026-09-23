import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Customer Storefront Pages
import { CatalogPage } from "@/pages/storefront/CatalogPage";
import { ProductDetailPage } from "@/pages/storefront/ProductDetailPage";
import { CartPage } from "@/pages/cart/CartPage";
import { CheckoutPage } from "@/pages/checkout/CheckoutPage";
import { OrdersListPage } from "@/pages/orders/OrdersListPage";
import { OrderDetailPage } from "@/pages/orders/OrderDetailPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { NotificationsPage } from "@/pages/notifications/NotificationsPage";

// Merchant / Seller Studio Pages
import { MerchantStudioPage } from "@/pages/merchant/MerchantStudioPage";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30s cache
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Authentication */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Marketplace Application Layout */}
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/catalog" replace />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersListPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />

                    {/* Merchant Studio */}
                    <Route path="/merchant" element={<MerchantStudioPage />} />
                    <Route path="/vendor" element={<Navigate to="/merchant" replace />} />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/catalog" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}