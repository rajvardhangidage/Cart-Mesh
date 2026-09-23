import { apiClient } from "./client";
import { AppNotification, CreateNotificationPayload } from "@/types/api";

export const notificationsApi = {
  listByUser: async (userId: string): Promise<AppNotification[]> => {
    const res = await apiClient.get<AppNotification[]>(`/api/notifications/${userId}`);
    return res.data;
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    const res = await apiClient.patch<AppNotification>(`/api/notifications/${id}/read`);
    return res.data;
  },

  create: async (payload: CreateNotificationPayload): Promise<AppNotification> => {
    const res = await apiClient.post<AppNotification>("/api/notifications", payload);
    return res.data;
  },
};
