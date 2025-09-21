import React, { useReducer, useContext, createContext, type ReactNode } from 'react';
import { CONSTANTS } from '@/constants/constants';
import { useAuthStore } from '@/store/auth.store';
import { type IUser, type SignupDto, type GetAllUsersAttributes, type IUserListItem } from '@/types/user.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import authApi from '@/api/auth.api';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/useSocket';


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
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    saveUser: (user: IUser) => void;
    logout: () => Promise<void>;
    logoutLoading: boolean;
    VerifyEmail: (token: string) => Promise<boolean | undefined>;
    getAllUsers: (attributes: GetAllUsersAttributes) => Promise<IUserListItem[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const { removeToken, setToken } = useAuthStore();
    const queryClient = useQueryClient();
    const { disconnectSocket } = useSocket();

    // Initialize socket if user is already authenticated (page refresh scenario)
    // useEffect(() => {
    //     const initSocketIfAuthenticated = async () => {
    //         if (state.user && token?.jwt_token) {
    //             await initializeSocket();
    //         }
    //     };

    //     initSocketIfAuthenticated();
    // }, [state.user, token, initializeSocket]);

    const saveUser = (user: IUser) => {
        dispatch({ type: 'LOGIN_SUCCESS', user: user });
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    };

    const { mutateAsync: loginMutationFn } = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const result = await authApi.login(email, password);
            return result.data;
        },
        onSuccess: async (data) => {
            if (data) {
                saveUser(data.user);
                setToken(data.jwt);
                dispatch({ type: 'LOGIN_SUCCESS', user: data.user });
                toast.success("Login successful! Welcome back.");
            }
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });

        },
    });

    const { mutateAsync: registerMutationFn } = useMutation({
        mutationFn: async (data: SignupDto) => {
            const result = await authApi.register(data);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("Account created successfully! Please check your email to verify your account.");
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

    const { mutateAsync: logoutMutationFn, isPending: logoutLoading } = useMutation({
        mutationFn: async () => {
            const result = await authApi.logout();
            return result.data;
        },
        onSuccess: () => {
            // Clear all local data and state
            localStorage.removeItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
            disconnectSocket();
            removeToken();
            dispatch({ type: 'LOGOUT' });
            queryClient.clear();
            toast.success("Logged out successfully");
        },
        onError: (error) => {
            console.error('Logout error:', error);
            // Even if logout API fails, clear local data for security
            localStorage.removeItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
            disconnectSocket();
            removeToken();
            dispatch({ type: 'LOGOUT' });
            queryClient.clear();
            toast.success("Logged out successfully");
        },
    });

    const { mutateAsync: getAllUsersMutationFn } = useMutation({
        mutationFn: async (attributes: GetAllUsersAttributes) => {
            const result = await authApi.getAllUsers(attributes);
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
            await loginMutationFn({ email, password });
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Login failed. Please check your credentials.";
            return { success: false, error: errorMessage };
        }
    };

    const register = async (data: any) => {
        try {
            dispatch({ type: 'REGISTER_START' });
            await registerMutationFn(data);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Registration failed. Please try again.";
            return { success: false, error: errorMessage };
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

    const getAllUsers = async (attributes: GetAllUsersAttributes) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await getAllUsersMutationFn(attributes);
            return result?.users || [];
        } catch (error) {
            dispatch({ type: 'SET_LOADING', loading: false });
            console.error('Error fetching users:', error);
            return [];
        }
    };

    const logout = async () => {
        try {
            await logoutMutationFn();
        } catch (error) {
            // Error handling is already done in the mutation's onError callback
            console.error('Logout mutation error:', error);
        }
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        saveUser,
        logout,
        logoutLoading,
        getAllUsers,
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