import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ordersApi } from "@/api/orders";
import { useAuth } from "@/context/AuthContext";
import { Order, OrderStatus } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ListOrdered,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  ArrowRight,
  Receipt,
  ShoppingBag,
} from "lucide-react";

export const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
      return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Payment Confirmed</Badge>;
    case "PROCESSING":
      return <Badge variant="info"><Package className="w-3 h-3 mr-0.5" /> Processing Order</Badge>;
    case "SHIPPED":
      return <Badge variant="default"><Truck className="w-3 h-3 mr-0.5" /> In Transit / Shipped</Badge>;
    case "DELIVERED":
      return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Delivered</Badge>;
    case "CANCELLED":
      return <Badge variant="danger"><XCircle className="w-3 h-3 mr-0.5" /> Cancelled</Badge>;
    case "PENDING_PAYMENT":
    default:
      return <Badge variant="warning"><Clock className="w-3 h-3 mr-0.5" /> Payment Pending</Badge>;
  }
};

export const OrdersListPage: React.FC = () => {
  const { session } = useAuth();
  const customerId = session?.userId || "11111111-2222-3333-4444-555555555555";
  const [selectedTab, setSelectedTab] = useState<string>("ALL");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => ordersApi.getByCustomerId(customerId),
    enabled: !!customerId,
  });

  const filteredOrders =
    selectedTab === "ALL"
      ? orders
      : orders.filter((o) => o.status === selectedTab);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED" || o.status === "PAID").length;

  const tabs = [
    { id: "ALL", label: "All Orders", count: orders.length },
    { id: "PAID", label: "Paid", count: orders.filter((o) => o.status === "PAID").length },
    { id: "PROCESSING", label: "Processing", count: orders.filter((o) => o.status === "PROCESSING").length },
    { id: "SHIPPED", label: "In Transit", count: orders.filter((o) => o.status === "SHIPPED").length },
    { id: "DELIVERED", label: "Delivered", count: orders.filter((o) => o.status === "DELIVERED").length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-blue-600" />
            My Orders & Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track order delivery status, download invoices, and manage customer receipts.
          </p>
        </div>

        <Link to="/catalog">
          <Button variant="outline" size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Customer Spending Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Orders Placed</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{orders.length}</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Marketplace Spend</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(totalSpent)}</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirmed Deliveries</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{deliveredCount}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={selectedTab} onChange={setSelectedTab} />

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No orders found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {selectedTab === "ALL"
              ? "You haven't placed any marketplace orders yet."
              : `No orders in '${selectedTab.toLowerCase()}' status.`}
          </p>
          <Link to="/catalog" className="inline-block mt-4">
            <Button variant="primary" size="sm">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Date Placed</TableHead>
              <TableHead>Fulfillment Status</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                  <Link
                    to={`/orders/${order.id}`}
                    className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-400" />
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right text-xs font-bold text-slate-900 dark:text-white">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Receipt
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
