import { apiClient } from "./client";
import { LoginResponse, RegisterResponse } from "@/types/api";

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>("/api/auth/login", credentials);
    return res.data;
  },

  register: async (credentials: { email: string; password: string }): Promise<RegisterResponse> => {
    const res = await apiClient.post<RegisterResponse>("/api/auth/register", credentials);
    return res.data;
  },
};
