import React, { useReducer, useContext, createContext, type ReactNode } from 'react';
import { CONSTANTS } from '@/constants/constants';
import { useAuthStore } from '@/store/auth.store';
import { type IUser, type JwtToken } from '@/types/user.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import authApi from '@/api/auth.api';
const userStr = localStorage.getItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
const user = userStr ? JSON.parse(userStr) as IUser : null;

interface AuthState {
    user: IUser | null;
    loading: boolean;
}

type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; user: IUser }
    | { type: 'LOGOUT' }
    | { type: 'REGISTER_START' }
    | { type: 'SET_LOADING'; loading: boolean };

const initialState: AuthState = {
    user: user,
    loading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN_START':
        case 'REGISTER_START':
            return { ...state, loading: true };
        case 'LOGIN_SUCCESS':
            return { ...state, user: action.user, loading: false };
        case 'LOGOUT':
            return { ...state, user: null, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        default:
            return state;
    }
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ jwt: JwtToken; user: IUser } | undefined>;
    register: (data: any) => Promise<IUser | undefined>;
    saveUser: (user: IUser) => void;
    logout: () => void;
    VerifyEmail: (token: string) => Promise<boolean | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const { removeToken, setToken } = useAuthStore();
    const queryClient = useQueryClient();

    const saveUser = (user: IUser) => {
        dispatch({ type: 'LOGIN_SUCCESS', user: user });
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    };

    const { mutateAsync: loginMutationFn } = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const result = await authApi.login(email, password);
            return result.data;
        },
        onSuccess: (data) => {
            if (data) {
                saveUser(data.user);
                setToken(data.jwt);
                dispatch({ type: 'LOGIN_SUCCESS', user: data.user });
            }
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: registerMutationFn } = useMutation({
        mutationFn: async (data: any) => {
            const result = await authApi.register(data);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: verifyEmailMutationFn } = useMutation({
        mutationFn: async (token: string) => {
            const result = await authApi.verifyEmail(token);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const login = async (email: string, password: string) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const result = await loginMutationFn({ email, password });
            return result;
        } catch (error) {
            dispatch({ type: 'SET_LOADING', loading: false });
        }
    };

    const register = async (data: any) => {
        try {
            dispatch({ type: 'REGISTER_START' });
            const result = await registerMutationFn(data);
            return result;
        } catch (error) {
            dispatch({ type: 'SET_LOADING', loading: false });
        }
    };

    const VerifyEmail = async (token: string) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await verifyEmailMutationFn(token);
            return result;
        } catch (error) {
            dispatch({ type: 'SET_LOADING', loading: false });
        }
    };

    const logout = () => {
        localStorage.removeItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
        removeToken();
        dispatch({ type: 'LOGOUT' });
        queryClient.clear();
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        saveUser,
        logout,
        VerifyEmail,
    };

    return <AuthContext.Provider value={value}>{children},</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};