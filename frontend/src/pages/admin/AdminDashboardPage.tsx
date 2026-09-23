import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gatewayApi } from "@/api/gateway";
import { notificationsApi } from "@/api/notifications";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Activity,
  Server,
  ShieldCheck,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  Radio,
} from "lucide-react";

interface ServiceDescriptor {
  name: string;
  port: number;
  route: string;
  docsUrl: string;
  database: string;
  description: string;
}

const SERVICES: ServiceDescriptor[] = [
  {
    name: "API Gateway & Router",
    port: 8080,
    route: "/api/*",
    docsUrl: "/swagger-ui.html",
    database: "None (Stateless Gateway)",
    description: "Spring Cloud Gateway with CORS, route aggregation & unified Swagger",
  },
  {
    name: "Auth Service",
    port: 8081,
    route: "/api/auth/**",
    docsUrl: "/api/auth/v3/api-docs",
    database: "authdb (MySQL)",
    description: "BCrypt password encryption, JWT issuance, user security",
  },
  {
    name: "Product Service",
    port: 8082,
    route: "/api/products/**",
    docsUrl: "/api/products/v3/api-docs",
    database: "productdb (MySQL)",
    description: "Catalog management, SKU indexing, paginated search",
  },
  {
    name: "Inventory Service",
    port: 8083,
    route: "/api/inventory/**",
    docsUrl: "/api/inventory/v3/api-docs",
    database: "inventorydb (MySQL)",
    description: "Stock allocation, reservations, optimistic version locking",
  },
  {
    name: "Cart Service",
    port: 8084,
    route: "/api/cart/**",
    docsUrl: "/api/cart/v3/api-docs",
    database: "cartdb (MySQL)",
    description: "Multi-item customer carts and quantity persistence",
  },
  {
    name: "Order Service",
    port: 8085,
    route: "/api/orders/**",
    docsUrl: "/api/orders/v3/api-docs",
    database: "orderdb (MySQL)",
    description: "Order lifecycles, status state machine, customer history",
  },
  {
    name: "Payment Service",
    port: 8086,
    route: "/api/payments/**",
    docsUrl: "/api/payments/v3/api-docs",
    database: "paymentdb (MySQL)",
    description: "Idempotency enforcement, transaction capture & audit ledger",
  },
  {
    name: "Notification Service",
    port: 8087,
    route: "/api/notifications/**",
    docsUrl: "/api/notifications/v3/api-docs",
    database: "notificationdb (MySQL)",
    description: "Real-time user notifications and read flag tracking",
  },
];

export const AdminDashboardPage: React.FC = () => {
  const { session } = useAuth();
  const { success, error: toastError } = useToast();

  // Fetch Gateway Actuator Health
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ["gatewayHealth"],
    queryFn: () => gatewayApi.getHealth(),
    refetchInterval: 15000,
    retry: 1,
  });

  // Test Notification form state
  const [targetUserId, setTargetUserId] = useState(
    session?.userId || "11111111-2222-3333-4444-555555555555"
  );
  const [alertType, setAlertType] = useState("SYSTEM_ANNOUNCEMENT");
  const [alertMessage, setAlertMessage] = useState(
    "CartMesh platform update: All microservice endpoints are synchronized."
  );
  const [dispatching, setDispatching] = useState(false);

  const handleDispatchNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !alertMessage) return;
    setDispatching(true);
    try {
      await notificationsApi.create({
        userId: targetUserId,
        type: alertType,
        message: alertMessage,
      });
      success("Notification dispatched through Notification Service :8087");
    } catch (err: unknown) {
      toastError((err as Error).message, "Failed to dispatch");
    } finally {
      setDispatching(false);
    }
  };

  const isGatewayUp = health?.status === "UP";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform Engineering & System Diagnostics
            </h1>
            <Badge variant="default">Admin Control Plane</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, Spring Cloud Gateway status, distributed microservices topology, and notification dispatcher.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<Activity className="w-4 h-4 text-blue-600" />}
          >
            Refresh Health
          </Button>
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Unified Swagger UI
            </Button>
          </a>
        </div>
      </div>

      {/* Gateway Telemetry Status */}
      <Card className="p-6 border-blue-200 bg-gradient-to-r from-blue-50/60 to-white dark:border-blue-900 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isGatewayUp ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Spring Cloud API Gateway Status
                </h3>
                {isLoading ? (
                  <Badge variant="secondary">Probing...</Badge>
                ) : isGatewayUp ? (
                  <Badge variant="success">HEALTHY (UP)</Badge>
                ) : (
                  <Badge variant="warning">REACHABLE VIA PROXY</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Port 8080 • Actuator Health Check at <span className="font-mono">/actuator/health</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <div>
              <span className="block text-[10px] uppercase text-slate-400">Total Services</span>
              <span className="font-bold text-slate-900 dark:text-white">8 Nodes</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-400">Event Bus</span>
              <span className="font-bold text-slate-900 dark:text-white">Kafka :9092</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-400">Cache Layer</span>
              <span className="font-bold text-slate-900 dark:text-white">Redis :6379</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Microservices Topology Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Registered Microservices (8 Nodes)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((svc) => (
            <Card key={svc.name} className="p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="default" size="sm">:{svc.port}</Badge>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {svc.name}
                </h4>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 dark:border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Routing</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{svc.route}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Database</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{svc.database}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Admin Test Notification Dispatcher */}
      <Card className="p-6">
        <div className="max-w-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              Live Notification Dispatcher (Notification Service :8087)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Dispatch a test alert or system announcement to any user UUID.
            </p>
          </div>

          <form onSubmit={handleDispatchNotification} className="space-y-3 text-xs">
            <Input
              label="Recipient User UUID"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Alert Type
              </label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="SYSTEM_ANNOUNCEMENT">SYSTEM_ANNOUNCEMENT</option>
                <option value="ORDER_CONFIRMED">ORDER_CONFIRMED</option>
                <option value="PAYMENT_RECEIVED">PAYMENT_RECEIVED</option>
                <option value="STOCK_ALERT">STOCK_ALERT</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Message Content
              </label>
              <textarea
                rows={2}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={dispatching}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Dispatch Notification
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
