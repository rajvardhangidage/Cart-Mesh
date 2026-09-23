import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Bell,
  User,
  Store,
  ChevronDown,
  LogOut,
  Search,
  Check,
  ListOrdered,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/context/NotificationContext";
import { formatCurrency, formatTimeAgo } from "@/lib/utils";
import { UserRole } from "@/types/api";

export const Navbar: React.FC = () => {
  const { session, role, switchRole, logout } = useAuth();
  const { itemCount, subtotal, openDrawer: openCart } = useCart();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate(`/catalog`);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setUserMenuOpen(false);
    if (newRole === "CUSTOMER") navigate("/catalog");
    else if (newRole === "VENDOR") navigate("/merchant");
    else if (newRole === "ADMIN") navigate("/merchant");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      {/* Top promotional bar */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs font-medium text-white sm:px-6">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Multi-Vendor Marketplace: Free shipping on all verified seller products
        </span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link to="/catalog" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                CartMesh
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-medium">Multi-Vendor Store</span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/catalog"
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                location.pathname === "/catalog" || location.pathname === "/"
                  ? "text-blue-600 font-semibold bg-blue-50/60 dark:bg-blue-950/40 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Catalog
            </Link>
            <Link
              to="/orders"
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                location.pathname === "/orders"
                  ? "text-blue-600 font-semibold bg-blue-50/60 dark:bg-blue-950/40 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              My Orders
            </Link>
            <Link
              to="/merchant"
              className={`rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith("/merchant")
                  ? "text-blue-600 font-semibold bg-blue-50/60 dark:bg-blue-950/40 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Store className="w-4 h-4 text-purple-600" />
              Merchant Studio
            </Link>
          </nav>
        </div>

        {/* Center: Search input */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search products across all vendors..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950 transition-all"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifMenuOpen(!notifMenuOpen);
                setUserMenuOpen(false);
              }}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Notifications
                  </h4>
                  <Link
                    to="/notifications"
                    onClick={() => setNotifMenuOpen(false)}
                    className="text-[11px] text-blue-600 font-medium hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.readFlag && markAsRead(n.id)}
                        className={`p-2.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                          n.readFlag
                            ? "bg-slate-50/50 border-transparent text-slate-600 dark:bg-slate-800/40 dark:text-slate-400"
                            : "bg-blue-50/70 border-blue-100 text-slate-900 font-medium dark:bg-blue-950/30 dark:border-blue-900"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                            {n.type.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-800 px-1.5 text-[11px] font-bold text-white">
              {itemCount}
            </span>
            {itemCount > 0 && (
              <span className="hidden md:inline font-bold border-l border-blue-500 pl-2">
                {formatCurrency(subtotal)}
              </span>
            )}
          </button>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotifMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors shadow-sm"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] font-semibold text-slate-900 dark:text-white truncate max-w-[90px]">
                  {session?.email?.split("@")[0] || "Account"}
                </span>
                <span className="block text-[10px] text-slate-400 capitalize">
                  {role.toLowerCase()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {session?.email}
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {role.toLowerCase()} account
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    My Account Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
                    My Order History
                  </Link>

                  <Link
                    to="/merchant"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Store className="w-3.5 h-3.5 text-purple-600" />
                    Merchant Studio
                  </Link>
                </div>

                {/* Persona Switcher */}
                <div className="border-t border-slate-100 py-2 dark:border-slate-800">
                  <span className="block px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Persona
                  </span>

                  <button
                    onClick={() => handleRoleChange("CUSTOMER")}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>Shopper (Customer)</span>
                    {role === "CUSTOMER" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange("VENDOR")}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>Merchant (Seller)</span>
                    {role === "VENDOR" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
