import React, { createContext, useContext, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartItem, Product, Order } from "@/types/api";
import { cartApi } from "@/api/cart";
import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import { inventoryApi } from "@/api/inventory";
import { notificationsApi } from "@/api/notifications";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/Toast";

export type CheckoutStep =
  | "IDLE"
  | "CREATING_ORDER"
  | "PROCESSING_PAYMENT"
  | "UPDATING_STATUS"
  | "RESERVING_INVENTORY"
  | "SENDING_NOTIFICATION"
  | "CLEARING_CART"
  | "COMPLETED"
  | "FAILED";

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<Order | null>;
  checkoutStep: CheckoutStep;
  checkoutError: string | null;
  lastCreatedOrder: Order | null;
  resetCheckout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isCustomer } = useAuth();
  const customerId = session?.userId || "11111111-2222-3333-4444-555555555555";
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("IDLE");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Fetch cart items for current customer
  const { data: rawCartItems = [], isLoading } = useQuery({
    queryKey: ["cart", customerId],
    queryFn: () => cartApi.getCart(customerId),
    enabled: !!customerId,
  });

  // Calculate totals
  const itemCount = useMemo(
    () => rawCartItems.reduce((acc, item) => acc + item.quantity, 0),
    [rawCartItems]
  );

  const subtotal = useMemo(
    () => rawCartItems.reduce((acc, item) => acc + Number(item.unitPrice) * item.quantity, 0),
    [rawCartItems]
  );

  // Add item mutation
  const addMutation = useMutation({
    mutationFn: (payload: { productId: string; quantity: number; unitPrice: number }) =>
      cartApi.addItem({
        customerId,
        productId: payload.productId,
        quantity: payload.quantity,
        unitPrice: payload.unitPrice,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", customerId] });
      success("Added to cart");
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to add item");
    },
  });

  const addToCart = async (product: Product, quantity = 1) => {
    await addMutation.mutateAsync({
      productId: product.id,
      quantity,
      unitPrice: product.price,
    });
  };

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: () => cartApi.clearCart(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", customerId] });
      success("Cart cleared");
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to clear cart");
    },
  });

  const clearCart = async () => {
    await clearMutation.mutateAsync();
  };

  // Distributed Checkout Orchestration Workflow
  const checkout = async (): Promise<Order | null> => {
    if (rawCartItems.length === 0) {
      toastError("Your cart is empty", "Cannot checkout");
      return null;
    }

    setCheckoutError(null);

    try {
      // Step 1: Create Order
      setCheckoutStep("CREATING_ORDER");
      const order = await ordersApi.create({
        customerId,
        total: subtotal,
      });

      // Step 2: Capture Payment
      setCheckoutStep("PROCESSING_PAYMENT");
      const idempotencyKey = `pay-${order.id}-${Date.now()}`;
      await paymentsApi.pay({
        orderId: order.id,
        amount: subtotal,
        idempotencyKey,
      });

      // Step 3: Update Order Status to PAID
      setCheckoutStep("UPDATING_STATUS");
      const paidOrder = await ordersApi.updateStatus(order.id, "PAID");

      // Step 4: Reserve Inventory for each item
      setCheckoutStep("RESERVING_INVENTORY");
      for (const item of rawCartItems) {
        try {
          await inventoryApi.reserve(item.productId, item.quantity);
        } catch (invErr) {
          console.warn(`Inventory reservation warning for product ${item.productId}:`, invErr);
        }
      }

      // Step 5: Send Notification
      setCheckoutStep("SENDING_NOTIFICATION");
      try {
        await notificationsApi.create({
          userId: customerId,
          type: "ORDER_CONFIRMED",
          message: `Order #${order.id.slice(0, 8)} confirmed! Total $${subtotal.toFixed(2)} charged successfully.`,
        });
      } catch (notifErr) {
        console.warn("Notification dispatch warning:", notifErr);
      }

      // Step 6: Clear customer cart
      setCheckoutStep("CLEARING_CART");
      await cartApi.clearCart(customerId);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["cart", customerId] });
      queryClient.invalidateQueries({ queryKey: ["orders", customerId] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", customerId] });

      setLastCreatedOrder(paidOrder);
      setCheckoutStep("COMPLETED");
      success(`Order #${paidOrder.id.slice(0, 8)} completed!`, "Payment Successful");
      return paidOrder;
    } catch (err: unknown) {
      const errMsg = (err as Error).message || "Checkout transaction failed";
      setCheckoutError(errMsg);
      setCheckoutStep("FAILED");
      toastError(errMsg, "Checkout Failed");
      return null;
    }
  };

  const resetCheckout = () => {
    setCheckoutStep("IDLE");
    setCheckoutError(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: rawCartItems,
        isLoading,
        itemCount,
        subtotal,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        toggleDrawer: () => setIsDrawerOpen((prev) => !prev),
        addToCart,
        clearCart,
        checkout,
        checkoutStep,
        checkoutError,
        lastCreatedOrder,
        resetCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
