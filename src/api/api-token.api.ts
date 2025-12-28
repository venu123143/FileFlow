import apiClient from "@/api/axios";

export interface ApiToken {
    id: string;
    name: string;
    token?: string; // Only present when generated
    last_used_at?: string;
    usage_count: number;
    expires_at?: string;
    created_at: string;
    is_active: boolean;
}

export interface GenerateTokenDto {
    name: string;
    expires_at?: string;
}

const generateToken = async (data: GenerateTokenDto) => {
    try {
        const response = await apiClient.post('/api-token/generate', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const listTokens = async () => {
    try {
        const response = await apiClient.get('/api-token/list');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const revokeToken = async (id: string) => {
    try {
        const response = await apiClient.delete(`/api-token/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default { generateToken, listTokens, revokeToken };
