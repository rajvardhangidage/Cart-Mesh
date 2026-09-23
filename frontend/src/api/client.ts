import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT Bearer token if available
apiClient.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem("cartmesh_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (err) {
    console.error("Failed to read auth token for request", err);
  }
  return config;
});

// Response interceptor to extract clean error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected server error occurred";

    // Attach human-readable message directly onto error object
    const enhancedError = new Error(customMessage);
    (enhancedError as unknown as { status?: number; raw?: unknown }).status = error.response?.status;
    (enhancedError as unknown as { status?: number; raw?: unknown }).raw = error.response?.data;
    return Promise.reject(enhancedError);
  }
);
