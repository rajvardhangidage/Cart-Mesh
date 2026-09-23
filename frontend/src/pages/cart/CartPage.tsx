import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck } from "lucide-react";

export const CartPage: React.FC = () => {
  const { cartItems, isLoading, subtotal, itemCount, clearCart, addToCart } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Explore our multi-vendor catalog to find top products from verified merchants.
        </p>
        <Link to="/catalog" className="inline-block mt-2">
          <Button variant="primary" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Browse Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected items before proceeding to secure checkout.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={clearCart}
          leftIcon={<Trash2 className="w-4 h-4 text-slate-400" />}
        >
          Clear Shopping Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Items Table */}
        <div className="lg:col-span-8 space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-semibold text-sm text-slate-900 dark:text-white hover:text-blue-600 hover:underline block"
                      >
                        {item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                      </Link>
                      <span className="font-mono text-[11px] text-slate-400 block">
                        SKU: {item.product?.sku || item.productId.slice(0, 12)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(Number(item.unitPrice) * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Continue Shopping Link */}
          <div className="pt-2">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  FREE
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Estimated Total</span>
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full text-sm font-bold shadow-md shadow-blue-500/20"
              onClick={() => navigate("/checkout")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Checkout
            </Button>

            <div className="pt-2 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Free delivery on standard orders</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Guaranteed safe and encrypted checkout</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
