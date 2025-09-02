import apiClient from "@/api/axios";

const login = async (email: string, password: string) => {
    try {
        const response = await apiClient.post('/login', { email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const register = async (data: any) => {
    try {
        const response = await apiClient.post('/register', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const verifyEmail = async (token: string) => {
    try {
        const response = await apiClient.post('/verify-email', { token });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export default { login, register, verifyEmail };