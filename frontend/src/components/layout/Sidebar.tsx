import React from "react";
import { NavLink } from "react-router-dom";
import {
  ShoppingBag,
  ListOrdered,
  Store,
  Layers,
  Activity,
  CreditCard,
  Bell,
  Box,
  TrendingUp,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, isCustomer, isVendor, isAdmin } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
      isActive
        ? "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/60 dark:text-blue-300"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-y-auto p-4 transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Section: Shopper Experience */}
          <div>
            <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Storefront
            </h5>
            <nav className="space-y-1">
              <NavLink to="/catalog" className={navItemClass} onClick={onClose}>
                <ShoppingBag className="w-4 h-4" />
                Product Catalog
              </NavLink>
              <NavLink to="/orders" className={navItemClass} onClick={onClose}>
                <ListOrdered className="w-4 h-4" />
                My Orders & Receipts
              </NavLink>
            </nav>
          </div>

          {/* Section: Merchant Operations */}
          <div>
            <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Vendor Portal
            </h5>
            <nav className="space-y-1">
              <NavLink to="/vendor" className={navItemClass} onClick={onClose}>
                <TrendingUp className="w-4 h-4" />
                Vendor Overview
              </NavLink>
              <NavLink to="/vendor/products" className={navItemClass} onClick={onClose}>
                <Box className="w-4 h-4" />
                Product Inventory
              </NavLink>
            </nav>
          </div>

          {/* Section: Platform Engineering / Admin */}
          <div>
            <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Platform & Microservices
            </h5>
            <nav className="space-y-1">
              <NavLink to="/admin" className={navItemClass} onClick={onClose}>
                <Activity className="w-4 h-4" />
                Gateway Health & APIs
              </NavLink>
              <NavLink to="/admin/payments" className={navItemClass} onClick={onClose}>
                <CreditCard className="w-4 h-4" />
                Payments Ledger Audit
              </NavLink>
              <NavLink to="/admin/notifications" className={navItemClass} onClick={onClose}>
                <Bell className="w-4 h-4" />
                Notification Dispatcher
              </NavLink>
            </nav>
          </div>

          {/* Persona Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50 text-xs">
            <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Context: {role}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Viewing system capabilities for {role.toLowerCase()} workflows. You can switch personas at any time from the top right avatar menu.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
