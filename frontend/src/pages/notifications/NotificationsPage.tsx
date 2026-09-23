import React from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatTimeAgo } from "@/lib/utils";
import { Bell, CheckCircle2, Clock, Mail } from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, isLoading } = useNotifications();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your order confirmations, carrier shipments, and account activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {unreadCount} Unread Alerts
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-16 text-center dark:border-slate-800">
          <Mail className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Your inbox is clear
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You have no notifications at this time. When you place an order, delivery updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-5 transition-all ${
                n.readFlag
                  ? "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                  : "bg-blue-50/50 border-blue-200 text-slate-900 font-medium dark:bg-blue-950/30 dark:border-blue-900"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={n.readFlag ? "secondary" : "default"}>
                      {n.type.replace("_", " ")}
                    </Badge>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {n.message}
                  </p>
                </div>

                {!n.readFlag && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(n.id)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
