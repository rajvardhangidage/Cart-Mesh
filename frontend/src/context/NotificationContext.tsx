import React, { createContext, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppNotification } from "@/types/api";
import { notificationsApi } from "@/api/notifications";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/Toast";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
  markAsRead: (id: string) => Promise<void>;
  sendNotification: (type: string, message: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const userId = session?.userId || "11111111-2222-3333-4444-555555555555";
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  // Poll notifications every 10 seconds for real-time alerts
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationsApi.listByUser(userId),
    refetchInterval: 10000,
    enabled: !!userId,
  });

  const unreadCount = notifications.filter((n) => !n.readFlag).length;

  // Mark as read mutation
  const readMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to update notification");
    },
  });

  const markAsRead = async (id: string) => {
    await readMutation.mutateAsync(id);
  };

  // Dispatch custom notification mutation
  const sendMutation = useMutation({
    mutationFn: ({ type, message }: { type: string; message: string }) =>
      notificationsApi.create({ userId, type, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      success("Notification sent!");
    },
    onError: (err: Error) => {
      toastError(err.message, "Failed to send notification");
    },
  });

  const sendNotification = async (type: string, message: string) => {
    await sendMutation.mutateAsync({ type, message });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isOpen,
        openNotifications: () => setIsOpen(true),
        closeNotifications: () => setIsOpen(false),
        toggleNotifications: () => setIsOpen((prev) => !prev),
        markAsRead,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
