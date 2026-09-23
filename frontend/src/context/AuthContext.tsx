import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthSession, UserRole } from "@/types/api";
import { authApi } from "@/api/auth";

// Pre-configured vendor UUID from backend migrations (V2__seed.sql)
export const DEFAULT_VENDOR_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  role: UserRole;
  isCustomer: boolean;
  isVendor: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  loginAsPersona: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "cartmesh_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse saved session", e);
    }
    // Default guest customer session for seamless out-of-the-box browsing
    return {
      token: "demo-token",
      tokenType: "Bearer",
      userId: "11111111-2222-3333-4444-555555555555",
      email: "shopper@cartmesh.io",
      role: "CUSTOMER",
    };
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authApi.login(credentials);
    const newSession: AuthSession = {
      token: res.accessToken,
      tokenType: res.tokenType,
      userId: res.userId,
      email: credentials.email,
      role: (res.role as UserRole) || "CUSTOMER",
    };
    setSession(newSession);
  };

  const register = async (credentials: { email: string; password: string }) => {
    await authApi.register(credentials);
    await login(credentials);
  };

  const logout = () => {
    setSession(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (session) {
      setSession({
        ...session,
        role: newRole,
        // If switching to vendor, associate with the seeded vendor UUID
        userId:
          newRole === "VENDOR"
            ? DEFAULT_VENDOR_ID
            : newRole === "ADMIN"
            ? "00000000-0000-0000-0000-000000000001"
            : "11111111-2222-3333-4444-555555555555",
      });
    } else {
      loginAsPersona(newRole);
    }
  };

  const loginAsPersona = (role: UserRole) => {
    const personaMap: Record<UserRole, AuthSession> = {
      CUSTOMER: {
        token: "demo-customer-jwt",
        tokenType: "Bearer",
        userId: "11111111-2222-3333-4444-555555555555",
        email: "alex.customer@cartmesh.io",
        role: "CUSTOMER",
      },
      VENDOR: {
        token: "demo-vendor-jwt",
        tokenType: "Bearer",
        userId: DEFAULT_VENDOR_ID,
        email: "techcorp.vendor@cartmesh.io",
        role: "VENDOR",
      },
      ADMIN: {
        token: "demo-admin-jwt",
        tokenType: "Bearer",
        userId: "00000000-0000-0000-0000-000000000001",
        email: "admin@cartmesh.io",
        role: "ADMIN",
      },
    };
    setSession(personaMap[role]);
  };

  const role = session?.role || "CUSTOMER";
  const isAuthenticated = !!session;
  const isCustomer = role === "CUSTOMER";
  const isVendor = role === "VENDOR";
  const isAdmin = role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        role,
        isCustomer,
        isVendor,
        isAdmin,
        login,
        register,
        logout,
        switchRole,
        loginAsPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
