import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 mt-auto">
      {/* Value props banner */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Free Standard Shipping</h4>
                <p className="text-xs text-slate-500">On all marketplace orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Secure Payments</h4>
                <p className="text-xs text-slate-500">256-bit SSL encrypted checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">30-Day Hassle-Free Returns</h4>
                <p className="text-xs text-slate-500">Guaranteed customer satisfaction</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">24/7 Customer Support</h4>
                <p className="text-xs text-slate-500">Dedicated assistance anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                CM
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                CartMesh
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The unified multi-vendor commerce platform connecting verified merchants with millions of shoppers worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to="/catalog" className="hover:text-blue-600">All Products</Link></li>
              <li><Link to="/orders" className="hover:text-blue-600">My Orders</Link></li>
              <li><Link to="/cart" className="hover:text-blue-600">Shopping Cart</Link></li>
              <li><Link to="/profile" className="hover:text-blue-600">Customer Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              For Merchants
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to="/merchant" className="hover:text-blue-600">Merchant Studio</Link></li>
              <li><Link to="/merchant" className="hover:text-blue-600">Catalog Management</Link></li>
              <li><Link to="/merchant" className="hover:text-blue-600">Inventory Stocking</Link></li>
              <li><Link to="/merchant" className="hover:text-blue-600">Order Fulfillment</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><span className="hover:text-blue-600 cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Shipping & Delivery</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:border-slate-800">
          <p>© {new Date().getFullYear()} CartMesh Marketplace Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built with modern React & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
};
