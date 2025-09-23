import { useReducer, useContext, createContext, type ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import notificationApi from '@/api/notification.api';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useSocket } from "@/contexts/SocketContext";

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
    | { type: 'APPEND_NOTIFICATIONS'; notifications: NotificationAttributes[]; hasMore: boolean; totalCount?: number }
    | { type: 'MARK_AS_READ'; id: string }
    | { type: 'MARK_ALL_AS_READ' }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_LOADING_MORE'; loadingMore: boolean }
    | { type: 'UPDATE_UNREAD_COUNT'; count: number };

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: true,
    hasMore: false,
    totalCount: 0,
    loadingMore: false,
};

// Optimized reducer with better state management
const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
    switch (action.type) {
        case 'SET_NOTIFICATIONS': {
            const incoming = Array.isArray(action.notifications) ? action.notifications : [];
            // De-duplicate by id, preserve order
            const seenIds = new Set<string>();
            const notifications = incoming.filter(n => {
                if (seenIds.has(n.id)) return false;
                seenIds.add(n.id);
                return true;
            });
            const unreadCount = notifications.filter((n) => !n.is_read).length;
            return {
                ...state,
                notifications,
                unreadCount,
                totalCount: action.totalCount,
                hasMore: action.hasMore,
                loading: false,
            };
        }
        case 'APPEND_NOTIFICATIONS': {
            const newNotifications = Array.isArray(action.notifications) ? action.notifications : [];
            // Merge and de-duplicate by id
            const combined = [...state.notifications, ...newNotifications];
            const seenIds = new Set<string>();
            const combinedNotifications = combined.filter(n => {
                if (seenIds.has(n.id)) return false;
                seenIds.add(n.id);
                return true;
            });
            const unreadCount = combinedNotifications.filter((n) => !n.is_read).length;
            return {
                ...state,
                notifications: combinedNotifications,
                unreadCount,
                hasMore: action.hasMore,
                totalCount: action.totalCount ?? state.totalCount,
            };
        }
        case 'ADD_NOTIFICATION': {
            // Check for duplicates
            const exists = state.notifications.some(n => n.id === action.notification.id);
            if (exists) return state;

            const newNotifications = [action.notification, ...state.notifications];
            return {
                ...state,
                notifications: newNotifications,
                unreadCount: state.unreadCount + (action.notification.is_read ? 0 : 1),
                totalCount: state.totalCount + 1,
            };
        }
        case 'MARK_AS_READ': {
            const notifications = state.notifications.map((n) =>
                n.id === action.id ? { ...n, is_read: true } : n
            );
            const wasUnread = state.notifications.find(n => n.id === action.id && !n.is_read);
            return {
                ...state,
                notifications,
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
            };
        }
        case 'MARK_ALL_AS_READ': {
            return {
                ...state,
                notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
                unreadCount: 0,
            };
        }
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        case 'SET_LOADING_MORE':
            return { ...state, loadingMore: action.loadingMore };
        case 'UPDATE_UNREAD_COUNT':
            return { ...state, unreadCount: action.count };
        default:
            return state;
    }
};

interface NotificationContextType extends NotificationState {
    fetchNotifications: (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) => Promise<NotificationAttributes[]>;
    loadMoreNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<{ success: boolean; error?: string }>;
    markAllAsRead: () => Promise<{ success: boolean; error?: string }>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { socket, initializeSocket } = useSocket();

    // Memoized query key
    const notificationsQueryKey = useMemo(() => ['notifications', { limit: 20, offset: 0 }], []);


    useEffect(() => {
        if (!user) return;
        void initializeSocket();
    }, [user, initializeSocket]);

    // 🔹 Socket listener with improved error handling
    useEffect(() => {
        if (!socket) return;
 
        const handleNewNotification = (notification: NotificationAttributes) => {
            toast.success(`🔔 ${notification.title}`, {
                duration: 4000,
                position: 'top-right'
            });

            // Optimistic UI update first
            dispatch({ type: "ADD_NOTIFICATION", notification });
            // Show toast

            // Update query cache efficiently
            queryClient.setQueryData(notificationsQueryKey, (oldData: any) => {
                if (!oldData) return oldData;

                // Check for duplicates
                const exists = oldData.notifications.some((n: NotificationAttributes) => n.id === notification.id);
                if (exists) return oldData;

                return {
                    ...oldData,
                    notifications: [notification, ...oldData.notifications],
                    totalCount: oldData.totalCount + 1,
                };
            });
        };

        const handleNotificationRead = (notificationId: string) => {
            dispatch({ type: "MARK_AS_READ", id: notificationId });
        };

        socket.on("notification:new", handleNewNotification);
        socket.on("notification:read", handleNotificationRead);

        return () => {
            socket.off("notification:new", handleNewNotification);
            socket.off("notification:read", handleNotificationRead);
        };
    }, [socket, queryClient, notificationsQueryKey]);

    // 🔹 Optimized query with better caching
    const { data: notificationsData, isLoading: notificationsLoading, isRefetching, refetch } = useQuery({
        queryKey: notificationsQueryKey,
        queryFn: async () => {
            const result = await notificationApi.getUserNotifications({ limit: 20, offset: 0 });
            return {
                notifications: result.data?.notifications || result.notifications || [],
                totalCount: result.data?.totalCount || 0,
                hasMore: result.data?.hasMore || false,
            };
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!user,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    // Update notifications in state when query data changes
    useEffect(() => {
        if (!notificationsData) return;
        dispatch({
            type: 'SET_NOTIFICATIONS',
            notifications: notificationsData.notifications,
            totalCount: notificationsData.totalCount,
            hasMore: notificationsData.hasMore,
        });
    }, [notificationsData]);

    // keep local loading in sync with query loading states
    useEffect(() => {
        if (notificationsLoading || isRefetching) {
            dispatch({ type: 'SET_LOADING', loading: true });
        }
    }, [notificationsLoading, isRefetching]);

    // 🔹 Optimized mutations with immediate UI updates
    const { mutateAsync: markAsReadMutationFn } = useMutation({
        mutationFn: async (id: string) => {
            const result = await notificationApi.markNotificationAsRead(id);
            return result.data;
        },
        retry: 2,
        onMutate: async (id: string) => {
            // Optimistic update
            dispatch({ type: 'MARK_AS_READ', id });

            // Update query cache immediately
            const previousData = queryClient.getQueryData(notificationsQueryKey);
            queryClient.setQueryData(notificationsQueryKey, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    notifications: oldData.notifications.map((n: NotificationAttributes) =>
                        n.id === id ? { ...n, is_read: true } : n
                    )
                };
            });

            return { previousData };
        },
        onError: (_error, id, context) => {
            // Revert optimistic update on error
            if (context?.previousData) {
                queryClient.setQueryData(notificationsQueryKey, context.previousData);
                // Revert state
                const notification = state.notifications.find(n => n.id === id);
                if (notification) {
                    dispatch({ type: 'ADD_NOTIFICATION', notification: { ...notification, is_read: false } });
                }
            }
            toast.error('Failed to mark notification as read');
        }
    });

    const { mutateAsync: markAllAsReadMutationFn } = useMutation({
        mutationFn: async () => {
            const result = await notificationApi.markAllNotificationsAsRead();
            return result.data;
        },
        retry: 2,
        onMutate: async () => {
            // Optimistic update
            dispatch({ type: 'MARK_ALL_AS_READ' });

            // Update query cache immediately
            const previousData = queryClient.getQueryData(notificationsQueryKey);
            queryClient.setQueryData(notificationsQueryKey, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    notifications: oldData.notifications.map((n: NotificationAttributes) => ({
                        ...n,
                        is_read: true
                    }))
                };
            });

            return { previousData };
        },
        onError: (_error, _variables, context) => {
            // Revert optimistic update on error
            if (context?.previousData) {
                queryClient.setQueryData(notificationsQueryKey, context.previousData);
            }
            toast.error('Failed to mark all notifications as read');
        }
    });

    // 🔹 Optimized actions with better error handling
    const fetchNotifications = useCallback(async (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });

            const result = await notificationApi.getUserNotifications(params || { limit: 20, offset: 0 });
            const data = {
                notifications: result.data?.notifications || result.notifications || [],
                totalCount: result.data?.totalCount || 0,
                hasMore: result.data?.hasMore || false,
            };

            dispatch({
                type: 'SET_NOTIFICATIONS',
                notifications: data.notifications,
                totalCount: data.totalCount,
                hasMore: data.hasMore,
            });

            // Update query cache
            queryClient.setQueryData(notificationsQueryKey, data);

            return data.notifications;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch notifications.';
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }, [queryClient, notificationsQueryKey]);

    const loadMoreNotifications = useCallback(async () => {
        if (state.loadingMore || !state.hasMore) return;

        try {
            dispatch({ type: 'SET_LOADING_MORE', loadingMore: true });
            const offset = state.notifications.length;

            const result = await notificationApi.getUserNotifications({ limit: 20, offset });
            const newNotifications = result.data?.notifications || result.notifications || [];
            const hasMore = result.data?.hasMore || false;
            const totalCount = result.data?.totalCount || state.totalCount;

            // Immediate UI update
            dispatch({
                type: 'APPEND_NOTIFICATIONS',
                notifications: newNotifications,
                hasMore,
                totalCount,
            });

            // Update query cache in background
            queryClient.setQueryData(notificationsQueryKey, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    notifications: [...oldData.notifications, ...newNotifications],
                    hasMore,
                    totalCount,
                };
            });
        } catch (error: any) {
            console.error('Failed to load more notifications:', error);
            toast.error('Failed to load more notifications');
        } finally {
            // Ensure spinner hides only after state/cache are updated
            dispatch({ type: 'SET_LOADING_MORE', loadingMore: false });
        }
    }, [state.loadingMore, state.hasMore, state.notifications.length, state.totalCount, queryClient, notificationsQueryKey]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await markAsReadMutationFn(id);
            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to mark notification as read.';
            return { success: false, error: errorMessage };
        }
    }, [markAsReadMutationFn]);

    const markAllAsRead = useCallback(async () => {
        try {
            await markAllAsReadMutationFn();
            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to mark all notifications as read.';
            return { success: false, error: errorMessage };
        }
    }, [markAllAsReadMutationFn]);

    const refreshNotifications = useCallback(async () => {
        await refetch();
    }, [refetch]);

    // Memoized context value
    const value = useMemo<NotificationContextType>(() => ({
        ...state,
        loading: state.loading || notificationsLoading,
        fetchNotifications,
        loadMoreNotifications,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
    }), [
        state,
        notificationsLoading,
        fetchNotifications,
        loadMoreNotifications,
        markAsRead,
        markAllAsRead,
        refreshNotifications
    ]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
};