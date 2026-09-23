import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export const CheckoutPage: React.FC = () => {
  const { cartItems, subtotal, itemCount, checkout, clearCart } = useCart();
  const { session } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Form State
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Morgan");
  const [email, setEmail] = useState(session?.email || "alex.customer@cartmesh.io");
  const [address, setAddress] = useState("742 Evergreen Terrace");
  const [city, setCity] = useState("Springfield");
  const [state, setState] = useState("OR");
  const [zipCode, setZipCode] = useState("97477");

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "express">("card");
  const [cardName, setCardName] = useState("Alex Morgan");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const shippingFee = deliveryMethod === "express" ? 15.0 : 0.0;
  const estimatedTax = subtotal * 0.08; // 8% sales tax estimate
  const grandTotal = subtotal + shippingFee + estimatedTax;

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toastError("Your cart is empty", "Cannot place order");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Authorizing payment method & verifying stock...");

    try {
      // Orchestrate order creation, payment capture, status update, stock reservation, and notification
      const order = await checkout();
      if (order) {
        success("Payment confirmed! Your order has been placed.", "Order Confirmed");
        navigate(`/orders/${order.id}`);
      }
    } catch (err: unknown) {
      toastError((err as Error).message || "Transaction failed", "Order Failed");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs text-slate-500">
          Add some products from the marketplace before proceeding to checkout.
        </p>
        <Link to="/catalog">
          <Button variant="primary" size="md">
            Browse Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete your order with multi-vendor stock verification and encrypted settlement.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Checkout Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Shipping Address */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                  1
                </span>
                Shipping Address
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Verified Delivery</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address for Receipt"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Input
                label="State / Province"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input
                label="ZIP / Postal Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </div>
          </Card>

          {/* Step 2: Delivery Options */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                  2
                </span>
                Delivery Method
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">All items dispatched</span>
            </div>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === "standard"
                    ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === "standard"}
                    onChange={() => setDeliveryMethod("standard")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      Standard Ground Delivery (3–5 Business Days)
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Dispatched from verified merchant warehouses
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  FREE
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === "express"
                    ? "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === "express"}
                    onChange={() => setDeliveryMethod("express")}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      Express Priority Overnight (1–2 Days)
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Expedited tracking and courier dispatch
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  $15.00
                </span>
              </label>
            </div>
          </Card>

          {/* Step 3: Payment Method */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                  3
                </span>
                Payment Details
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted</span>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Cardholder Full Name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />

              <Input
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                leftIcon={<CreditCard className="w-4 h-4 text-slate-400" />}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expires"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  required
                />
                <Input
                  label="Security Code (CVV)"
                  type="password"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="•••"
                  required
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Order Summary ({itemCount} items)
            </h3>

            {/* Line items preview */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                    </p>
                    <p className="text-slate-400 font-mono text-[11px]">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(Number(item.unitPrice) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping & Handling</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(estimatedTax)}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900 dark:text-white dark:border-slate-800">
                <span>Total Amount Due</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Processing state indicator */}
            {isProcessing && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 space-y-1.5 animate-pulse">
                <div className="flex items-center gap-2 font-semibold">
                  <Clock className="w-4 h-4 animate-spin" />
                  Processing Your Order...
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400">
                  {processingStatus}
                </p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm font-bold shadow-md shadow-blue-500/20"
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Authorize & Place Order
            </Button>

            <div className="text-center">
              <p className="text-[11px] text-slate-400">
                By placing your order, you agree to CartMesh terms of purchase.
              </p>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
