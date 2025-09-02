
import axios from 'axios';
export const API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000/api/v1';
import { getAuthState } from '@/store/auth.store';
// Initialize the Axios client
const apiClient = axios.create({
    baseURL: API_BASE_URL, // Replace with your API base URL
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
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
// Add request interceptor (optional)
apiClient.interceptors.request.use(
    (config) => {
        // console.log(`Sending request to ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        // console.error('Request error:', error.message);
        return Promise.reject(error);
    }
);

// Add response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // console.log(`Response received from ${response.config.url}:`, response.headers.sessionid, response.data);
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            await logout();
        } else if (error.response) {
            // Don't show toast here - let individual components handle their own error messages
            throw new Error(error.response.data.message || 'An error occurred');
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error); // Ensure error propagates
    }
);

const logout = async () => {
    //     const stringuser = localStorage.getItem('user')
    //     if (stringuser) {
    //         const user = JSON.parse(stringuser);
    //         await apiClient.post(constants.LOGOUT, { userId: user?.id },
    //             {
    //                 headers: {
    //                     logintoken: localStorage.getItem('token')
    //                 }
    //             });
    //     }
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.clear();
    window.location.href = "/login";
}

export default apiClient;
