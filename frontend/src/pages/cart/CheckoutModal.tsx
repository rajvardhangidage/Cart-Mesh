import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCart, CheckoutStep } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  PackageCheck,
  BellRing,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    checkoutStep,
    checkoutError,
    subtotal,
    lastCreatedOrder,
    resetCheckout,
    closeDrawer,
  } = useCart();
  const navigate = useNavigate();

  const isExecuting =
    checkoutStep !== "IDLE" &&
    checkoutStep !== "COMPLETED" &&
    checkoutStep !== "FAILED";

  const steps: { key: CheckoutStep; label: string; service: string; icon: React.ReactNode }[] = [
    {
      key: "CREATING_ORDER",
      label: "Create Order Document",
      service: "Order Service (:8085)",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      key: "PROCESSING_PAYMENT",
      label: "Capture Payment & Idempotency",
      service: "Payment Service (:8086)",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      key: "UPDATING_STATUS",
      label: "Mark Order Status to PAID",
      service: "Order Service (:8085)",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      key: "RESERVING_INVENTORY",
      label: "Reserve Product Stock",
      service: "Inventory Service (:8083)",
      icon: <PackageCheck className="w-4 h-4" />,
    },
    {
      key: "SENDING_NOTIFICATION",
      label: "Dispatch Order Confirmation Alert",
      service: "Notification Service (:8087)",
      icon: <BellRing className="w-4 h-4" />,
    },
  ];

  const getStepStatus = (stepKey: CheckoutStep) => {
    const order = [
      "CREATING_ORDER",
      "PROCESSING_PAYMENT",
      "UPDATING_STATUS",
      "RESERVING_INVENTORY",
      "SENDING_NOTIFICATION",
      "CLEARING_CART",
      "COMPLETED",
    ];
    const currentIndex = order.indexOf(checkoutStep);
    const stepIndex = order.indexOf(stepKey);

    if (checkoutStep === "COMPLETED") return "completed";
    if (checkoutStep === "FAILED" && currentIndex === stepIndex) return "failed";
    if (currentIndex > stepIndex) return "completed";
    if (currentIndex === stepIndex) return "in-progress";
    return "pending";
  };

  const handleViewOrder = () => {
    if (lastCreatedOrder) {
      onClose();
      closeDrawer();
      resetCheckout();
      navigate(`/orders/${lastCreatedOrder.id}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isExecuting) {
          onClose();
          resetCheckout();
        }
      }}
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Distributed Transaction Checkout</span>
        </div>
      }
      description="Real-time choreography across CartMesh microservices with 2PC/Saga style consistency."
      maxWidth="lg"
      footer={
        checkoutStep === "COMPLETED" ? (
          <div className="flex w-full items-center justify-between">
            <div className="text-xs text-slate-500">
              Total Settled: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  closeDrawer();
                  resetCheckout();
                  navigate("/orders");
                }}
              >
                All Orders
              </Button>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleViewOrder}
              >
                View Order Receipt
              </Button>
            </div>
          </div>
        ) : checkoutStep === "FAILED" ? (
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-red-600 font-medium">Transaction halted</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                resetCheckout();
              }}
            >
              Dismiss
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-5 py-2">
        {/* Total Badge */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Authorized Charge</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(subtotal)}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Instant Settlement
            </span>
          </div>
        </div>

        {/* Stepper progress list */}
        <div className="space-y-3">
          {steps.map((s, idx) => {
            const status = getStepStatus(s.key);
            return (
              <div
                key={s.key}
                className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                  status === "completed"
                    ? "border-emerald-200 bg-emerald-50/40 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200"
                    : status === "in-progress"
                    ? "border-blue-300 bg-blue-50/60 shadow-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                    : status === "failed"
                    ? "border-rose-200 bg-rose-50/40 text-rose-900 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200"
                    : "border-slate-200/60 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      status === "completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                        : status === "in-progress"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 animate-pulse"
                        : status === "failed"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                    }`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold">{s.label}</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.service}</p>
                  </div>
                </div>

                <div>
                  {status === "completed" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {status === "in-progress" && (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  )}
                  {status === "failed" && (
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  )}
                  {status === "pending" && (
                    <span className="text-[10px] text-slate-400 font-mono">Step {idx + 1}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Failure message */}
        {checkoutError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <AlertCircle className="w-4 h-4" />
              Workflow Execution Error:
            </div>
            <p>{checkoutError}</p>
          </div>
        )}

        {/* Success message */}
        {checkoutStep === "COMPLETED" && lastCreatedOrder && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Order Placed Successfully!
            </div>
            <p>
              Order reference <span className="font-mono font-bold">{lastCreatedOrder.id}</span> has been confirmed, paid, and reserved in stock.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
