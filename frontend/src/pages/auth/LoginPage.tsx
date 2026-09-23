import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Layers, ArrowRight, ShieldCheck, UserCheck, Sparkles, Store } from "lucide-react";
import { UserRole } from "@/types/api";

export const LoginPage: React.FC = () => {
  const { login, loginAsPersona } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      success("Logged in successfully!");
      navigate("/catalog");
    } catch (err: unknown) {
      toastError((err as Error).message || "Invalid credentials", "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = (role: UserRole) => {
    loginAsPersona(role);
    success(`Logged in as ${role} persona`);
    if (role === "CUSTOMER") navigate("/catalog");
    else if (role === "VENDOR") navigate("/vendor");
    else if (role === "ADMIN") navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-1">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            CartMesh Enterprise
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with Auth Service credentials or use quick-persona evaluation.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@cartmesh.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create customer account
            </Link>
          </div>

          {/* Persona evaluation shortcuts */}
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <span className="block text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              One-Click Persona Evaluation
            </span>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPersona("CUSTOMER")}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 p-2.5 hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                  Customer
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona("VENDOR")}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 p-2.5 hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
              >
                <Store className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                  Vendor
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona("ADMIN")}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 p-2.5 hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                  Admin
                </span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
