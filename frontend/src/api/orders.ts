import { apiClient } from "./client";
import { CreateOrderPayload, Order, OrderStatus } from "@/types/api";

export const ordersApi = {
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post<Order>("/api/orders", payload);
    return res.data;
  },

  getById: async (id: string): Promise<Order> => {
    const res = await apiClient.get<Order>(`/api/orders/${id}`);
    return res.data;
  },

  getByCustomerId: async (customerId: string): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>(`/api/orders/customer/${customerId}`);
    return res.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await apiClient.patch<Order>(
      `/api/orders/${id}/status`,
      null,
      { params: { value: status } }
    );
    return res.data;
  },
};
