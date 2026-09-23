import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/api/products";
import { inventoryApi } from "@/api/inventory";
import { useToast } from "@/components/ui/Toast";
import { Product } from "@/types/api";
import { DEFAULT_VENDOR_ID, useAuth } from "@/context/AuthContext";
import { Package, Plus } from "lucide-react";

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { success, error: toastError } = useToast();

  const isEditing = !!product;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number>(99.99);
  const [description, setDescription] = useState("");
  const [initialStock, setInitialStock] = useState<number>(25);
  const [vendorId, setVendorId] = useState(DEFAULT_VENDOR_ID);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setSku(product.sku);
      setPrice(product.price);
      setDescription(product.description || "");
      setVendorId(product.vendorId);
    } else {
      setName("");
      setCategory("Electronics");
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setPrice(49.99);
      setDescription("");
      setInitialStock(25);
      setVendorId(session?.userId || DEFAULT_VENDOR_ID);
    }
  }, [product, isOpen, session]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEditing && product) {
        return productsApi.update(product.id, {
          vendorId,
          name,
          category,
          sku,
          description,
          price: Number(price),
        });
      } else {
        const created = await productsApi.create({
          vendorId,
          name,
          category,
          sku,
          description,
          price: Number(price),
        });

        // Initialize inventory stock if provided
        if (initialStock > 0) {
          try {
            await inventoryApi.create({
              productId: created.id,
              quantity: initialStock,
            });
          } catch (invErr) {
            console.warn("Inventory initialization notice:", invErr);
          }
        }
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      success(isEditing ? "Product updated successfully" : "Product catalog entry created");
      onClose();
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to save product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toastError("Product name is required");
    if (!sku.trim()) return toastError("SKU is required");
    if (price <= 0) return toastError("Price must be positive");
    saveMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <span>{isEditing ? "Edit Catalog Product" : "Add New Catalog Product"}</span>
        </div>
      }
      description={
        isEditing
          ? "Update product pricing and specifications in Product Service :8082"
          : "Register a new item with automated SKU indexing and initial inventory stock"
      }
      maxWidth="md"
      footer={
        <div className="flex gap-2 justify-end w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={saveMutation.isPending}
            onClick={handleSubmit}
          >
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <Input
          label="Product Name"
          placeholder="e.g. Logitech MX Master 3S"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="Electronics">Electronics</option>
              <option value="Audio">Audio</option>
              <option value="Accessories">Accessories</option>
              <option value="Apparel">Apparel</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Fitness">Fitness</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>

          <Input
            label="SKU Code"
            placeholder="e.g. TECH-LOGI-01"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Unit Price ($)"
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            required
          />

          {!isEditing ? (
            <Input
              label="Initial Stock Allocation"
              type="number"
              min="0"
              value={initialStock}
              onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
              helperText="Auto-seeded to Inventory Service :8083"
            />
          ) : (
            <Input
              label="Vendor UUID"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              helperText="Assigned vendor identifier"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed specifications, warranty information, and package contents..."
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
      </form>
    </Modal>
  );
};
