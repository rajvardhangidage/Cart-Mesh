import { apiClient } from "./client";
import { CreatePaymentPayload, Payment } from "@/types/api";

export const paymentsApi = {
  pay: async (payload: CreatePaymentPayload): Promise<Payment> => {
    const res = await apiClient.post<Payment>("/api/payments", payload);
    return res.data;
  },

  getByOrderId: async (orderId: string): Promise<Payment[]> => {
    const res = await apiClient.get<Payment[]>(`/api/payments/order/${orderId}`);
    return res.data;
  },
};
