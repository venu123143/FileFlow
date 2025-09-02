import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type JwtToken } from '@/types/user.types';
// Define the interface for your Auth Store
interface IAuthStore {
    token: JwtToken | null;
    isAuthenticated: boolean;
    setToken: (token: JwtToken) => void;
    removeToken: () => void;
}

// Create the Zustand store for authentication
export const useAuthStore = create<IAuthStore>()(
    persist(
        (set) => ({
            token: null,
            isAuthenticated: false,

            // Action to set the token
            setToken: (token: JwtToken) => set({
                token,
                isAuthenticated: true
            }),

            // Action to remove the token
            removeToken: () => set({
                token: null,
                isAuthenticated: false
            }),

        }),
        {
            name: 'auth-storage', // Name for the storage in local storage
        }
    )
);

// Helper function to get the store state outside of React components
export const getAuthState = () => useAuthStore.getState();