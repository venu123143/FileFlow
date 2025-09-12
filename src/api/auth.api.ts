import apiClient from "@/api/axios";
import { type GetAllUsersAttributes, type SignupDto } from "@/types/user.types";

const login = async (email: string, password: string) => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const register = async (data: SignupDto) => {
    try {
        const response = await apiClient.post('/auth/signup', data);
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

const logout = async () => {
    try {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getAllUsers = async (attributes: GetAllUsersAttributes) => {
    try {
        const response = await apiClient.get('/auth/user/all', { params: attributes });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export default { login, register, verifyEmail, logout, getAllUsers };