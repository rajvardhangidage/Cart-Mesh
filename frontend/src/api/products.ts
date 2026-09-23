import { apiClient } from "./client";
import { CreateProductPayload, Product, ProductPage, UpdateProductPayload } from "@/types/api";

export const productsApi = {
  list: async (params?: { q?: string; page?: number; size?: number }): Promise<ProductPage> => {
    const res = await apiClient.get<ProductPage>("/api/products", {
      params: {
        q: params?.q || "",
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return res.data;
  },

  getById: async (id: string): Promise<Product> => {
    const res = await apiClient.get<Product>(`/api/products/${id}`);
    return res.data;
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const res = await apiClient.post<Product>("/api/products", payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
    const res = await apiClient.put<Product>(`/api/products/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
};
