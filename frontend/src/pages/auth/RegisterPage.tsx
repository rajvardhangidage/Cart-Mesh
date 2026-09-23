import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Layers, ArrowRight } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError("Please fill in all fields");
      return;
    }
    if (password.length < 8 || password.length > 72) {
      toastError("Password must be between 8 and 72 characters");
      return;
    }
    if (password !== confirmPassword) {
      toastError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register({ email, password });
      success("Account created and signed in!");
      navigate("/catalog");
    } catch (err: unknown) {
      toastError((err as Error).message || "Registration failed", "Sign Up Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-1">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Customer Account
          </h2>
          <p className="text-xs text-slate-500">
            Registers in Auth Service :8081 with BCrypt hash encryption.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Register & Sign In
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
