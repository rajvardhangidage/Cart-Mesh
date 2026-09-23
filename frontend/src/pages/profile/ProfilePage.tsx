import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UserRole } from "@/types/api";
import {
  User,
  ShoppingBag,
  ListOrdered,
  Store,
  MapPin,
  Mail,
  ShieldCheck,
  Check,
  ArrowRight,
  LogOut,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { session, role, switchRole, logout } = useAuth();
  const customerId = session?.userId || "11111111-2222-3333-4444-555555555555";
  const navigate = useNavigate();

  // Fetch orders count
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => ordersApi.getByCustomerId(customerId),
    enabled: !!customerId,
  });

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    if (newRole === "CUSTOMER") navigate("/catalog");
    else if (newRole === "VENDOR") navigate("/merchant");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-lg shadow-blue-500/20">
            {session?.email?.[0]?.toUpperCase() || "C"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {session?.email?.split("@")[0] || "Customer"}
              </h1>
              <Badge variant="default" className="capitalize">{role.toLowerCase()}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {session?.email}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          leftIcon={<LogOut className="w-3.5 h-3.5 text-red-500" />}
        >
          Sign Out
        </Button>
      </div>

      {/* Account Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Orders Placed</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{orders.length}</p>
          <Link to="/orders" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            View order history →
          </Link>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Amount Spent</span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(totalSpent)}</p>
          <span className="text-xs text-slate-400 mt-2 block">Across verified merchants</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Member Status</span>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Verified Shopper
          </p>
          <span className="text-xs text-slate-400 mt-2 block">ID: {customerId.slice(0, 12)}...</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Shipping Address */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Primary Delivery Address
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600">Default</span>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">Alex Morgan</p>
            <p>742 Evergreen Terrace</p>
            <p>Springfield, OR 97477</p>
            <p>United States</p>
          </div>
        </Card>

        {/* Persona Switcher */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Account Role & Switcher
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Easily toggle between customer and merchant view for testing.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => handleRoleChange("CUSTOMER")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                role === "CUSTOMER"
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Customer (Shopper Account)</span>
              </div>
              {role === "CUSTOMER" && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              onClick={() => handleRoleChange("VENDOR")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                role === "VENDOR"
                  ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <span>Merchant / Seller Studio</span>
              </div>
              {role === "VENDOR" && <Check className="w-4 h-4 text-purple-600" />}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
