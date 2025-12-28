import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import apiTokenApi, { type ApiToken, type GenerateTokenDto } from '@/api/api-token.api';
import { toast } from 'sonner';

interface ApiTokenContextType {
    tokens: ApiToken[];
    loading: boolean;
    fetchTokens: () => Promise<void>;
    generateToken: (data: GenerateTokenDto) => Promise<{ success: boolean; token?: ApiToken; error?: string }>;
    revokeToken: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const ApiTokenContext = createContext<ApiTokenContextType | undefined>(undefined);

export const ApiTokenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tokens, setTokens] = useState<ApiToken[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTokens = useCallback(async () => {
        setLoading(true);
        const response = await apiTokenApi.listTokens();
        setTokens(response.data);
        setLoading(false);
    }, []);

    const generateToken = async (data: GenerateTokenDto) => {
        try {
            if (tokens.length >= 3) {
                const error = "You can only generate up to 3 API tokens.";
                toast.error(error);
                return { success: false, error };
            }
            setLoading(true);
            const response = await apiTokenApi.generateToken(data);
            const newToken = response.data;

            // Add the new token to the list (or refetch)
            // Since the list endpoint might not return the full token (with secret), 
            // we might want to just refetch or append carefully.
            // The generate endpoint returns the full token object including the secret 'token' field.
            // The list endpoint does NOT return the secret 'token' field.

            // We'll append it to the list for display, but the user should copy the secret immediately.
            setTokens(prev => [newToken, ...prev]);

            toast.success("API Token generated successfully!");
            return { success: true, token: newToken };
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to generate token.";
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const revokeToken = async (id: string) => {
        try {
            setLoading(true);
            await apiTokenApi.revokeToken(id);
            setTokens(prev => prev.filter(t => t.id !== id));
            toast.success("API Token revoked successfully.");
            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to revoke token.";
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        tokens,
        loading,
        fetchTokens,
        generateToken,
        revokeToken,
    };

    return <ApiTokenContext.Provider value={value}>{children}</ApiTokenContext.Provider>;
};

export const useApiToken = () => {
    const context = useContext(ApiTokenContext);
    if (!context) {
        throw new Error('useApiToken must be used within an ApiTokenProvider');
    }
    return context;
};
