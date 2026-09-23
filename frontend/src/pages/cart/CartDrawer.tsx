import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isLoading,
    subtotal,
    itemCount,
    isDrawerOpen,
    closeDrawer,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    closeDrawer();
    navigate("/checkout");
  };

  const handleViewCartClick = () => {
    closeDrawer();
    navigate("/cart");
  };

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title={
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          <span>Shopping Bag</span>
          {itemCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              {itemCount} items
            </span>
          )}
        </div>
      }
      description="Items reserved in your active shopping session."
      width="md"
      footer={
        cartItems.length > 0 ? (
          <div className="w-full space-y-4">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Standard Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900 dark:text-white dark:border-slate-800">
                <span>Estimated Total</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleViewCartClick}
                className="flex-1"
              >
                View Full Bag
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCheckoutClick}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="flex-1 font-bold shadow-md shadow-blue-500/20"
              >
                Checkout Now
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center text-center p-4">
          <div className="rounded-2xl bg-slate-100 p-4 text-slate-400 dark:bg-slate-800 mb-3">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Your shopping bag is empty
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Discover verified items from top merchants in our marketplace.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              closeDrawer();
              navigate("/catalog");
            }}
          >
            Explore Catalog
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">
                    Qty: {item.quantity}
                  </span>
                  <span>×</span>
                  <span>{formatCurrency(item.unitPrice)}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(Number(item.unitPrice) * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};
