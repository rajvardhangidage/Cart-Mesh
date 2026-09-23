import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/api/products";
import { inventoryApi } from "@/api/inventory";
import { Product } from "@/types/api";
import { DEFAULT_VENDOR_ID, useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProductFormModal } from "./ProductFormModal";
import { StockModal } from "./StockModal";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Box,
  Layers,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// Component to fetch live stock for table row
const StockTableCell: React.FC<{ productId: string; onAdjust: (stock: number) => void }> = ({
  productId,
  onAdjust,
}) => {
  const { data: inv, isLoading } = useQuery({
    queryKey: ["inventory", productId],
    queryFn: () => inventoryApi.getByProductId(productId),
  });

  if (isLoading) return <span className="text-xs text-slate-400">Loading...</span>;
  const stock = inv ? inv.available : 0;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-semibold text-xs ${
          stock <= 0
            ? "text-red-600"
            : stock < 10
            ? "text-amber-600"
            : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {stock} units
      </span>
      <button
        onClick={() => onAdjust(stock)}
        className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        title="Adjust stock allocation"
      >
        Adjust
      </button>
    </div>
  );
};

export const VendorDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockCurrent, setStockCurrent] = useState<number>(0);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  // Fetch all active products
  const { data, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => productsApi.list({ q: search, size: 50 }),
  });

  const products = data?.content || [];

  // Soft-delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      success("Product deactivated successfully");
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to delete product");
    },
  });

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setProductModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleAdjustStock = (p: Product, current: number) => {
    setStockProduct(p);
    setStockCurrent(current);
    setStockModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vendor Catalog & Inventory Portal
            </h1>
            <Badge variant="default">Merchant Ops</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your multi-vendor product listings, SKUs, pricing, and live inventory allocations.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Catalog Items
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {data?.totalElements || 0}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Merchant Vendor Reference
          </p>
          <p className="font-mono text-xs text-blue-600 dark:text-blue-400 truncate mt-2">
            {session?.userId || DEFAULT_VENDOR_ID}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Product Database Sync
          </p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            MySQL productdb :8082 Live
          </p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="max-w-sm w-full">
          <Input
            placeholder="Search products by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <span className="text-xs text-slate-500">
          Showing {products.length} products
        </span>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <Package className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No products found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click &quot;Add New Product&quot; to list your first catalog item.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={handleCreate}
          >
            Create Product
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU & Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Vendor ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                      {p.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 block">
                      {p.sku}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{p.category}</Badge>
                </TableCell>
                <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                  {formatCurrency(p.price)}
                </TableCell>
                <TableCell>
                  <StockTableCell
                    productId={p.id}
                    onAdjust={(cur) => handleAdjustStock(p, cur)}
                  />
                </TableCell>
                <TableCell className="font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                  {p.vendorId}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(p)}
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to deactivate ${p.name}?`)) {
                          deleteMutation.mutate(p.id);
                        }
                      }}
                      title="Deactivate Product"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        product={editingProduct}
      />

      <StockModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        product={stockProduct}
        currentStock={stockCurrent}
      />
    </div>
  );
};
