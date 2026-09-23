import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "@/pages/cart/CartDrawer";

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top E-Commerce Header */}
      <Navbar />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Global Slide-In Cart Drawer */}
      <CartDrawer />

      {/* Marketplace Footer */}
      <Footer />
    </div>
  );
};
