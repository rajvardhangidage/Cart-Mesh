import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/inventory";
import { useToast } from "@/components/ui/Toast";
import { Product } from "@/types/api";
import { Box, Plus, Minus, Check } from "lucide-react";

interface StockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currentStock?: number;
}

export const StockModal: React.FC<StockModalProps> = ({
  product,
  isOpen,
  onClose,
  currentStock = 0,
}) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [quantity, setQuantity] = useState<number>(10);
  const [action, setAction] = useState<"restock" | "reserve">("restock");

  const adjustMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      if (action === "restock") {
        return inventoryApi.release(product.id, quantity);
      } else {
        return inventoryApi.reserve(product.id, quantity);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", product?.id] });
      success(
        action === "restock"
          ? `Added ${quantity} units to inventory!`
          : `Reserved ${quantity} units from inventory!`
      );
      onClose();
    },
    onError: (err: Error) => {
      toastError(err.message, "Inventory adjustment failed");
    },
  });

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-blue-600" />
          <span>Adjust Stock Inventory</span>
        </div>
      }
      description={`Update stock allocation for ${product.name} (SKU: ${product.sku})`}
      maxWidth="sm"
      footer={
        <div className="flex gap-2 justify-end w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={adjustMutation.isPending}
            onClick={() => adjustMutation.mutate()}
          >
            Confirm {action === "restock" ? "Restock" : "Reserve"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2 text-xs">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <span className="text-slate-500">Current Available Stock</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {currentStock} units
          </span>
        </div>

        {/* Action Toggle */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Operation Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction("restock")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition-all ${
                action === "restock"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Restock (+Units)
            </button>
            <button
              type="button"
              onClick={() => setAction("reserve")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition-all ${
                action === "reserve"
                  ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
              }`}
            >
              <Minus className="w-3.5 h-3.5" /> Reserve (-Units)
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <Input
          label="Adjustment Units"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          required
        />
      </div>
    </Modal>
  );
};
