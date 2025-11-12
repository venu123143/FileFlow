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

const setPin = async (pin: string) => {
    try {
        const response = await apiClient.post('/auth/user/set-pin', { pin });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const verifyPin = async (pin: string) => {
    try {
        const response = await apiClient.post('/auth/user/verify-pin', { pin }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const changePin = async (oldPin: string, newPin: string) => {
    try {
        const response = await apiClient.put('/auth/user/change-pin', { old_pin: oldPin, new_pin: newPin });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getSession = async () => {
    try {
        const response = await apiClient.get('/auth/user/get-session', { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export default { login, register, verifyEmail, logout, getAllUsers, setPin, verifyPin, changePin, getSession };