import React, { useReducer, useContext, createContext, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import notificationApi from '@/api/notification.api';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useSocket } from "@/hooks/useSocket";

// 🔹 Notification Types
export const NotificationType = {
    FILE_SHARED: "file_shared",
    FILE_UPDATED: "file_updated",
    FILE_UPLOAD_COMPLETED: "file_upload_completed",
    FILE_UPLOAD_FAILED: "file_upload_failed",
    MULTIPART_UPLOAD_COMPLETED: "multipart_upload_completed",
    MULTIPART_UPLOAD_FAILED: "multipart_upload_failed",
    FILE_DELETED: "file_deleted",
    STORAGE_QUOTA_WARNING: "storage_quota_warning",
    STORAGE_QUOTA_EXCEEDED: "storage_quota_exceeded",
    SHARE_EXPIRED: "share_expired",
    FILE_COMMENTED: "file_commented",
    PUBLIC_LINK_ACCESSED: "public_link_accessed",
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface NotificationAttributes {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    file_id?: string;
    related_user_id?: string;
    is_read: boolean;
    created_at: Date;
    data: Record<string, any>;
}

interface NotificationState {
    notifications: NotificationAttributes[];
    unreadCount: number;
    loading: boolean;
}

type NotificationAction =
    | { type: 'SET_NOTIFICATIONS'; notifications: NotificationAttributes[] }
    | { type: 'ADD_NOTIFICATION'; notification: NotificationAttributes }
    | { type: 'MARK_AS_READ'; id: string }
    | { type: 'MARK_ALL_AS_READ' }
    | { type: 'SET_LOADING'; loading: boolean };

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
    switch (action.type) {
        case 'SET_NOTIFICATIONS':
            const notifications = Array.isArray(action.notifications) ? action.notifications : [];
            return {
                ...state,
                notifications,
                unreadCount: notifications.filter((n) => !n.is_read).length,
            };
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [action.notification, ...state.notifications],
                unreadCount: state.unreadCount + (action.notification.is_read ? 0 : 1),
            };
        case 'MARK_AS_READ':
            return {
                ...state,
                notifications: state.notifications.map((n) =>
                    n.id === action.id ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            };
        case 'MARK_ALL_AS_READ':
            return {
                ...state,
                notifications: state.notifications.map((n) => ({
                    ...n,
                    is_read: true,
                })),
                unreadCount: 0,
            };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        default:
            return state;
    }
}

interface NotificationContextType extends NotificationState {
    fetchNotifications: () => Promise<NotificationAttributes[]>;
    markAsRead: (id: string) => Promise<{ success: boolean; error?: string }>;
    markAllAsRead: () => Promise<{ success: boolean; error?: string }>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { socket, initializeSocket } = useSocket();

    // Initialize socket on mount
    React.useEffect(() => {
        if (!user) return;
        initializeSocket();
    }, [initializeSocket]);

    // 🔹 Socket listener
    React.useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: NotificationAttributes) => {
            toast.success(`🔔 ${notification.title}`);
            dispatch({ type: "ADD_NOTIFICATION", notification });
        };

        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket]);

    // 🔹 Queries
    const { data: notificationsData, isLoading: notificationsLoading } = useQuery<NotificationAttributes[]>({
        queryKey: ['notifications'],
        queryFn: async () => {
            const result = await notificationApi.getUserNotifications();
            // The API returns { success, message, data: { notifications: [...] } }
            return result.data?.notifications || result.notifications || [];
        },
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!user, // Only enable the query when user is authenticated
    });

    // Note: Unread count is calculated from notifications array in the reducer
    // This query is kept for potential future use or if we need separate unread count endpoint
    useQuery<number>({
        queryKey: ['notificationsUnreadCount'],
        queryFn: async () => {
            const result = await notificationApi.getUnreadNotificationsCount();
            return result.data?.count || result.count || 0;
        },
        retry: 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!user, // Only enable the query when user is authenticated
    });

    // Update notifications in state when query data changes
    React.useEffect(() => {
        if (notificationsData) {
            dispatch({ type: 'SET_NOTIFICATIONS', notifications: notificationsData });
        }
    }, [notificationsData]);

    // 🔹 Mutations
    const { mutateAsync: markAsReadMutationFn } = useMutation({
        mutationFn: async (id: string) => {
            const result = await notificationApi.markNotificationAsRead(id);
            return result.data;
        },
        retry: 2,
        onSuccess: (_, id) => {
            dispatch({ type: 'MARK_AS_READ', id });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
        },
    });

    const { mutateAsync: markAllAsReadMutationFn } = useMutation({
        mutationFn: async () => {
            const result = await notificationApi.markAllNotificationsAsRead();
            return result.data;
        },
        retry: 2,
        onSuccess: () => {
            dispatch({ type: 'MARK_ALL_AS_READ' });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
        },
    });

    // 🔹 Wrapped Actions
    const fetchNotifications = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            // Refetch the query to get fresh data
            const data = await queryClient.fetchQuery({
                queryKey: ['notifications'],
                queryFn: async () => {
                    const result = await notificationApi.getUserNotifications();
                    return result.data?.notifications || result.notifications || [];
                },
            });
            dispatch({ type: 'SET_NOTIFICATIONS', notifications: data });
            dispatch({ type: 'SET_LOADING', loading: false });
            return data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch notifications.';
            throw new Error(errorMessage);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await markAsReadMutationFn(id);
            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to mark notification as read.';
            return { success: false, error: errorMessage };
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllAsReadMutationFn();
            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to mark all notifications as read.';
            return { success: false, error: errorMessage };
        }
    };

    const value: NotificationContextType = {
        ...state,
        loading: state.loading || notificationsLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
};
