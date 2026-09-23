import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  Check,
  AlertTriangle,
  XCircle,
  Sparkles,
  Star,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { productsApi } from "@/api/products";
import { inventoryApi } from "@/api/inventory";
import { Product } from "@/types/api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Electronics",
  "Audio",
  "Accessories",
  "Apparel",
  "Home & Kitchen",
  "Fitness",
  "Furniture",
];

// Live stock status badge component for product cards
const LiveStockBadge: React.FC<{ productId: string }> = ({ productId }) => {
  const { data: inv, isLoading } = useQuery({
    queryKey: ["inventory", productId],
    queryFn: () => inventoryApi.getByProductId(productId),
    staleTime: 1000 * 20,
  });

  if (isLoading) {
    return <span className="h-5 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />;
  }

  const stock = inv?.available ?? null;

  if (stock === null) {
    return <Badge variant="secondary" size="sm">Available</Badge>;
  }

  if (stock <= 0) {
    return (
      <Badge variant="danger" size="sm">
        <XCircle className="w-3 h-3 mr-0.5" /> Out of Stock
      </Badge>
    );
  }

  if (stock < 10) {
    return (
      <Badge variant="warning" size="sm">
        <AlertTriangle className="w-3 h-3 mr-0.5" /> Only {stock} left
      </Badge>
    );
  }

  return (
    <Badge variant="success" size="sm">
      <Check className="w-3 h-3 mr-0.5" /> In Stock ({stock})
    </Badge>
  );
};

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high">("featured");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { addToCart, openDrawer } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  // Fetch products from real backend
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", searchQuery, page, pageSize],
    queryFn: () => productsApi.list({ q: searchQuery, page, size: pageSize }),
  });

  const rawProducts = data?.content || [];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result =
      selectedCategory === "All"
        ? [...rawProducts]
        : rawProducts.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [rawProducts, selectedCategory, sortBy]);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    setAddingId(product.id);
    try {
      await addToCart(product, 1);
      openDrawer();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Shopping Showcase */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Curated Multi-Vendor Marketplace
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Premium Brands & Verified Merchants.
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-xl">
            Discover cutting-edge electronics, precision equipment, ergonomic furnishings, and technical apparel with live stock availability and encrypted instant checkout.
          </p>
        </div>
      </div>

      {/* Filter, Search & Sorting Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="max-w-md w-full">
            <Input
              placeholder="Search product catalog by name or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Sort Dropdown & Results Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span className="text-slate-500 hidden md:inline">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span> items
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "featured" | "price-low" | "price-high")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="featured">Featured Catalog</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-44 bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900 dark:bg-red-950/20">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            Failed to load catalog: {(error as Error)?.message || "Service unavailable"}
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center dark:border-slate-800">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No products match your search
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or explore another department category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group block"
            >
              <Card className="h-full flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700">
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Category & Stock */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {product.category}
                      </span>
                      <LiveStockBadge productId={product.id} />
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description || "Verified catalog item from certified merchant."}
                    </p>

                    {/* Customer Rating Stars */}
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span className="text-slate-400 text-[11px] ml-1 font-medium">(4.9)</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        SKU: {product.sku}
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={addingId === product.id}
                      onClick={(e) => handleAddToCart(product, e)}
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      Add to Bag
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-500">
            Page <span className="font-bold text-slate-900 dark:text-white">{page + 1}</span> of{" "}
            <span className="font-bold text-slate-900 dark:text-white">{data.totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
