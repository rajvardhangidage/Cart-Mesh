import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (params: { title?: string; message: string; type?: ToastType }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, message, type = "info" }: { title?: string; message: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => toast({ message, title, type: "success" }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ message, title, type: "error" }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ message, title, type: "info" }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300",
              t.type === "success" && "bg-white/95 border-emerald-200 text-slate-800 dark:bg-slate-900 dark:border-emerald-800",
              t.type === "error" && "bg-white/95 border-rose-200 text-slate-800 dark:bg-slate-900 dark:border-rose-800",
              t.type === "info" && "bg-white/95 border-sky-200 text-slate-800 dark:bg-slate-900 dark:border-sky-800",
              t.type === "warning" && "bg-white/95 border-amber-200 text-slate-800 dark:bg-slate-900 dark:border-amber-800"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />}
            {t.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm">
              {t.title && <h5 className="font-semibold text-slate-900 dark:text-white">{t.title}</h5>}
              <p className="text-slate-600 dark:text-slate-300">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
