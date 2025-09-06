
import axios from 'axios';
export const API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000/api/v1';
import { getAuthState } from '@/store/auth.store';
// Initialize the Axios client
const apiClient = axios.create({
    baseURL: API_BASE_URL, // Replace with your API base URL
    headers: { 'Content-Type': 'application/json' },
    timeout: 100000,
});

apiClient.interceptors.request.use(
    (config) => {
        const { token } = getAuthState();
        if (token?.jwt_token) {
            config.headers.Authorization = `Bearer ${token?.jwt_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
apiClient.interceptors.response.use(
    async (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            await logout();
        }
        return Promise.reject(error); // Ensure error propagates
    }
);



const logout = async () => {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.clear();
    window.location.href = "/login";
}

export default apiClient;
