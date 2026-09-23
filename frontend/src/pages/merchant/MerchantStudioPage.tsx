import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/api/products";
import { inventoryApi } from "@/api/inventory";
import { ordersApi } from "@/api/orders";
import { Product, Order, OrderStatus } from "@/types/api";
import { DEFAULT_VENDOR_ID, useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { ProductFormModal } from "@/pages/vendor/ProductFormModal";
import { StockModal } from "@/pages/vendor/StockModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOrderStatusBadge } from "@/pages/orders/OrdersListPage";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Search,
  Box,
  TrendingUp,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
} from "lucide-react";

// Stock cell for catalog table
const MerchantStockCell: React.FC<{ productId: string; onAdjust: (stock: number) => void }> = ({
  productId,
  onAdjust,
}) => {
  const { data: inv, isLoading } = useQuery({
    queryKey: ["inventory", productId],
    queryFn: () => inventoryApi.getByProductId(productId),
  });

  if (isLoading) return <span className="text-xs text-slate-400">Loading...</span>;
  const stock = inv?.available ?? 0;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-bold text-xs ${
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
        className="rounded px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
      >
        Adjust
      </button>
    </div>
  );
};

export const MerchantStudioPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<string>("catalog");
  const [search, setSearch] = useState("");

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockCurrent, setStockCurrent] = useState<number>(0);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  // Fetch all products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => productsApi.list({ q: search, size: 50 }),
  });

  const products = productsData?.content || [];

  // Fetch orders
  const customerId = session?.userId || "11111111-2222-3333-4444-555555555555";
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => ordersApi.getByCustomerId(customerId),
  });

  // Soft-delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      success("Product removed from catalog");
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to remove product");
    },
  });

  // Update order fulfillment status mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      success("Order fulfillment status updated!");
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to update order");
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

  const tabs = [
    { id: "catalog", label: "Product Catalog", icon: <Package className="w-4 h-4" />, count: products.length },
    { id: "fulfillment", label: "Incoming Orders & Fulfillment", icon: <Truck className="w-4 h-4" />, count: orders.length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Merchant Studio
              </h1>
              <p className="text-xs text-slate-500">
                Manage your storefront catalog, allocate warehouse inventory, and fulfill customer shipments.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Business Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Catalog Listings
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {productsData?.totalElements || 0}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Live across all categories</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Orders Awaiting Dispatch
          </span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {orders.filter((o) => o.status === "PAID" || o.status === "PROCESSING").length}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Ready for carrier pickup</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Storefront Merchant Account
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {session?.email || "Merchant Partner"}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Seller Status
          </span>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Product Catalog Management */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="max-w-xs w-full">
              <Input
                placeholder="Filter by product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing {products.length} products
            </span>
          </div>

          {isProductsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <Package className="mx-auto h-10 w-10 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No products in catalog
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Start listing your merchandise by clicking &quot;Add New Product&quot;.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name & SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Warehouse Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">
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
                      <MerchantStockCell
                        productId={p.id}
                        onAdjust={(cur) => handleAdjustStock(p, cur)}
                      />
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
                            if (confirm(`Remove ${p.name} from your storefront?`)) {
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
        </div>
      )}

      {/* Tab 2: Incoming Orders & Fulfillment */}
      {activeTab === "fulfillment" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <Truck className="mx-auto h-10 w-10 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No orders pending fulfillment
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Customer purchases will appear here for packing and dispatch.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Ref</TableHead>
                  <TableHead>Date Placed</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Advance Fulfillment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(o.total)}
                    </TableCell>
                    <TableCell>{getOrderStatusBadge(o.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === "PAID" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderMutation.mutate({ id: o.id, status: "PROCESSING" })}
                          >
                            Mark Processing
                          </Button>
                        )}
                        {o.status === "PROCESSING" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateOrderMutation.mutate({ id: o.id, status: "SHIPPED" })}
                          >
                            Mark Shipped
                          </Button>
                        )}
                        {o.status === "SHIPPED" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateOrderMutation.mutate({ id: o.id, status: "DELIVERED" })}
                          >
                            Mark Delivered
                          </Button>
                        )}
                        {o.status === "DELIVERED" && (
                          <span className="text-xs font-semibold text-emerald-600">Fulfilled</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
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
