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
    hasMore: boolean;
    totalCount: number;
    loadingMore: boolean;
}

type NotificationAction =
    | { type: 'SET_NOTIFICATIONS'; notifications: NotificationAttributes[]; totalCount: number; hasMore: boolean }
    | { type: 'ADD_NOTIFICATION'; notification: NotificationAttributes }
    | { type: 'APPEND_NOTIFICATIONS'; notifications: NotificationAttributes[]; hasMore: boolean }
    | { type: 'MARK_AS_READ'; id: string }
    | { type: 'MARK_ALL_AS_READ' }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_LOADING_MORE'; loadingMore: boolean };

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    hasMore: false,
    totalCount: 0,
    loadingMore: false,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
    switch (action.type) {
        case 'SET_NOTIFICATIONS':
            const notifications = Array.isArray(action.notifications) ? action.notifications : [];
            return {
                ...state,
                notifications,
                unreadCount: notifications.filter((n) => !n.is_read).length,
                totalCount: action.totalCount,
                hasMore: action.hasMore,
            };
        case 'APPEND_NOTIFICATIONS':
            const newNotifications = Array.isArray(action.notifications) ? action.notifications : [];
            const combinedNotifications = [...state.notifications, ...newNotifications];
            return {
                ...state,
                notifications: combinedNotifications,
                unreadCount: combinedNotifications.filter((n) => !n.is_read).length,
                hasMore: action.hasMore,
            };
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [action.notification, ...state.notifications],
                unreadCount: state.unreadCount + (action.notification.is_read ? 0 : 1),
                totalCount: state.totalCount + 1,
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
        case 'SET_LOADING_MORE':
            return { ...state, loadingMore: action.loadingMore };
        default:
            return state;
    }
}

interface NotificationContextType extends NotificationState {
    fetchNotifications: (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) => Promise<NotificationAttributes[]>;
    loadMoreNotifications: () => Promise<void>;
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
            // Update state immediately
            dispatch({ type: "ADD_NOTIFICATION", notification });
            // Update query cache in background for consistency
            queryClient.setQueryData(['notifications', { limit: 20, offset: 0 }], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    notifications: [notification, ...oldData.notifications],
                    totalCount: oldData.totalCount + 1,
                };
            });
        };

        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket]);

    // 🔹 Queries - Optimized for immediate UI updates
    const { data: notificationsData, isLoading: notificationsLoading } = useQuery<{
        notifications: NotificationAttributes[];
        totalCount: number;
        hasMore: boolean;
    }>({
        queryKey: ['notifications', { limit: 20, offset: 0 }],
        queryFn: async () => {
            const result = await notificationApi.getUserNotifications({ limit: 20, offset: 0 });
            // The API returns { success, message, data: { notifications: [...], totalCount: number, hasMore: boolean } }
            return {
                notifications: result.data?.notifications || result.notifications || [],
                totalCount: result.data?.totalCount || 0,
                hasMore: result.data?.hasMore || false,
            };
        },
        retry: 2,
        staleTime: 2 * 60 * 1000, // Reduced to 2 minutes for faster updates
        gcTime: 5 * 60 * 1000, // Reduced to 5 minutes
        enabled: !!user, // Only enable the query when user is authenticated
        refetchOnWindowFocus: false, // Disable refetch on window focus for better performance
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
            dispatch({ 
                type: 'SET_NOTIFICATIONS', 
                notifications: notificationsData.notifications,
                totalCount: notificationsData.totalCount,
                hasMore: notificationsData.hasMore,
            });
        }
    }, [notificationsData]);

    // 🔹 Mutations - Optimized for immediate UI updates
    const { mutateAsync: markAsReadMutationFn } = useMutation({
        mutationFn: async (id: string) => {
            const result = await notificationApi.markNotificationAsRead(id);
            return result.data;
        },
        retry: 2,
        onSuccess: (_, id) => {
            // Update UI immediately
            dispatch({ type: 'MARK_AS_READ', id });
            // Update query cache immediately without refetching
            queryClient.setQueryData(['notifications', { limit: 20, offset: 0 }], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    notifications: oldData.notifications.map((n: NotificationAttributes) =>
                        n.id === id ? { ...n, is_read: true } : n
                    )
                };
            });
            // Invalidate only unread count query
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
            // Update UI immediately
            dispatch({ type: 'MARK_ALL_AS_READ' });
            // Update query cache immediately without refetching
            queryClient.setQueryData(['notifications', { limit: 20, offset: 0 }], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    notifications: oldData.notifications.map((n: NotificationAttributes) => ({
                        ...n,
                        is_read: true
                    }))
                };
            });
            // Invalidate only unread count query
            queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
        },
    });

    // 🔹 Wrapped Actions - Optimized for immediate UI updates
    const fetchNotifications = async (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            
            // Direct API call for immediate UI update
            const result = await notificationApi.getUserNotifications(params || { limit: 20, offset: 0 });
            const data = {
                notifications: result.data?.notifications || result.notifications || [],
                totalCount: result.data?.totalCount || 0,
                hasMore: result.data?.hasMore || false,
            };
            
            // Update state immediately
            dispatch({ 
                type: 'SET_NOTIFICATIONS', 
                notifications: data.notifications,
                totalCount: data.totalCount,
                hasMore: data.hasMore,
            });
            
            // Update query cache in background for consistency
            queryClient.setQueryData(['notifications', params || { limit: 20, offset: 0 }], data);
            
            dispatch({ type: 'SET_LOADING', loading: false });
            return data.notifications;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch notifications.';
            throw new Error(errorMessage);
        }
    };

    const loadMoreNotifications = async () => {
        if (state.loadingMore || !state.hasMore) return;
        
        try {
            dispatch({ type: 'SET_LOADING_MORE', loadingMore: true });
            const offset = state.notifications.length;
            
            // Direct API call for immediate UI update
            const result = await notificationApi.getUserNotifications({ limit: 20, offset });
            const newNotifications = result.data?.notifications || result.notifications || [];
            const hasMore = result.data?.hasMore || false;
            
            // Update state immediately
            dispatch({ 
                type: 'APPEND_NOTIFICATIONS', 
                notifications: newNotifications,
                hasMore: hasMore,
            });
            
            // Update query cache in background for consistency
            queryClient.setQueryData(['notifications', { limit: 20, offset: 0 }], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    notifications: [...oldData.notifications, ...newNotifications],
                    hasMore: hasMore,
                };
            });
        } catch (error: any) {
            console.error('Failed to load more notifications:', error);
        } finally {
            dispatch({ type: 'SET_LOADING_MORE', loadingMore: false });
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
        loadMoreNotifications,
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
  