import { apiClient } from "./client";
import { AddCartItemPayload, CartItem } from "@/types/api";

export const cartApi = {
  getCart: async (customerId: string): Promise<CartItem[]> => {
    const res = await apiClient.get<CartItem[]>(`/api/cart/${customerId}`);
    return res.data;
  },

  addItem: async (payload: AddCartItemPayload): Promise<CartItem> => {
    const res = await apiClient.post<CartItem>("/api/cart/items", payload);
    return res.data;
  },

  clearCart: async (customerId: string): Promise<void> => {
    await apiClient.delete(`/api/cart/${customerId}`);
  },
};
