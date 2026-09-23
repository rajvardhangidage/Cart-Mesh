import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Star,
  Store,
  ChevronRight,
  Zap,
} from "lucide-react";
import { productsApi } from "@/api/products";
import { inventoryApi } from "@/api/inventory";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, openDrawer } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Fetch product from backend
  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch live inventory
  const { data: inventory, isLoading: isInvLoading } = useQuery({
    queryKey: ["inventory", id],
    queryFn: () => inventoryApi.getByProductId(id!),
    enabled: !!id,
  });

  const availableStock = inventory?.available ?? 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product, quantity);
      openDrawer();
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product, quantity);
      navigate("/checkout");
    } finally {
      setAdding(false);
    }
  };

  if (isProductLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Product Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested product listing does not exist or has been removed by the merchant.
        </p>
        <Link to="/catalog">
          <Button variant="primary" size="md">
            Return to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/catalog" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/catalog?category=${product.category}`} className="hover:text-blue-600">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Product Visual & Description */}
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {product.category}
              </span>
              <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">4.9</span>
              <span className="text-slate-400">• 128 Verified Customer Reviews</span>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {formatCurrency(product.price)}
            </div>

            <div className="border-t border-slate-100 pt-6 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Product Details & Specifications
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description || "Premium quality merchandise sourced from verified marketplace merchants with manufacturer warranty."}
              </p>
            </div>

            {/* Merchant info */}
            <div className="border-t border-slate-100 pt-5 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <span className="text-slate-500">Sold by Verified Merchant:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  #{product.vendorId.slice(0, 8)}
                </span>
              </div>
              <span className="text-slate-400">Listed {formatDate(product.createdAt)}</span>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Card className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Free Delivery</h5>
                <p className="text-slate-500 text-[11px]">Dispatched within 24h</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Buyer Protection</h5>
                <p className="text-slate-500 text-[11px]">Guaranteed authentic</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">Easy Returns</h5>
                <p className="text-slate-500 text-[11px]">30-day refund window</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Buy Box */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 sticky top-24">
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-medium">Price</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(product.price)}
              </div>
            </div>

            {/* Stock Availability Indicator */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Stock Availability:
                </span>
                {isInvLoading ? (
                  <span className="text-xs text-slate-400">Verifying live stock...</span>
                ) : isOutOfStock ? (
                  <Badge variant="danger">
                    <XCircle className="w-3.5 h-3.5 mr-0.5" /> Out of Stock
                  </Badge>
                ) : availableStock < 10 ? (
                  <Badge variant="warning">
                    <AlertTriangle className="w-3.5 h-3.5 mr-0.5" /> Low Stock ({availableStock} left)
                  </Badge>
                ) : (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> In Stock ({availableStock} units)
                  </Badge>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2.5 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(availableStock || 99, q + 1))}
                    disabled={isOutOfStock || quantity >= availableStock}
                    className="p-2.5 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-slate-500">
                  Subtotal: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(product.price * quantity)}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-bold shadow-md shadow-blue-500/20"
                disabled={isOutOfStock}
                isLoading={adding}
                onClick={handleAddToCart}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                {isOutOfStock ? "Temporarily Sold Out" : "Add to Shopping Bag"}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="w-full text-sm font-bold"
                disabled={isOutOfStock}
                isLoading={adding}
                onClick={handleBuyNow}
                leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
              >
                Buy Now (Fast Checkout)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
