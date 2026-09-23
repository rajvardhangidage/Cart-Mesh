import { apiClient } from "./client";

export interface ActuatorHealth {
  status: "UP" | "DOWN" | "UNKNOWN";
  components?: Record<
    string,
    {
      status: "UP" | "DOWN" | "UNKNOWN";
      details?: Record<string, unknown>;
    }
  >;
}

export const gatewayApi = {
  getHealth: async (): Promise<ActuatorHealth> => {
    const res = await apiClient.get<ActuatorHealth>("/actuator/health");
    return res.data;
  },

  checkServiceHealth: async (servicePath: string): Promise<boolean> => {
    try {
      const res = await apiClient.get(servicePath, { timeout: 3000 });
      return res.status < 500;
    } catch {
      return false;
    }
  },
};
