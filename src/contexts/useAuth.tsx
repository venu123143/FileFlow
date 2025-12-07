import React, { useReducer, useContext, createContext, useCallback, type ReactNode } from 'react';
import { CONSTANTS } from '@/constants/constants';
import { useAuthStore } from '@/store/auth.store';
import { type IUser, type SignupDto, type GetAllUsersAttributes, type IUserListItem } from '@/types/user.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import authApi from '@/api/auth.api';
import { toast } from 'sonner';
import { useSocket } from "@/contexts/SocketContext";
export interface PinSessionData {
    user_id: string;
    email: string;
    pin_verified: boolean;
    verified_at: string;
}

const userStr = localStorage.getItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
const user = userStr ? JSON.parse(userStr) as IUser : null;

interface AuthState {
    user: IUser | null;
    loading: boolean;
    pinSession: PinSessionData | null;
}

type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; user: IUser }
    | { type: 'LOGOUT' }
    | { type: 'REGISTER_START' }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_PIN_SESSION'; pinSession: PinSessionData };

const initialState: AuthState = {
    user: user,
    loading: false,
    pinSession: null,
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
        case 'SET_PIN_SESSION':
            return { ...state, pinSession: action.pinSession };
        default:
            return state;
    }
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    saveUser: (user: IUser) => void;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
    logoutLoading: boolean;
    logoutAllLoading: boolean;
    VerifyEmail: (token: string) => Promise<boolean | undefined>;
    getAllUsers: (attributes: GetAllUsersAttributes) => Promise<IUserListItem[]>;
    setPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
    verifyPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
    changePin: (oldPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
    setPinLoading: boolean;
    verifyPinLoading: boolean;
    changePinLoading: boolean;
    getPinSession: () => Promise<{ success: boolean; user: IUser; session: PinSessionData } | { success: false; error: string }>;
    isPinSessionValid: () => boolean;
    getActiveSessions: () => Promise<any[]>;
    revokeToken: (refreshToken: string) => Promise<{ success: boolean; error?: string }>;
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
                setToken({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires_at: data.expires_at,
                    refresh_expires_at: data.refresh_expires_at
                });
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
        onError: () => {
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

    const { mutateAsync: setPinMutationFn, isPending: setPinLoading } = useMutation({
        mutationFn: async (pin: string) => {
            const result = await authApi.setPin(pin);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("PIN set successfully");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: verifyPinMutationFn, isPending: verifyPinLoading } = useMutation({
        mutationFn: async (pin: string) => {
            const result = await authApi.verifyPin(pin);
            return result.data;
        },
        onSuccess: (data) => {
            dispatch({ type: 'SET_LOADING', loading: false });
            // Update session state if session data is returned
            if (data?.session) {
                dispatch({ type: 'SET_PIN_SESSION', pinSession: data.session });
            }
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: changePinMutationFn, isPending: changePinLoading } = useMutation({
        mutationFn: async ({ oldPin, newPin }: { oldPin: string; newPin: string }) => {
            const result = await authApi.changePin(oldPin, newPin);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("PIN changed successfully");
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

    const setPin = async (pin: string) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await setPinMutationFn(pin);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to set PIN. Please try again.";
            return { success: false, error: errorMessage };
        }
    };

    const verifyPin = async (pin: string) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await verifyPinMutationFn(pin);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Invalid PIN. Please try again.";
            return { success: false, error: errorMessage };
        }
    };

    const changePin = async (oldPin: string, newPin: string) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await changePinMutationFn({ oldPin, newPin });
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to change PIN. Please try again.";
            return { success: false, error: errorMessage };
        }
    };

    const { mutateAsync: logoutAllMutationFn, isPending: logoutAllLoading } = useMutation({
        mutationFn: async () => {
            const result = await authApi.revokeAllTokens();
            return result.data;
        },
        onSuccess: () => {
            // Clear all local data and state
            localStorage.removeItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
            disconnectSocket();
            removeToken();
            dispatch({ type: 'LOGOUT' });
            queryClient.clear();
            toast.success("Logged out from all devices successfully");
        },
        onError: () => {
            toast.error("Failed to logout from all devices");
        },
    });

    const logoutAll = async () => {
        try {
            await logoutAllMutationFn();
        } catch (error) {
            console.error('Logout all error:', error);
        }
    };

    const getActiveSessions = async () => {
        try {
            const result = await authApi.getActiveSessions();
            return result.data?.sessions || [];
        } catch (error) {
            console.error('Get active sessions error:', error);
            return [];
        }
    };

    const revokeToken = async (refreshToken: string) => {
        try {
            await authApi.revokeToken(refreshToken);
            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to revoke session";
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const getPinSession = useCallback(async (): Promise<{ success: true; user: IUser; session: PinSessionData } | { success: false; error: string }> => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await authApi.getSession();
            dispatch({ type: 'SET_PIN_SESSION', pinSession: result.data.session });
            return { success: true as const, user: result.data.user, session: result.data.session };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to get PIN session. Please try again.";
            return { success: false as const, error: errorMessage };
        }
    }, []);

    const isPinSessionValid = (): boolean => {
        if (!state.pinSession || !state.pinSession.pin_verified) {
            return false;
        }

        const verifiedAt = new Date(state.pinSession.verified_at);
        const now = new Date();
        const diffInMinutes = (now.getTime() - verifiedAt.getTime()) / (1000 * 60);

        return diffInMinutes <= 20;
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        saveUser,
        logout,
        logoutAll,
        logoutLoading,
        logoutAllLoading,
        getAllUsers,
        VerifyEmail,
        setPin,
        verifyPin,
        changePin,
        setPinLoading,
        verifyPinLoading,
        changePinLoading,
        getPinSession,
        isPinSessionValid,
        getActiveSessions,
        revokeToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};