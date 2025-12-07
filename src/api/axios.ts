
import axios from 'axios';
export const API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000/api/v1';
import { getAuthState, useAuthStore } from '@/store/auth.store';

// Initialize the Axios client
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 100000,
    withCredentials: true,
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

apiClient.interceptors.request.use(
    (config) => {
        const { token } = getAuthState();
        if (token?.access_token) {
            config.headers.Authorization = `Bearer ${token.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor with token refresh logic
apiClient.interceptors.response.use(
    async (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    const { token } = getAuthState();
                    if (token?.access_token) {
                        originalRequest.headers.Authorization = `Bearer ${token.access_token}`;
                    }
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const { token } = getAuthState();

            if (!token?.refresh_token) {
                // No refresh token available, logout
                isRefreshing = false;
                processQueue(error);
                await logout();
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh the token
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: token.refresh_token
                });

                const { access_token, refresh_token, expires_at, refresh_expires_at } = response.data.data;

                // Update the token in the store
                useAuthStore.getState().setToken({
                    access_token,
                    refresh_token,
                    expires_at,
                    refresh_expires_at
                });

                // Update the authorization header
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                isRefreshing = false;
                processQueue();

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                isRefreshing = false;
                processQueue(refreshError);
                await logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const logout = async () => {
    useAuthStore.getState().removeToken();
    localStorage.clear();
    window.location.href = "/login";
}

export default apiClient;
