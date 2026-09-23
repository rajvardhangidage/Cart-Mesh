import { apiClient } from "./client";
import { CreateInventoryPayload, Inventory } from "@/types/api";

export const inventoryApi = {
  getByProductId: async (productId: string): Promise<Inventory> => {
    const res = await apiClient.get<Inventory>(`/api/inventory/${productId}`);
    return res.data;
  },

  create: async (payload: CreateInventoryPayload): Promise<Inventory> => {
    const res = await apiClient.post<Inventory>("/api/inventory", payload);
    return res.data;
  },

  reserve: async (productId: string, quantity: number): Promise<Inventory> => {
    const res = await apiClient.post<Inventory>(
      `/api/inventory/${productId}/reserve`,
      null,
      { params: { quantity } }
    );
    return res.data;
  },

  release: async (productId: string, quantity: number): Promise<Inventory> => {
    const res = await apiClient.post<Inventory>(
      `/api/inventory/${productId}/release`,
      null,
      { params: { quantity } }
    );
    return res.data;
  },
};
