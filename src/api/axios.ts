import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAuthState, useAuthStore } from "@/store/auth.store";

export const API_BASE_URL =
    import.meta.env.VITE_API_BACKEND_URL || "http://localhost:3000/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 100000,
    withCredentials: true,
});

// ----------------------------
// Refresh Token Queue Handling
// ----------------------------
let isRefreshing = false;
interface IFailedQueueItem {
    resolve: (token: string) => void;
    reject: (error: any) => void;
}
let failedQueue: IFailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        error ? reject(error) : resolve(token as string);
    });
    failedQueue = [];
};

// ----------------------------
// Logout Utility
// ----------------------------
const logout = () => {
    useAuthStore.getState().removeToken();
    localStorage.clear();
    window.location.href = "/login";
};

// ----------------------------
// Refresh Token Function
// ----------------------------
const refreshAccessToken = async (): Promise<string> => {
    const { token } = getAuthState();
    if (!token?.refresh_token) throw new Error("No refresh token");

    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: token.refresh_token,
    });

    const { access_token, refresh_token, expires_at, refresh_expires_at } =
        res.data.data;

    useAuthStore.getState().setToken({
        access_token,
        refresh_token,
        expires_at,
        refresh_expires_at,
    });

    return access_token;
};

// ----------------------------
// Request Interceptor
// ----------------------------
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { token } = getAuthState();
    if (token?.access_token) {
        config.headers.Authorization = `Bearer ${token.access_token}`;
    }
    return config;
},
    (error) => Promise.reject(error)
);

// ----------------------------
// Response Interceptor
// ----------------------------
apiClient.interceptors.response.use((response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If unauthorized and token can be refreshed
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If refresh is already running -> queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (newToken) => {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            resolve(apiClient(originalRequest));
                        },
                        reject,
                    });
                });
            }

            // Start refresh
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();

                // Update queued requests
                processQueue(null, newToken);
                isRefreshing = false;

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError: any) {
                processQueue(refreshError, null);
                isRefreshing = false;
                logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
