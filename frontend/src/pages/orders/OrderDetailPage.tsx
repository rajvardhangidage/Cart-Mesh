import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { OrderStatus } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOrderStatusBadge } from "./OrdersListPage";
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  ShoppingBag,
  Store,
} from "lucide-react";

const TRACKING_STEPS: { status: OrderStatus; title: string; desc: string }[] = [
  { status: "PENDING_PAYMENT", title: "Order Placed", desc: "Awaiting payment authorization" },
  { status: "PAID", title: "Payment Confirmed", desc: "Payment processed & stock secured" },
  { status: "PROCESSING", title: "Processing & Packing", desc: "Merchant preparing shipment" },
  { status: "SHIPPED", title: "Shipped & In Transit", desc: "Handed over to carrier" },
  { status: "DELIVERED", title: "Delivered", desc: "Package delivered to recipient" },
];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isVendor, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  // Fetch Order
  const {
    data: order,
    isLoading: isOrderLoading,
    error: orderError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  });

  // Fetch Payments
  const {
    data: payments = [],
    isLoading: isPaymentsLoading,
  } = useQuery({
    queryKey: ["payments", id],
    queryFn: () => paymentsApi.getByOrderId(id!),
    enabled: !!id,
  });

  // Mutation to update fulfillment status
  const statusMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) => ordersApi.updateStatus(id!, newStatus),
    onSuccess: (updated) => {
      queryClient.setQueryData(["order", id], updated);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      success(`Order status updated to ${updated.status}`);
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to update order status");
    },
  });

  if (isOrderLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Order Not Found
        </h2>
        <p className="text-xs text-slate-500">
          We could not find an order record with the specified reference number.
        </p>
        <Link to="/orders">
          <Button variant="primary" size="md">
            View All Orders
          </Button>
        </Link>
      </div>
    );
  }

  const stepKeys = TRACKING_STEPS.map((s) => s.status);
  const currentStepIndex = stepKeys.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            {getOrderStatusBadge(order.status)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {formatDate(order.createdAt)} • Customer ID: <span className="font-mono">{order.customerId.slice(0, 8)}</span>
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Paid</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {/* Delivery Tracking Stepper */}
      <Card className="p-6 sm:p-8 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Delivery & Fulfillment Progress
        </h3>

        {isCancelled ? (
          <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>This order was cancelled. Any associated payment authorization has been released.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {TRACKING_STEPS.map((step, idx) => {
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.status} className="flex flex-col sm:items-center sm:text-center space-y-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isCurrent
                        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : isPassed
                        ? "border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-950"
                        : "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    {isPassed && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <h5
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : isPassed
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Payment Settlement Receipt */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Payment Receipt & Authorization
        </h3>

        {isPaymentsLoading ? (
          <div className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
            Payment authorization pending.
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 dark:text-white">
                        Payment Authorized & Settled
                      </span>
                      <Badge variant="success" size="sm">CAPTURED</Badge>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Receipt ID: <span className="font-mono">{p.id}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 dark:text-white block">
                      {formatCurrency(p.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Settled on {formatDate(p.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Merchant / Admin Fulfillment Management Toolbar */}
      {(isVendor || isAdmin) && (
        <Card className="p-5 border-purple-200 bg-purple-50/40 dark:border-purple-900 dark:bg-purple-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  Merchant Order Fulfillment Controls
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update customer order fulfillment status as products are prepared and shipped.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={statusMutation.isPending || order.status === "PROCESSING"}
                onClick={() => statusMutation.mutate("PROCESSING")}
              >
                Mark Processing
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={statusMutation.isPending || order.status === "SHIPPED"}
                onClick={() => statusMutation.mutate("SHIPPED")}
              >
                Mark Shipped
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={statusMutation.isPending || order.status === "DELIVERED"}
                onClick={() => statusMutation.mutate("DELIVERED")}
              >
                Mark Delivered
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Customer Action: Cancel Order */}
      {!isCancelled && order.status !== "DELIVERED" && order.status !== "SHIPPED" && (
        <div className="pt-2 text-right">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            disabled={statusMutation.isPending}
            onClick={() => {
              if (confirm("Are you sure you want to cancel this order?")) {
                statusMutation.mutate("CANCELLED");
              }
            }}
          >
            Cancel This Order
          </Button>
        </div>
      )}
    </div>
  );
};
